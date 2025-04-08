from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import User
from django.core.mail import send_mail
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.contrib.auth.tokens import default_token_generator
from django.contrib.auth import authenticate, get_user_model
from django.urls import reverse
User = get_user_model()
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    confirm_password=serializers.CharField(write_only=True)

    class Meta:
        model=User
        fields = ['first_name', 'last_name', 'email', 'password', 'confirm_password', 'mobile_phone', 'profile_picture']

    def validate(self, data):
        if data['password']!=data['confirm_password']:
            raise serializers.ValidationError("Password dont match")
        return data
    def create(self,validate_data):
        validate_data.pop('confirm_password')
        user=User(
            first_name=validate_data['first_name'],
            last_name=validate_data['last_name'],
            email=validate_data['email'],
            mobile_phone=validate_data['mobile_phone'],
            profile_picture=validate_data.get('profile_picture',None)
        )
        user.set_password(validate_data['password'])
        user.is_active = False
        user.save()
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        activation_link = f"http://localhost:3000/activate/{uid}/{token}/"

        send_mail(
            "Activate Your Account",
            f"Click the link to activate: {activation_link}",
            "areghagag449@gmail.com",
            [user.email],
        )

        return user
