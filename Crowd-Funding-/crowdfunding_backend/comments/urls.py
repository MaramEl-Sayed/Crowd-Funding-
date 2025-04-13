# comments/urls.py

from django.urls import path
from .views import CommentListCreateAPIView, CommentRetrieveUpdateDestroyAPIView

urlpatterns = [
    path('', CommentListCreateAPIView.as_view(), name='comment-list'),
    path('<int:pk>/', CommentRetrieveUpdateDestroyAPIView.as_view(), name='comment-detail'),
]


# urlpatterns = [
#     path("", CommentListCreateView.as_view(), name="comment-list-create"),
#     path("<int:pk>/", CommentDetailView.as_view(), name="comment-detail"),
#     path("project/<int:project_id>/", ProjectCommentsView.as_view(), name="project-comments"),
# ]
