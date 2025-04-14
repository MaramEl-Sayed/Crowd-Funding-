from django.urls import path
from .views import ( ProjectListCreateView, ProjectDetailUpdateDeleteView, TagListView, DonationCreateView, CommentListCreateView, ReportCreateView, RatingCreateView, ProjectRatingAverageView, ProjectCancelView, TopRatedProjectsView ,LatestProjectsView)

app_name = "projects"

urlpatterns = [ 
    #Project endpoints 
    path("projects/", ProjectListCreateView.as_view(), name="project-list-create"),
    path("projects/<int:project_id>/", ProjectDetailUpdateDeleteView.as_view(), name="project-detail-update-delete"),
    path("projects/<int:project_id>/cancel/", ProjectCancelView.as_view(), name="project-cancel"),

    # Tags
    path("tags/", TagListView.as_view(), name="tag-list"),

    # Donations
    path("donations/", DonationCreateView.as_view(), name="donation-create"),

    # Comments (nested under project)
    path("projects/<int:project_id>/comments/", CommentListCreateView.as_view(), name="comment-list-create"),

    # Reports
    path("reports/", ReportCreateView.as_view(), name="report-create"),

    # Ratings
    path("ratings/", RatingCreateView.as_view(), name="rating-create"),

    path("projects/<int:project_id>/ratings/average/", ProjectRatingAverageView.as_view(), name="project-average-rating"),
    path("projects/top-rated/", TopRatedProjectsView.as_view(), name="top-rated-projects"),
    path("projects/latest/", LatestProjectsView.as_view(), name="latest-projects"),
    ]
