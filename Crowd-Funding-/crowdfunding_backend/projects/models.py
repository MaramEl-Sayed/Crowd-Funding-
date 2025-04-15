from django.db import models
from django.conf import settings
from django.contrib.auth.models import User
from django.utils.text import slugify
from decimal import Decimal
<<<<<<< HEAD
=======
from django.core.exceptions import ValidationError

>>>>>>> origin/Final

class Tag(models.Model):
    name = models.CharField(max_length=50, unique=True)

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
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    tags = models.ManyToManyField(Tag, blank=True)
    total_target = models.DecimalField(max_digits=10, decimal_places=2)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
<<<<<<< HEAD
    image = models.ImageField(upload_to="images/", default="blank.jpg")
    slug = models.SlugField(unique=True, blank=True)
    is_active = models.BooleanField(default=True)


=======
    slug = models.SlugField(unique=True, blank=True)
    is_active = models.BooleanField(default=True)

>>>>>>> origin/Final
    def clean(self):
        super().clean()
        if Project.objects.filter(title__iexact=self.title).exclude(pk=self.pk).exists():
            raise ValidationError('A project with this name already exists. Please choose a different name.')

    def save(self, *args, **kwargs):
        self.full_clean()
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title
<<<<<<< HEAD
    
=======

>>>>>>> origin/Final
    def donations(self):
        return self.donations.all()

    def total_donations(self):
        return sum(donation.amount for donation in self.donations.all())

    def can_be_cancelled(self):
        return self.total_donations() < (Decimal('0.25') * self.total_target)
<<<<<<< HEAD
    
=======

>>>>>>> origin/Final
    def average_rating(self):
        ratings = self.ratings.all()
        if not ratings:
            return None
        return round(sum(rating.value for rating in ratings) / len(ratings), 2)

    @classmethod
    def get_top_rated_active_projects(cls, limit=5):
        from django.db.models.functions import Coalesce
        return cls.objects.filter(is_active=True).annotate(
            avg_rating=Coalesce(models.Avg('ratings__value'), 0.0)
        ).order_by('-avg_rating')[:limit]


<<<<<<< HEAD
=======
class ProjectImage(models.Model):
    project = models.ForeignKey(Project, related_name='images', on_delete=models.CASCADE)
    image = models.ImageField(upload_to="images/")
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Image for {self.project.title}"


>>>>>>> origin/Final
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
<<<<<<< HEAD
    
class Comment(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="comments") 
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE) 
    text = models.TextField() 
    created_at = models.DateTimeField(auto_now_add=True) 
    parent = models.ForeignKey( "self", null=True, blank=True, on_delete=models.CASCADE, related_name="replies" )
    def __str__(self):
        return f"{self.user.username} on {self.project.title}"
    
class Report(models.Model): 
    REPORT_TYPE_CHOICES = [ ("project", "Project"), ("comment", "Comment"), ]
=======


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
>>>>>>> origin/Final
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    project = models.ForeignKey(Project, null=True, blank=True, on_delete=models.CASCADE)
    comment = models.ForeignKey(Comment, null=True, blank=True, on_delete=models.CASCADE)
    report_type = models.CharField(max_length=20, choices=REPORT_TYPE_CHOICES)
    reason = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} reported {self.report_type}"

<<<<<<< HEAD
class Rating(models.Model): 
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="ratings") 
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE) 
    value = models.PositiveSmallIntegerField() # typically 1 to 5  
    class Meta:
        unique_together = ("project", "user")
    def __str__(self):
        return f"{self.user.username} rated {self.project.title} - {self.value}"
  
=======

class Rating(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="ratings")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    value = models.PositiveSmallIntegerField()  # typically 1 to 5

    class Meta:
        unique_together = ("project", "user")

    def __str__(self):
        return f"{self.user.username} rated {self.project.title} - {self.value}"
>>>>>>> origin/Final
