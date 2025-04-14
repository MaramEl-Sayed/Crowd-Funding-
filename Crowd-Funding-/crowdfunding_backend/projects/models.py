from django.db import models
from django.conf import settings
from django.contrib.auth.models import User
from django.utils.text import slugify
from decimal import Decimal

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
    title = models.CharField(max_length=255)
    details = models.TextField()
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    tags = models.ManyToManyField(Tag, blank=True)
    total_target = models.DecimalField(max_digits=10, decimal_places=2)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    image = models.ImageField(upload_to="images/", default="blank.jpg")
    slug = models.SlugField(unique=True, blank=True)
    is_active = models.BooleanField(default=True)


    def save(self, *args, **kwargs):
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
    parent = models.ForeignKey( "self", null=True, blank=True, on_delete=models.CASCADE, related_name="replies" )
    def __str__(self):
        return f"{self.user.username} on {self.project.title}"
    
class Report(models.Model): 
    REPORT_TYPE_CHOICES = [ ("project", "Project"), ("comment", "Comment"), ]
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
    value = models.PositiveSmallIntegerField() # typically 1 to 5  
    class Meta:
        unique_together = ("project", "user")
    def __str__(self):
        return f"{self.user.username} rated {self.project.title} - {self.value}"
  
