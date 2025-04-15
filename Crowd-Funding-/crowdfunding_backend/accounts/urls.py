from django.urls import path, include
from .views import (
    register_user, activate_account, login_user, PasswordResetRequestView,
    PasswordResetConfirmView, facebook_login, google_login, UserProfileView, CheckEmailView,
    PasswordChangeView
)
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('register/', register_user, name='register'),
    path('activate/<uidb64>/<token>/', activate_account, name='activate'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('login/', login_user, name='login'),
    path('password/reset/request/', PasswordResetRequestView.as_view(), name='password_reset_request'),
    path('password/reset/confirm/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    path('login/facebook/', facebook_login, name='facebook_login'),
    path('login/google/', google_login, name='google_login'),
    path('me/', UserProfileView.as_view(), name='user-profile'),
    path('check-email/', CheckEmailView.as_view(), name='check-email'),
    path('change-password/', PasswordChangeView.as_view(), name='change-password'),
]