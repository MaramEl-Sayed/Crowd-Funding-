from django.shortcuts import render
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.core.mail import send_mail
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.conf import settings
from rest_framework.views import APIView  # Correct import for APIView
from .models import User
from .serializers import RegisterSerializer

# Registration view
@api_view(['POST'])
def register_user(request):
    if request.method == 'POST':
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'Check your email for activation link!'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Activation view
@api_view(['GET'])
def activate_account(request, uidb64, token):
    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        return Response({'error': 'Invalid UID'}, status=status.HTTP_400_BAD_REQUEST)

    if default_token_generator.check_token(user, token):
        if user.is_active:
            return Response({'message': 'Account already activated'}, status=status.HTTP_200_OK)
        user.is_active = True
        user.is_activated = True  # Update the is_activated field
        user.save()
        return Response({'message': 'Account activated successfully'}, status=status.HTTP_200_OK)
    else:
        return Response({'error': 'Invalid or expired token'}, status=status.HTTP_400_BAD_REQUEST)

# Login view
@api_view(['POST'])
def login_user(request):
    email = request.data.get('email')
    password = request.data.get('password')

    user = authenticate(email=email, password=password)

    if user is not None:
        if not user.is_active:
            return Response({'error': 'Account is not activated yet!'}, status=status.HTTP_400_BAD_REQUEST)

        refresh = RefreshToken.for_user(user)

        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=status.HTTP_200_OK)

    return Response({'error': 'Invalid email or password'}, status=status.HTTP_401_UNAUTHORIZED)

# Password reset request view
class PasswordResetRequestView(APIView):
    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'error': 'User with this email does not exist'}, status=status.HTTP_400_BAD_REQUEST)

        # Generate token and UID
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))

        # Build the reset link (React frontend will handle the redirect)
        reset_link = f"{settings.FRONTEND_URL}/reset-password/{uid}/{token}/"

        # Send email
        send_mail(
            subject='Password Reset Request',
            message=f'Click the link to reset your password: {reset_link}',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            fail_silently=False,
        )

        return Response({'message': 'Password reset email sent'}, status=status.HTTP_200_OK)

# Password reset confirmation view
class PasswordResetConfirmView(APIView):  # Fixed: ApiView -> APIView
    def post(self, request):
        uidb64 = request.data.get('uid')
        token = request.data.get('token')
        new_password = request.data.get('new_password')

        if not all([uidb64, token, new_password]):
            return Response({'error': 'Missing required fields'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            uid = urlsafe_base64_decode(uidb64).decode()
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response({'error': 'Invalid UID'}, status=status.HTTP_400_BAD_REQUEST)

        if default_token_generator.check_token(user, token):
            user.set_password(new_password)
            user.save()
            return Response({'message': 'Password reset successful'}, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)