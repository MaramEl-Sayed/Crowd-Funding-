# comments/urls.py

from django.urls import path
from .views import CommentListCreateView, CommentDetailView, ProjectCommentsView

urlpatterns = [
    path("", CommentListCreateView.as_view(), name="comment-list-create"),
    path("<int:pk>/", CommentDetailView.as_view(), name="comment-detail"),
    path("project/<int:project_id>/", ProjectCommentsView.as_view(), name="project-comments"),
]
