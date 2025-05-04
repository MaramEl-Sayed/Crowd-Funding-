from django.db import models
from django.conf import settings
from django.utils.text import slugify
from decimal import Decimal
from django.core.exceptions import ValidationError
from django.core.mail import send_mail

class Tag(models.Model):
    name = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.name

class Category(models.Model):
    name = models.CharField(max_length=50, unique=True)
    image = models.ImageField(upload_to='category_icons/', null=True, blank=True)

    def __str__(self):
        return self.name

class Project(models.Model):
    CATEGORY_CHOICES = [
        ("Technology", "Technology"),
        ("Health", "Health"),
        ("Education", "Education"),
        ("Art", "Art"),
        ("Charity", "Charity"),
    ]

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="projects"
    )
    title = models.CharField(
        max_length=255,
        unique=True,
        error_messages={
            'unique': 'A project with this name already exists. Please choose a different name.'
        }
    )
    details = models.TextField()
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True)
    tags = models.ManyToManyField(Tag, blank=True)
    total_target = models.DecimalField(max_digits=10, decimal_places=2)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    slug = models.SlugField(unique=True, blank=True)
    is_featured = models.BooleanField(default=False)  

    STATUS_CHOICES = [
        ('waiting', 'Waiting'),
        ('active', 'Active'),
        ('rejected', 'Rejected'),
        ('in-active', 'In-active'),
        ('finished', 'Finished'),
    ]
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='waiting')

    def clean(self):
        super().clean()
        if Project.objects.filter(title__iexact=self.title).exclude(pk=self.pk).exists():
            raise ValidationError('A project with this name already exists. Please choose a different name.')

    def save(self, *args, **kwargs):
        self.full_clean()
        # Check if this is an update (existing instance)
        if self.pk:
            old = Project.objects.get(pk=self.pk)
            if old.status != self.status:
                # Status changed, send email notification
                subject = ''
                message = ''
                if self.status == 'active':
                    subject = 'Your project has been accepted'
                    message = f'Dear {self.owner.username},\n\nYour project "{self.title}" has been accepted by the admins.'
                elif self.status == 'rejected':
                    subject = 'Your project has been rejected'
                    message = f'Dear {self.owner.username},\n\nWe regret to inform you that your project "{self.title}" has been rejected by the admins.'
                if subject and message:
                    send_mail(
                        subject,
                        message,
                        settings.DEFAULT_FROM_EMAIL,
                        [self.owner.email],
                        fail_silently=True,
                    )
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title

    def donations(self):
        return self.donations.all()

    def total_donations(self):
        return sum(donation.amount for donation in self.donations.all())

    def can_be_cancelled(self):
        return self.total_donations() < (Decimal('0.25') * self.total_target)

    def average_rating(self):
        ratings = self.ratings.all()
        if not ratings:
            return None
        return round(sum(rating.value for rating in ratings) / len(ratings), 2)

    @classmethod
    def get_top_rated_active_projects(cls, limit=5):
        from django.db.models.functions import Coalesce
        return cls.objects.filter(status='active').annotate(
            avg_rating=Coalesce(models.Avg('ratings__value'), 0.0)
        ).order_by('-avg_rating')[:limit]

    @classmethod
    def get_latest_featured_projects(cls, limit=5):
        return cls.objects.filter(status='active', is_featured=True).order_by('-start_time')[:limit]

class ProjectImage(models.Model):
    project = models.ForeignKey(Project, related_name='images', on_delete=models.CASCADE)
    image = models.ImageField(upload_to="images/")
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Image for {self.project.title}"

class Donation(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="donations"
    )
    project = models.ForeignKey(
        Project, on_delete=models.CASCADE, related_name="donations"
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} donated {self.amount} to {self.project.title}"

class Comment(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="comments")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    parent = models.ForeignKey("self", null=True, blank=True, on_delete=models.CASCADE, related_name="replies")

    def __str__(self):
        return f"{self.user.username} on {self.project.title}"

class Report(models.Model):
    REPORT_TYPE_CHOICES = [("project", "Project"), ("comment", "Comment")]
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    project = models.ForeignKey(Project, null=True, blank=True, on_delete=models.CASCADE)
    comment = models.ForeignKey(Comment, null=True, blank=True, on_delete=models.CASCADE)
    report_type = models.CharField(max_length=20, choices=REPORT_TYPE_CHOICES)
    reason = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} reported {self.report_type}"

class Rating(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="ratings")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    value = models.PositiveSmallIntegerField()  # typically 1 to 5

    class Meta:
        unique_together = ("project", "user")

    def __str__(self):
        return f"{self.user.username} rated {self.project.title} - {self.value}"

class Payment(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('failed', 'Failed'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='payments')
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='payments')
    donation = models.ForeignKey('Donation', on_delete=models.SET_NULL, null=True, blank=True, related_name='payments')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    paymob_order_id = models.CharField(max_length=500, unique=True)
    paymob_payment_key = models.CharField(max_length=2000, unique=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Payment {self.paymob_order_id} - {self.status}"


# New Share model to log project shares
class Share(models.Model):
    PLATFORM_CHOICES = [
        ('facebook', 'Facebook'),
        ('twitter', 'Twitter'),
        ('linkedin', 'LinkedIn'),
        ('whatsapp', 'WhatsApp'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='shares')
    platform = models.CharField(max_length=20, choices=PLATFORM_CHOICES)
    shared_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        user_str = self.user.username if self.user else "Anonymous"
        return f"{user_str} shared {self.project.title} on {self.platform} at {self.shared_at}"
