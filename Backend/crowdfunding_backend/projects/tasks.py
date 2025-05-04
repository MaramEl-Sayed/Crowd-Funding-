from celery import shared_task
from .models import Payment, Donation, Project
from django.conf import settings
import requests, logging, hmac, hashlib, time
from django.core.mail import send_mail

@shared_task
def verify_payment_task(order_id):
    try:
        max_retries = 3
        retry_delay = 5  # seconds

        logging.info(f"Starting verify_payment_task for order_id: {order_id}")

        # First, get the payment record from the database
        try:
            payment = Payment.objects.get(paymob_order_id=str(order_id))
            logging.info(f"Found payment record with order_id: {order_id}")
        except Payment.DoesNotExist:
            logging.error(f"No payment record found for order_id: {order_id}")
            return False

        for attempt in range(max_retries):
            logging.info(f"Attempt {attempt + 1} to verify payment for order_id: {order_id}")

            # Step 1: Get auth token
            auth_url = "https://accept.paymob.com/api/auth/tokens"
            auth_payload = {
                "api_key": settings.PAYMOB_API_KEY
            }
            auth_response = requests.post(auth_url, json=auth_payload)
            if auth_response.status_code not in [200, 201]:
                logging.error(f"Failed to get auth token: {auth_response.status_code} - {auth_response.text}")
                return None
            auth_data = auth_response.json()
            token = auth_data.get("token")
            if not token:
                logging.error("Auth token not found in response.")
                return None

            # Step 2: Check transaction status
            inquiry_url = "https://accept.paymob.com/api/ecommerce/orders/transaction_inquiry"
            headers = {
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            }
            inquiry_payload = {
                "order_id": order_id
            }
            inquiry_response = requests.post(inquiry_url, headers=headers, json=inquiry_payload)

            if inquiry_response.status_code == 404:
                logging.info(f"Transaction not found yet (attempt {attempt + 1}/{max_retries}). Waiting {retry_delay} seconds...")
                if attempt < max_retries - 1:  # Don't sleep on the last attempt
                    time.sleep(retry_delay)
                continue
            elif inquiry_response.status_code not in [200, 201]:
                logging.error(f"Transaction inquiry failed: {inquiry_response.status_code} - {inquiry_response.text}")
                return None

            transaction_data = inquiry_response.json()
            logging.info(f"Transaction data received: {transaction_data}")

            if transaction_data.get('success'):
                # Step 3: Trigger webhook manually
                webhook_url = "http://127.0.0.1:8000/api/projects/paymob/webhook/"
                webhook_data = {
                    "amount_cents": str(transaction_data.get('amount_cents')),
                    "currency": transaction_data.get('currency'),
                    "special_reference": transaction_data.get('merchant_order_id'),  # Use merchant_order_id from transaction data
                    "order": {
                        "id": str(order_id)
                    },
                    "payment_key": payment.paymob_payment_key,  # Use the payment key from database
                    "success": True
                }

                # Generate HMAC for webhook
                webhook_hmac_data = {
                    'amount_cents': webhook_data['amount_cents'],
                    'currency': webhook_data['currency'],
                    'special_reference': webhook_data['special_reference']
                }
                concat_str = ''.join(str(webhook_hmac_data.get(key, '')) for key in sorted(webhook_hmac_data.keys()))
                hmac_value = hmac.new(
                    settings.PAYMOB_SECRET_KEY.encode('utf-8'),
                    concat_str.encode('utf-8'),
                    hashlib.sha512
                ).hexdigest()

                headers = {
                    'Content-Type': 'application/json',
                    'HMAC': hmac_value
                }
                logging.info(f"Triggering webhook with data: {webhook_data} and headers: {headers}")
                webhook_response = requests.post(webhook_url, json=webhook_data, headers=headers)
                logging.info(f"Webhook response status: {webhook_response.status_code}, response text: {webhook_response.text}")
                if webhook_response.status_code in [200, 201]:
                    logging.info(f"Webhook triggered successfully for order_id: {order_id}")
                    # Update payment status directly
                    payment.status = 'paid'
                    payment.save()

                    # Create donation if not exists
                    if not payment.donation:
                        donation = Donation(
                            user=payment.user,
                            project=payment.project,
                            amount=payment.amount
                        )
                        donation.save()
                        payment.donation = donation

                        # Update project's total donations
                        project = payment.project
                        current_total = project.total_donations()
                        project.total_donations = current_total + payment.amount

                        # Check if project target is reached
                        if project.total_donations >= project.total_target and project.status != 'finished':
                            project.status = 'finished'
                            # Send email to project owner about completion
                            subject = f"Congratulations! Your project '{project.title}' has reached its target"
                            message = f"Your project '{project.title}' has successfully reached its donation target and is now finished."
                            send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [project.owner.email])

                        project.save()

                        # Send email to donor
                        donor_subject = f"Thank you for your donation to {project.title}"
                        donor_message = f"Thank you for your donation of ${payment.amount} to {project.title}. Your contribution makes a difference!"
                        send_mail(donor_subject, donor_message, settings.DEFAULT_FROM_EMAIL, [payment.user.email])

                    return True
                else:
                    logging.error(f"Webhook call failed: {webhook_response.status_code} - {webhook_response.text}")
                    return False
            return False

        logging.error(f"Transaction not found after {max_retries} attempts")
        return False
    except Exception as e:
        logging.error(f"Error in verify_payment_task: {str(e)}", exc_info=True)
        return False
