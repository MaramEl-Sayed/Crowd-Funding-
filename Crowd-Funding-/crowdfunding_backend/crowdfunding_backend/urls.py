from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/accounts/", include("accounts.urls")),
    path("api/projects/", include("projects.urls")),
    path("accounts/", include("allauth.urls")),  # For social login callbacks
    path("api/auth/", include("dj_rest_auth.urls")),  # For login, logout, etc.
    path("api/auth/registration/", include("dj_rest_auth.registration.urls")),  # For registration and social login
    path("api/comments/", include('comments.urls')),
   
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)