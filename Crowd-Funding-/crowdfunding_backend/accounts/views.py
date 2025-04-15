import requests
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
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from allauth.socialaccount.models import SocialAccount
from .models import User
from .serializers import RegisterSerializer, UserProfileSerializer
from django.core.files.base import ContentFile

# Email check view
class CheckEmailView(APIView):
    def get(self, request):
        email = request.query_params.get('email')
        if not email:
            return Response({"error": "Email is required"}, status=status.HTTP_400_BAD_REQUEST)
        exists = User.objects.filter(email=email).exists()
        return Response({"exists": exists})

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
        user.is_activated = True
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
class PasswordResetConfirmView(APIView):
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

# Password change view
class PasswordChangeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        new_password = request.data.get('new_password')
        if not new_password:
            return Response({'error': 'New password is required'}, status=status.HTTP_400_BAD_REQUEST)

        if len(new_password) < 8:
            return Response({'error': 'Password must be at least 8 characters'}, status=status.HTTP_400_BAD_REQUEST)

        user = request.user
        user.set_password(new_password)
        user.save()
        return Response({'message': 'Password changed successfully'}, status=status.HTTP_200_OK)

# Social login views
@api_view(['POST'])
def facebook_login(request):
    try:
        access_token = request.data.get('access_token')
        if not access_token:
            return Response({'error': 'Access token is required'}, status=status.HTTP_400_BAD_REQUEST)

        # Verify token with Facebook and get user info
        response = requests.get(f'https://graph.facebook.com/me?access_token={access_token}&fields=id,name,email')
        if response.status_code != 200:
            return Response({'error': 'Invalid Facebook access token'}, status=status.HTTP_400_BAD_REQUEST)

        user_info = response.json()
        if not user_info.get('email'):
            return Response(
                {'error': 'Email not provided by Facebook'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if the user exists
        try:
            user = User.objects.get(email=user_info['email'])
        except User.DoesNotExist:
            return Response(
                {'error': 'Account does not exist. Please register first.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def google_login(request):
    try:
        token = request.data.get('access_token')
        token_type = request.data.get('token_type', 'access_token')
        profile_picture_url = request.data.get('profile_picture')

        if not token:
            return Response({'error': 'Token is required'}, status=status.HTTP_400_BAD_REQUEST)

        # Handle both access tokens and ID tokens
        if token_type == 'id_token':
            response = requests.get(
                f'https://oauth2.googleapis.com/tokeninfo?id_token={token}'
            )
        else:
            response = requests.get(
                f'https://www.googleapis.com/oauth2/v3/userinfo?access_token={token}'
            )

        if response.status_code != 200:
            return Response(
                {'error': 'Invalid Google token'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user_info = response.json()
        if not user_info.get('email'):
            return Response(
                {'error': 'Email not provided by Google'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if the user exists
        try:
            user = User.objects.get(email=user_info['email'])
        except User.DoesNotExist:
            return Response(
                {'error': 'Account does not exist. Please register first.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Ensure existing user is activated
        if not user.is_activated:
            user.is_activated = True
            user.save()

        # Update profile picture if provided
        if profile_picture_url:
            try:
                image_response = requests.get(profile_picture_url)
                if image_response.status_code == 200:
                    filename = f"{user.username}_profile.jpg"
                    user.profile_picture.save(filename, ContentFile(image_response.content), save=True)
            except Exception as e:
                print(f"Error updating profile picture: {e}")

        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

# User Profile Views
class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        serializer = UserProfileSerializer(user)
        return Response(serializer.data)

    def patch(self, request):
        user = request.user
        serializer = UserProfileSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request):
        password = request.data.get('password')
        if not password:
            return Response({'error': 'Password is required'}, status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(email=request.user.email, password=password)
        if user is None:
            return Response({'error': 'Incorrect password'}, status=status.HTTP_400_BAD_REQUEST)

        user.delete()
        return Response({'message': 'Account deleted successfully'}, status=status.HTTP_204_NO_CONTENT)