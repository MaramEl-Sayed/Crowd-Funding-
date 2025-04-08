from django.core.mail import send_mail
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.contrib.auth.tokens import default_token_generator

def  send_activation_email(user):
    uid=urlsafe_base64_encode(force_bytes(user.pk))
    token=default_token_generator.make_token(user)
    activiation_link=f"http://localhost:3000/activate/{uid}/{token}"
    send_mail(
        'Activate Your Account',
        f'Click this link to activate: {activiation_link}',
        'areghagag449@gmail.com',
        [user.email],
        fail_silently=False,
    )