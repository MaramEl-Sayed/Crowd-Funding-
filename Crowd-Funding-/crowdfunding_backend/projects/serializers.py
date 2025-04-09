from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Project, Tag, Donation, Comment, Report, Rating

User = get_user_model()

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ["id", "name"]


# In serializers.py

class ProjectSerializer(serializers.ModelSerializer):
    owner = serializers.ReadOnlyField(source="owner.username")
    tags = TagSerializer(many=True, read_only=True)
    tags_ids = serializers.PrimaryKeyRelatedField(queryset=Tag.objects.all(), many=True, write_only=True, source='tags')
    average_rating = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = [
            'id', 'title', 'details', 'category', 'total_target', 'start_time',
            'end_time', 'image', 'slug', 'is_active', 'owner', 'tags', 'tags_ids', 'average_rating'
        ]

    def get_average_rating(self, obj):
        return obj.average_rating()



class DonationSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source="user.username")
    project_title  = serializers.ReadOnlyField(source="project.title")

    class Meta:
        model = Donation
        fields = ['id', 'user', 'project', 'project_title', 'amount', 'date'
                ]

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
