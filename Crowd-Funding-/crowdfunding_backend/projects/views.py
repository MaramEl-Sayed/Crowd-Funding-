from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.permissions import AllowAny
from django.db import models
from rest_framework.exceptions import PermissionDenied
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.shortcuts import get_object_or_404
from .models import Project, Tag, Donation, Comment, Report, Rating
from .serializers import (
    ProjectSerializer, TagSerializer, DonationSerializer,
    CommentSerializer, ReportSerializer, RatingSerializer
)

class ProjectListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    def get(self, request):
        if request.user.is_authenticated:
            projects = Project.objects.filter(owner=request.user)
        else:
            projects = Project.objects.all()
        serializer = ProjectSerializer(projects, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = ProjectSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(owner=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ProjectDetailUpdateDeleteView(APIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get(self, request, project_id):
        project = get_object_or_404(Project, id=project_id)
        serializer = ProjectSerializer(project)
        donations = DonationSerializer(project.donations.all(), many=True)
        response_data = serializer.data
        response_data['donations'] = donations.data
        return Response(response_data)

    def put(self, request, project_id):
        project = get_object_or_404(Project, id=project_id)
        if project.owner != request.user:
            raise PermissionDenied("You do not have permission to edit this project.")
        serializer = ProjectSerializer(project, data=request.data)
        if serializer.is_valid():
            serializer.save(owner=request.user)
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, project_id):
        project = get_object_or_404(Project, id=project_id)
        if project.owner != request.user:
            raise PermissionDenied("You do not have permission to delete this project.")
        project.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class ProjectCancelView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, project_id):
        project = get_object_or_404(Project, id=project_id)

        if project.owner != request.user:
            raise PermissionDenied("You do not have permission to cancel this project.")

        if not project.can_be_cancelled():
            return Response(
                {"detail": "Project cannot be cancelled as donations exceed 25% of the target."},
                status=status.HTTP_400_BAD_REQUEST
            )

        project.is_active = False
        project.save()

        return Response({"detail": "Project has been cancelled."}, status=status.HTTP_200_OK)


class DonationCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = DonationSerializer(data=request.data)
        if serializer.is_valid():
            project = serializer.validated_data['project']
            amount = serializer.validated_data['amount']

            if not project.is_active:
                return Response(
                    {'detail': 'Donations cannot be made to a canceled project.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            remaining_amount = project.total_target - project.total_donations()
            if amount > remaining_amount:
                return Response(
                    {'detail': f'Donation exceeds remaining project target. Maximum allowed: {remaining_amount}'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CommentListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get(self, request, project_id):
        comments = Comment.objects.filter(project__id=project_id, parent__isnull=True)
        serializer = CommentSerializer(comments, many=True)
        return Response(serializer.data)

    def post(self, request, project_id):
        project = get_object_or_404(Project, id=project_id)
        data = request.data.copy()
        data['project'] = project.id
        serializer = CommentSerializer(data=data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ReportCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ReportSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class RatingCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = RatingSerializer(data=request.data)
        if serializer.is_valid():
            project = serializer.validated_data['project']
            if Rating.objects.filter(project=project, user=request.user).exists():
                return Response({'detail': 'You have already rated this project.'}, status=status.HTTP_400_BAD_REQUEST)
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ProjectRatingAverageView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, project_id):
        ratings = Rating.objects.filter(project__id=project_id)
        if not ratings.exists():
            return Response({"average_rating": None})
        average = round(sum(r.value for r in ratings) / len(ratings), 2)
        return Response({"average_rating": average})


class TagListView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        tags = Tag.objects.all()
        serializer = TagSerializer(tags, many=True)
        return Response(serializer.data)
class TopRatedProjectsView(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        projects = Project.get_top_rated_active_projects()
        # Calculate average rating for each project and create a list of tuples
        project_data = []
        for project in projects:
            avg_rating = project.average_rating() or 0
            serializer = ProjectSerializer(project)
            project_data.append((avg_rating, serializer.data))
        # Sort by average rating (descending) and extract just the serialized data
        project_data.sort(key=lambda x: x[0], reverse=True)
        sorted_projects = [data for (rating, data) in project_data]
        return Response(sorted_projects)
class LatestProjectsView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request):
        category = request.query_params.get('category')
        projects = Project.objects.filter(is_active=True)
        if category:
            projects = projects.filter(category=category)
        projects = projects.order_by('-start_time')[:5]
        serializer = ProjectSerializer(projects, many=True)
        return Response(serializer.data)
# Add this at the end of projects/views.py
class UserDonationsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        donations = Donation.objects.filter(user=request.user)
        serializer = DonationSerializer(donations, many=True)
        return Response(serializer.data)