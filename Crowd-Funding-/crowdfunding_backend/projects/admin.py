from django.contrib import admin
from .models import User
from .models import Project, Tag, Report, Donation, Comment, Rating, ProjectImage,Category
from django.contrib.auth.admin import UserAdmin

admin.site.site_header = "CrowdFunding Admin"
admin.site.site_title = "CrowdFunding Admin Portal"
admin.site.index_title = "Welcome to the Admin Dashboard"

# Register Custom User Model
@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('email', 'username', 'is_active', 'is_activated', 'mobile_phone', 'profile_picture')
    list_filter = ('is_active', 'is_activated')
    search_fields = ('email', 'username')
    readonly_fields = ('date_joined', 'last_login')  # Example of making fields read-only


# Register Tag Model
@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ['id', 'name']
    search_fields = ['name']

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['id', 'name']
    search_fields = ['name']
# Register Project Model
@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ['title', 'owner', 'category', 'tags_display', 'is_active', 'start_time', 'end_time']
    list_editable = ['is_active']
    search_fields = ['title', 'owner__email', 'category__name']
    list_filter = ['is_active', 'category']
    prepopulated_fields = {'slug': ('title',)}

    def tags_display(self, obj):
        return ", ".join([tag.name for tag in obj.tags.all()])
    tags_display.short_description = 'Tags'


# Register Report Model
@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ['user', 'project', 'comment', 'report_type', 'created_at', 'reason']
    list_filter = ['report_type', 'created_at']
    search_fields = ['user__email', 'reason']

    actions = ['mark_as_reviewed']

    @admin.action(description="Mark selected reports as reviewed")
    def mark_as_reviewed(self, request, queryset):
        updated = queryset.update(reviewed=True)
        self.message_user(request, f"{updated} report(s) marked as reviewed.")

# Register Donation Model
@admin.register(Donation)
class DonationAdmin(admin.ModelAdmin):
    list_display = ['user', 'project', 'amount', 'date']
    list_filter = ['date']
    search_fields = ['user__email', 'project__title']

# Register Comment Model
@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ['user', 'project', 'created_at', 'text']
    list_filter = ['created_at']
    search_fields = ['user__email', 'text']

# Register Rating Model
@admin.register(Rating)
class RatingAdmin(admin.ModelAdmin):
    list_display = ['user', 'project', 'value']
    search_fields = ['user__email', 'project__title']

# Register Project Image Model
@admin.register(ProjectImage)
class ProjectImageAdmin(admin.ModelAdmin):
    list_display = ['project', 'image', 'uploaded_at']
    search_fields = ['project__title']

