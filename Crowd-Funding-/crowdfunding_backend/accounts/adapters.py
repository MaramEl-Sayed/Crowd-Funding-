# accounts/adapters.py
from allauth.account.adapter import DefaultAccountAdapter
from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from django.contrib.auth import get_user_model

User = get_user_model()

def generate_unique_username(base_username):
    """Generate a unique username by appending a number if the base username is taken."""
    username = base_username.lower().replace(' ', '.')  # e.g., "john.doe"
    counter = 1
    while User.objects.filter(username=username).exists():
        username = f"{base_username}{counter}"
        counter += 1
    return username

class CustomAccountAdapter(DefaultAccountAdapter):
    def save_user(self, request, user, form, commit=True):
        user = super().save_user(request, user, form, commit=False)
        user.email = form.cleaned_data.get('email')
        if commit:
            user.save()
        return user

class CustomSocialAccountAdapter(DefaultSocialAccountAdapter):
    def populate_user(self, request, sociallogin, data):
        user = super().populate_user(request, sociallogin, data)
        user.email = data.get('email')
        user.first_name = data.get('first_name', '')
        user.last_name = data.get('last_name', '')

        # Generate a username based on email
        email_base = user.email.split('@')[0]  # e.g., "john.doe" from "john.doe@example.com"
        user.username = generate_unique_username(email_base)

        return user