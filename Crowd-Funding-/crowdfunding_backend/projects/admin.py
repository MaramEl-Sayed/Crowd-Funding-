from django.contrib import admin
from .models import Project, Category, Tag, Donation, Comment, Report, Rating, ProjectImage

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('title', 'owner', 'category', 'is_featured', 'status','start_time', 'end_time')
    list_filter = ('is_featured', 'category','status')
    search_fields = ('title', 'owner__username')
    ordering = ('-start_time',)

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)

@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)

@admin.register(Donation)
class DonationAdmin(admin.ModelAdmin):
    list_display = ('user', 'project', 'amount', 'date')
    list_filter = ('date',)
    search_fields = ('user__username', 'project__title')

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('user', 'project', 'created_at', 'parent')
    list_filter = ('created_at',)
    search_fields = ('user__username', 'project__title', 'text')

@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ('user', 'report_type', 'project', 'comment', 'created_at')
    list_filter = ('report_type', 'created_at')
    search_fields = ('user__username',)

@admin.register(Rating)
class RatingAdmin(admin.ModelAdmin):
    list_display = ('user', 'project', 'value')
    search_fields = ('user__username', 'project__title')

@admin.register(ProjectImage)
class ProjectImageAdmin(admin.ModelAdmin):
    list_display = ('project', 'uploaded_at')
    list_filter = ('uploaded_at',)
