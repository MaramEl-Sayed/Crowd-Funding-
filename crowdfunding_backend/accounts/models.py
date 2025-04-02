from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.validators import  RegexValidator
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    username = None
    email=models.EmailField(unique=True)
    mobile_phone=models.CharField(max_length=11,
                                 unique=True,
                                 validators=[RegexValidator(regex=r'^01[0-2,5]{1}[0-9]{8}$',
                                                            message="Enter a valid Egyptian phone number (e.g., +201012345678)"
                                                            )]
                                 )
    profile_picture=models.ImageField(upload_to='profiles/',null=True,blank=True)
    is_activiated=models.BooleanField(default=False)
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []


    def __str__(self):
        return self.email
