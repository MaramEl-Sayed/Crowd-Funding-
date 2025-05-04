from rest_framework.permissions import AllowAny
from rest_framework.exceptions import PermissionDenied
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions,generics
from django.shortcuts import get_object_or_404
from .models import Project, ProjectImage, Tag, Donation, Comment, Report, Rating, Category, Payment,Share
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

from django.conf import settings
import logging, uuid,requests
from django.core.mail import send_mail
from django.db.models import Count
from .serializers import (
    ProjectSerializer, TagSerializer, DonationSerializer,
    CommentSerializer, ReportSerializer, RatingSerializer, CategorySerializer,ShareSerializer
)


class ProjectListFinished(APIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    def get(self, request):
        category = request.query_params.get('category')
        search = request.query_params.get('search')
        if request.user.is_authenticated:
            projects = Project.objects.filter(owner=request.user)
        else:
            projects = Project.objects.filter(status='finished')
        if category:
            projects = projects.filter(category__name=category)
        if search:
            projects = projects.filter(title__icontains=search)
       
        serializer = ProjectSerializer(projects, many=True)
        return Response(serializer.data)
   

class ProjectListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    def get(self, request):
        category = request.query_params.get('category')
        search = request.query_params.get('search')
        if request.user.is_authenticated:
            projects = Project.objects.filter(owner=request.user)
        else:
            projects = Project.objects.filter(status='active')
        if category:
            projects = projects.filter(category__name=category)
        if search:
            projects = projects.filter(title__icontains=search)
       
        serializer = ProjectSerializer(projects, many=True)
        return Response(serializer.data)

   

    def post(self, request):
        serializer = ProjectSerializer(data=request.data)
        if serializer.is_valid():
            project = serializer.save(owner=request.user, status='waiting')

            # Send email to admin on project creation
            admin_emails = [admin[1] for admin in getattr(settings, 'ADMINS', [])]
            if admin_emails:
                subject = f"New Project Creation Request: {project.title}"
                message = f"A new project titled '{project.title}' with description '{project.details}' has been created by '{project.owner}' in '{project.category}' category and is awaiting approval."
                send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, admin_emails)

            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ProjectDetailUpdateDeleteView(APIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get(self, request, project_id):
        project = get_object_or_404(Project, id=project_id)
        serializer = ProjectSerializer(project)
        donations = DonationSerializer(project.donations.all(), many=True,context={'request': request})
        response_data = serializer.data
        response_data['donations'] = donations.data
        return Response(response_data)

    def put(self, request, project_id):
        project = get_object_or_404(Project, id=project_id)
        if project.owner != request.user:
            raise PermissionDenied("You do not have permission to edit this project.")
        serializer = ProjectSerializer(project, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, project_id):
        project = get_object_or_404(Project, id=project_id)
        if project.owner != request.user:
            raise PermissionDenied("You do not have permission to delete this project.")
        project.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class ProjectImageDeleteView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, project_id, image_id):
        project = get_object_or_404(Project, id=project_id)
        if project.owner != request.user:
            raise PermissionDenied("You do not have permission to delete images from this project.")
        image = get_object_or_404(ProjectImage, id=image_id, project=project)
        image.delete()
        return Response({"detail": "Image deleted successfully."}, status=status.HTTP_204_NO_CONTENT)

class CategoryListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        categories = Category.objects.all()
        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data)

class CategoryCreateView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request):
        serializer = CategorySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ProjectCancelView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request, project_id):
        project = get_object_or_404(Project, id=project_id)

        if project.owner != request.user:
            raise PermissionDenied("You do not have permission to cancel this project.")

        if not project.can_be_cancelled():
            return Response(
                {"detail": "Project cannot be cancelled as donations exceed 25% of the target."},
                status=status.HTTP_400_BAD_REQUEST
            )

        project.status = 'in-active'
        project.save()

        # Send email to user about cancellation
        subject = f"Your project '{project.title}' has been cancelled"
        message = f"Your project '{project.title}' has been cancelled successfully."
        send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [project.owner.email])

        return Response({"detail": "Project has been in-active."}, status=status.HTTP_200_OK)

class DonationCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = DonationSerializer(data=request.data)
        if serializer.is_valid():
            project = serializer.validated_data['project']
            amount = serializer.validated_data['amount']

            if not project.status['active']:
                return Response(
                    {'detail': 'Donations cannot be made to a in-active project.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            remaining_amount = project.total_target - project.total_donations()
            if amount > remaining_amount:
                return Response(
                    {'detail': f'Donation exceeds remaining project target. Maximum allowed: {remaining_amount}'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            donation = serializer.save(user=request.user)

            # Check if donation target reached or exceeded
            total_donations = project.total_donations()
            if total_donations >= project.total_target and project.status != 'finished':
                project.status = 'finished'
                project.save()

                # Send email to project owner about completion
                subject = f"Congratulations! Your project '{project.title}' has reached its target"
                message = f"Your project '{project.title}' has successfully reached its donation target and is now finished."
                send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [project.owner.email])

            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CommentListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get(self, request, project_id):
        comments = Comment.objects.filter(project__id=project_id, parent__isnull=True)
        serializer = CommentSerializer(comments, many=True)
        return Response(serializer.data)

    def post(self, request, project_id):
        project = get_object_or_404(Project, id=project_id)
        data = request.data.copy()
        data['project'] = project.id
        serializer = CommentSerializer(data=data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ReportCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ReportSerializer(data=request.data)
        if serializer.is_valid():
            report = serializer.save(user=request.user)
            # Notify admin user by email
            admin_emails = [admin[1] for admin in getattr(settings, 'ADMINS', [])]
            if admin_emails:
                subject = f"New {report.report_type} report submitted"
                message = f"Reporter: {report.user.username}\nReason: {report.reason}\n"
                if report.report_type == 'project' and report.project:
                    message += f"Project: {report.project.title}\n"
                elif report.report_type == 'comment' and report.comment:
                    message += f"Comment ID: {report.comment.id}\n"
                send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, admin_emails)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class SimilarProjectsView(generics.ListAPIView):
    serializer_class = ProjectSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        project_id = self.kwargs.get('project_id')
        try:
            project = Project.objects.get(id=project_id)
        except Project.DoesNotExist:
            return Project.objects.none()
        project_tags = project.tags.all()
        # Get projects that share tags with the current project, exclude the current project itself
        similar_projects = Project.objects.filter(tags__in=project_tags).exclude(id=project_id).distinct()
        # Optionally, order by number of shared tags descending
        similar_projects = similar_projects.annotate(shared_tags=Count('tags')).order_by('-shared_tags', '-start_time')
        return similar_projects

class RatingCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = RatingSerializer(data=request.data)
        if serializer.is_valid():
            project = serializer.validated_data['project']
            value = serializer.validated_data['value']
            rating, created = Rating.objects.get_or_create(
                project=project,
                user=request.user,
                defaults={'value': value}
            )
            if not created:
                # Update the existing rating
                rating.value = value
                rating.save()
                return Response(RatingSerializer(rating).data, status=status.HTTP_200_OK)
            return Response(RatingSerializer(rating).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
class ProjectRatingAverageView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, project_id):
        ratings = Rating.objects.filter(project__id=project_id)
        if not ratings.exists():
            return Response({"average_rating": None})
        average = round(sum(r.value for r in ratings) / len(ratings), 2)
        return Response({"average_rating": average})

class TagListView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        tags = Tag.objects.all()
        serializer = TagSerializer(tags, many=True)
        return Response(serializer.data)
class TopRatedProjectsView(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        projects = Project.get_top_rated_active_projects()
        serializer = ProjectSerializer(projects, many=True)
        return Response(serializer.data)
class LatestProjectsView(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        projects = Project.objects.filter(status='active').order_by('-start_time')[:5]
        serializer = ProjectSerializer(projects, many=True)
        return Response(serializer.data)
class UserDonationsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        donations = Donation.objects.filter(user=request.user)
        serializer = DonationSerializer(donations, many=True)
        return Response(serializer.data)
    
class LatestFeaturedProjectsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        projects = Project.get_latest_featured_projects()
        serializer = ProjectSerializer(projects, many=True)
        return Response(serializer.data)    
    
class ShareCreateView(generics.CreateAPIView):
    queryset = Share.objects.all()
    serializer_class = ShareSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        user = self.request.user if self.request.user.is_authenticated else None
        serializer.save(user=user)    



class PaymobIntentionCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        logging.info(f"PaymobIntentionCreateView POST called with path: {request.path} and data: {request.data}")
        user = request.user
        project_id = request.data.get('project')
        amount = request.data.get('amount')
        payment_methods = request.data.get('payment_methods', [settings.PAYMOB_INTEGRATION_ID_CARD,settings.PAYMOB_INTEGRATION_ID_WALLET,settings.PAYMOB_INTEGRATION_ID_CASH])
        items = request.data.get('items', [])
        billing_data = request.data.get('billing_data', {})
        notification_url = request.data.get('notification_url', '')
        redirection_url = request.data.get('redirection_url', '')

        # Fill missing billing_data fields from user profile if blank or missing
        if not billing_data.get('first_name'):
            billing_data['first_name'] = getattr(request.user, 'first_name', '') or request.user.username or 'NA'
        if not billing_data.get('last_name'):
            billing_data['last_name'] = getattr(request.user, 'last_name', '') or 'NA'
        if not billing_data.get('phone_number'):
            billing_data['phone_number'] = getattr(request.user, 'phone_number', '') or 'NA'
        if not billing_data.get('email'):
            billing_data['email'] = request.user.email or 'NA'
        if not billing_data.get('country'):
            billing_data['country'] = 'NA'
        if not billing_data.get('apartment'):
            billing_data['apartment'] = 'NA'
        if not billing_data.get('floor'):
            billing_data['floor'] = 'NA'
        if not billing_data.get('street'):
            billing_data['street'] = 'NA'
        if not billing_data.get('building'):
            billing_data['building'] = 'NA'
        if not billing_data.get('city'):
            billing_data['city'] = 'NA'
        if not billing_data.get('state'):
            billing_data['state'] = 'NA'

        if not project_id or not amount:
            return Response({'detail': 'Project and amount are required.'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            project = Project.objects.get(id=project_id)
        except Project.DoesNotExist:
            return Response({'detail': 'Project not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Prepare headers and payload for Intention API
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Token {settings.PAYMOB_SECRET_KEY}'
        }

        # Prepare items array with required fields if provided
        formatted_items = []
        for item in items:
            if 'name' in item and 'amount' in item:
                formatted_items.append({
                    'name': item['name'],
                    'amount': int(item['amount']),
                    'description': item.get('description', '')[:255],
                    'quantity': item.get('quantity', 1)
                })


        payload = {
            'amount': int(float(amount) * 100),  # amount in cents
            'currency': 'EGP',
            'payment_methods': payment_methods,
            'items': formatted_items if formatted_items else None,
            'billing_data': {
                'first_name': billing_data.get('first_name', user.username)[:50],
                'last_name': billing_data.get('last_name', 'NA')[:50],
                'email': billing_data.get('email', user.email),
                'phone_number': billing_data.get('phone_number', 'NA'),
                'country': billing_data.get('country', 'NA'),
                'apartment': billing_data.get('apartment', 'NA'),
                'floor': billing_data.get('floor', 'NA'),
                'street': billing_data.get('street', 'NA'),
                'building': billing_data.get('building', 'NA'),
                'city': billing_data.get('city', 'NA'),
                'state': billing_data.get('state', 'NA'),
            },
            'notification_url': notification_url,
            'redirection_url': redirection_url,
            'special_reference': f'project_{project_id}_user_{user.id}_{uuid.uuid4()}',
            'extras': request.data.get('extras', {}),
            'expiration': request.data.get('expiration', 3600)
        }

        # Remove items key if empty
        if not formatted_items:
            payload.pop('items', None)

        url = 'https://accept.paymob.com/v1/intention/'

        try:
            response = requests.post(url, headers=headers, json=payload)
            if response.status_code in [200, 201]:
                data = response.json()
                client_secret = data.get('client_secret')
                if not client_secret:
                    return Response({'detail': 'Failed to get client secret from Intention API.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

                # Save Payment record with status pending
                payment = Payment.objects.create(
                    user=user,
                    project=project,
                    amount=amount,
                    paymob_order_id=data.get('intention_order_id'), 
                    paymob_payment_key=client_secret,
                    status='pending'
                )

                # Return the full relevant data from the Paymob intention response along with public_key
                response_data = {
                    'payment_keys': data.get('payment_keys'),
                    'intention_order_id': data.get('intention_order_id'),
                    'id': data.get('id'),
                    'intention_detail': data.get('intention_detail'),
                    'client_secret': data.get('client_secret'),
                    'payment_methods': data.get('payment_methods'),
                    'special_reference': data.get('special_reference'),
                    'extras': data.get('extras'),
                    'confirmed': data.get('confirmed'),
                    'status': data.get('status'),
                    'created': data.get('created'),
                    'card_detail': data.get('card_detail'),
                    'card_tokens': data.get('card_tokens'),
                    'public_key': settings.PAYMOB_PUBLIC_KEY
                }
                return Response(response_data)
            else:
                logging.error(f"Paymob intention creation failed: {response.status_code} - {response.text}")
                return Response({'detail': 'Failed to create intention.', 'error': response.text}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            logging.error(f"Exception during Paymob intention creation: {str(e)}", exc_info=True)
            return Response({'detail': 'Error communicating with Intention API.', 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@method_decorator(csrf_exempt, name='dispatch')
class PaymobCallbackView(APIView):
    permission_classes = [AllowAny]  # Paymob will not be authenticated

    def post(self, request):
        data = request.data
        # Optionally: Validate HMAC here for security
        # print("Callback received:", data)  # Add this line for debugging
        # Extract order id

        paymob_order_id = None
        if 'obj' in data and 'order' in data['obj']:
            paymob_order_id = data['obj']['order'].get('id')
        elif 'order' in data:
            paymob_order_id = data['order'].get('id')
        else:
            paymob_order_id = data.get('order_id')

        # print("Looking for Payment with paymob_order_id:", paymob_order_id)

        # Extract success status
        success = False
        if 'obj' in data:
            success = data['obj'].get('success', False)
        elif 'success' in data:
            success = data.get('success', False)
       

        # Find the Payment record
        try:
            payment = Payment.objects.get(paymob_order_id=paymob_order_id)
        except Payment.DoesNotExist:
            return Response({'detail': 'Payment not found.'}, status=404)

        if success:
            # Mark payment as paid
            payment.status = 'paid'
            payment.save()
            # Create a Donation if not already created
            if not payment.donation:
                donation = Donation.objects.create(
                    user=payment.user,
                    project=payment.project,
                    amount=payment.amount
                )
                payment.donation = donation
                payment.save()
                # Send thank you email to the user (donor)
                subject_user = "Thank you for your donation!"
                message_user = (
                    f"Dear {payment.user.username},\n\n"
                    f"Thank you for your generous donation of {payment.amount} EGP to the campaign '{payment.project.title}'.\n"
                    "Your support is greatly appreciated!"
                )
                send_mail(
                    subject_user,
                    message_user,
                    settings.DEFAULT_FROM_EMAIL,
                    [payment.user.email],
                    fail_silently=True,
                )

                # Send notification email to the admin(s)
                admin_emails = [admin[1] for admin in getattr(settings, 'ADMINS', [])]
                if admin_emails:
                    subject_admin = f"New Donation Received for '{payment.project.title}'"
                    message_admin = (
                        f"A new donation of {payment.amount} EGP was made by {payment.user.username} "
                        f"to the campaign '{payment.project.title}'."
                    )
                send_mail(
                subject_admin,
                message_admin,
                settings.DEFAULT_FROM_EMAIL,
                admin_emails,
                fail_silently=True,
                )    
        else:
            payment.status = 'failed'
            payment.save()

        return Response({'status': 'ok'})
         