from django.urls import path, include
from .views import register_user, activate_account, login_user, PasswordResetRequestView, PasswordResetConfirmView
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('register/', register_user, name='register'),
    path('activate/<uidb64>/<token>/', activate_account, name='activate'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('login/', login_user, name='login'),
    path('password/reset/request/', PasswordResetRequestView.as_view(), name='password_reset_request'),
    path('password/reset/confirm/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
]