from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth.models import User
from .models import Project


class ProjectAPITest(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(username="testuser", password="password")
        self.client.force_authenticate(user=self.user)
        self.project_data = {
            "title": "Water for Africa",
            "details": "Providing clean water",
            "category": "Charity",
            "total_target": 100000,
            "start_date": "2025-04-01T10:00:00Z",
            "end_date": "2025-05-01T10:00:00Z",
            "created_by": self.user.id,
        }
        self.project = Project.objects.create(**self.project_data)

    def test_create_project(self):
        response = self.client.post("/projects/", self.project_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_get_projects(self):
        response = self.client.get("/projects/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_donate_to_project(self):
        response = self.client.post(
            f"/projects/{self.project.id}/donate/",
            {"amount": 50, "user": self.user.id},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_add_comment(self):
        response = self.client.post(
            f"/projects/{self.project.id}/comments/",
            {"text": "Awesome!", "user": self.user.id},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)



class ProjectCancelTest(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(username="testuser", password="password")
        self.client.force_authenticate(user=self.user)
        self.project = Project.objects.create(
            title="Test Project",
            details="Test Details",
            category="Tech",
            total_target=1000,
            owner=self.user
        )

    def test_cancel_project(self):
        # Ensure the project can be cancelled
        response = self.client.post(f"/projects/{self.project.id}/cancel/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Check that the project is marked as inactive
        self.project.refresh_from_db()
        self.assertFalse(self.project.is_active)
