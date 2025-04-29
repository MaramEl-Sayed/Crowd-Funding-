from django.urls import path
from .views import (
    ProjectListCreateView, ProjectDetailUpdateDeleteView, TagListView,
    DonationCreateView, CommentListCreateView, ReportCreateView,
    RatingCreateView, ProjectRatingAverageView, ProjectCancelView,
    UserDonationsView, TopRatedProjectsView, LatestProjectsView,
    SimilarProjectsView, ProjectImageDeleteView, CategoryListView, CategoryCreateView, LatestFeaturedProjectsView, PaymobIntentionCreateView
)

app_name = "projects"


urlpatterns = [
    # Project endpoints

    # Project List and Create
    path("projects/", ProjectListCreateView.as_view(), name="project-list-create"),
    # Project Detail, Update and Delete
    path("projects/<int:project_id>/", ProjectDetailUpdateDeleteView.as_view(), name="project-detail-update-delete"),
    # Cancel a project
    path("projects/<int:project_id>/cancel/", ProjectCancelView.as_view(), name="project-cancel"),
    # Project images
    path("projects/<int:project_id>/images/<int:image_id>/", ProjectImageDeleteView.as_view(),
         name="project-image-delete"),

    # Donations
    path("donations/", DonationCreateView.as_view(), name="donation-create"),
    # User's donations
    path("my-donations/", UserDonationsView.as_view(), name="user-donations"),
    # Tags
    path("tags/", TagListView.as_view(), name="tag-list"),
    # Categories
    path("categories/", CategoryListView.as_view(), name="category-list"),
    path("categories/create/", CategoryCreateView.as_view(), name="category-create"),

    # Paymob payment endpoints
    path("paymob/create_intention/", PaymobIntentionCreateView.as_view(), name="paymob-create-intention"),

    # Comments (nested under project)
    path("projects/<int:project_id>/comments/", CommentListCreateView.as_view(), name="comment-list-create"),

    # Reports
    path("reports/", ReportCreateView.as_view(), name="report-create"),

    # Ratings
    path("ratings/", RatingCreateView.as_view(), name="rating-create"),
    path("projects/<int:project_id>/ratings/average/", ProjectRatingAverageView.as_view(),
         name="project-average-rating"),

    # Top Rated 
    path("projects/top-rated/", TopRatedProjectsView.as_view(), name="top-rated-projects"),
    # Latest Projects
    path("projects/latest/", LatestProjectsView.as_view(), name="latest-projects"),

    # Similar Projects
    path("projects/<int:project_id>/similar/", SimilarProjectsView.as_view(), name="project-similar"),
    # Featured Projects
    path('projects/featured/', LatestFeaturedProjectsView.as_view(), name='latest-featured-projects'),

]
