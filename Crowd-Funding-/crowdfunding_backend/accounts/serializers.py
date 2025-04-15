from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import User
from .utils import send_activation_email  # Import send_activation_email

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'email', 'password', 'confirm_password', 'mobile_phone', 'profile_picture']

    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError("Passwords don't match")
        return data

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        user = User(
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            email=validated_data['email'],
            mobile_phone=validated_data['mobile_phone'],
            profile_picture=validated_data.get('profile_picture', None)
        )
        user.set_password(validated_data['password'])
        user.is_active = False  # User is inactive until email verification
        user.is_activated = False  # Align with the model field
        user.save()

        # Send activation email using the utility function
        try:
            send_activation_email(user)
        except Exception as e:
            user.delete()  # Roll back user creation if email fails
            raise serializers.ValidationError(f"Failed to send activation email: {str(e)}")

        return user

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'email', 'mobile_phone', 'profile_picture']
        read_only_fields = ['email']  