from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Project, ProjectImage, Tag, Donation, Comment, Report, Rating

User = get_user_model()


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ["id", "name"]


class DonationSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source="user.username")
    user_id = serializers.ReadOnlyField(source="user.id")
    user_avatar = serializers.SerializerMethodField()
    project_title = serializers.ReadOnlyField(source="project.title")
    project_slug = serializers.ReadOnlyField(source="project.slug")

    class Meta:
        model = Donation
        fields = [
            'id', 'user', 'user_id', 'user_avatar', 'project',
            'project_title', 'project_slug', 'amount', 'date'
        ]

    def get_user_avatar(self, obj):
        if obj.user.profile_picture:
            return obj.user.profile_picture.url
        return None


class ProjectImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectImage
        fields = ['id', 'image', 'uploaded_at']


class ProjectSerializer(serializers.ModelSerializer):
    owner = serializers.ReadOnlyField(source="owner.username")
    tags = TagSerializer(many=True, read_only=True)
    tags_ids = serializers.ListField(child=serializers.CharField(), write_only=True, required=False)
    average_rating = serializers.SerializerMethodField()
    total_donations = serializers.SerializerMethodField()
    can_be_cancelled = serializers.SerializerMethodField()
    donations = DonationSerializer(many=True, read_only=True)
    remaining_amount = serializers.SerializerMethodField()
    progress_percentage = serializers.SerializerMethodField()
    images = serializers.SerializerMethodField()
    images_files = serializers.ListField(child=serializers.ImageField(), write_only=True, required=False)

    class Meta:
        model = Project
        fields = [
            'id', 'title', 'details', 'category', 'total_target', 'start_time',
            'end_time', 'slug', 'is_active', 'owner', 'tags', 'tags_ids',
            'average_rating', 'total_donations', 'can_be_cancelled', 'donations',
            'remaining_amount', 'progress_percentage', 'images', 'images_files'
        ]

    def get_average_rating(self, obj):
        return obj.average_rating()

    def get_total_donations(self, obj):
        return obj.total_donations()

    def get_can_be_cancelled(self, obj):
        return obj.can_be_cancelled()

    def get_remaining_amount(self, obj):
        return obj.total_target - obj.total_donations()

    def get_progress_percentage(self, obj):
        if obj.total_target > 0:
            return round((obj.total_donations() / obj.total_target) * 100, 2)
        return 0

    def get_images(self, obj):
        images = obj.images.all()
        return [{"id": image.id, "url": image.image.url} for image in images]

    def create(self, validated_data):
        tags_data = validated_data.pop('tags_ids', [])
        images_files = validated_data.pop('images_files', [])

        project = Project.objects.create(**validated_data)
        self._handle_tags(project, tags_data)
        for image_file in images_files:
            ProjectImage.objects.create(project=project, image=image_file)
        return project

    def update(self, instance, validated_data):
        tags_data = validated_data.pop('tags_ids', None)
        images_files = validated_data.pop('images_files', [])

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if tags_data is not None:
            self._handle_tags(instance, tags_data)
        for image_file in images_files:
            ProjectImage.objects.create(project=instance, image=image_file)
        return instance

    def _handle_tags(self, project, tags_data):
        tag_objs = []
        for tag_name in tags_data:
            tag_obj, created = Tag.objects.get_or_create(name=tag_name)
            tag_objs.append(tag_obj)
        project.tags.set(tag_objs)


class CommentSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.username')
    replies = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = ['id', 'project', 'user', 'text', 'created_at', 'parent', 'replies']

    def get_replies(self, obj):
        return CommentSerializer(obj.replies.all(), many=True).data


class ReportSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.username')

    class Meta:
        model = Report
        fields = ['id', 'user', 'project', 'comment', 'report_type', 'reason', 'created_at']

class RatingSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.username')
    project_title = serializers.ReadOnlyField(source='project.title')

    class Meta:
        model = Rating
        fields = ['id', 'user', 'project', 'project_title', 'value']
