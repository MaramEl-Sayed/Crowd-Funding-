from django.urls import path,include
from .api import register_user, activate_account
from .views import login_user

urlpatterns=[
    path('register/', register_user, name='register'),
    path('activate/<uidb64>/<token>/', activate_account, name='activate'),
    path('login/', login_user, name='login'),


]