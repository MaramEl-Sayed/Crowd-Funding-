from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.core.validators import RegexValidator

class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("The Email field must be set")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, username, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        extra_fields.setdefault('is_activated', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get('is_superuser') is not True:
            raise ValueError("Superuser must have is_superuser=True.")
        if not username:
            raise ValueError("Superuser must have a username.")

        return self.create_user(email, password, username=username, **extra_fields)

class User(AbstractUser):
    username = models.CharField(
        max_length=30,
        unique=False,
        blank=False,
        validators=[
            RegexValidator(
                regex=r'^[\w.@+-]+$',
                message="Username can only contain letters, numbers, and @/./+/-/_ characters."
            )
        ]
    )
    email = models.EmailField(unique=True)
    mobile_phone = models.CharField(
        max_length=11,
        unique=False,
        null=True,
        blank=True,
        validators=[
            RegexValidator(
                regex=r'^01[0-2,5]{1}[0-9]{8}$',
                message="Enter a valid Egyptian phone number (e.g., 01012345678)"
            )
        ]
    )
    profile_picture = models.ImageField(upload_to='profiles/', null=True, blank=True)
    is_activated = models.BooleanField(default=False)

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']  # This ensures createsuperuser prompts for username

    def __str__(self):
        return self.email