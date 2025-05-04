from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings

def check_and_update_project_status():
    from .models import Project  # Import here to avoid circular import
    now = timezone.now()
    projects = Project.objects.filter(status='active', end_time__lt=now)
    for project in projects:
        # Mark as finished
        project.status = 'finished'
        project.save()

        # Prepare emails
        subject_user = f"Your project '{project.title}' has finished"
        if project.total_donations() < project.total_target:
            message_user = (
                f"Dear {project.owner.username},\n\n"
                f"Your project '{project.title}' has finished but did not reach its total target of {project.total_target} EGP.\n"
                "Would you like to extend the project duration? Please contact support or update your project."
            )
        else:
            message_user = (
                f"Dear {project.owner.username},\n\n"
                f"Congratulations! Your project '{project.title}' has finished and reached its target."
            )
        send_mail(
            subject_user,
            message_user,
            settings.DEFAULT_FROM_EMAIL,
            [project.owner.email],
            fail_silently=True,
        )

        # Notify admins
        admin_emails = [admin[1] for admin in getattr(settings, 'ADMINS', [])]
        if admin_emails:
            subject_admin = f"Project '{project.title}' has finished"
            if project.total_donations() < project.total_target:
                message_admin = (
                    f"The project '{project.title}' has finished but did not reach its target ({project.total_donations()} / {project.total_target} EGP).\n"
                    f"Owner: {project.owner.username} ({project.owner.email})\n"
                    "Consider contacting the owner about extending the project."
                )
            else:
                message_admin = (
                    f"The project '{project.title}' has finished and reached its target.\n"
                    f"Owner: {project.owner.username} ({project.owner.email})"
                )
            send_mail(
                subject_admin,
                message_admin,
                settings.DEFAULT_FROM_EMAIL,
                admin_emails,
                fail_silently=True,
            )
