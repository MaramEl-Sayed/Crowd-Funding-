from django.core.management.base import BaseCommand
from projects.utils import check_and_update_project_status  # Adjust import as needed

class Command(BaseCommand):
    help = 'Checks projects for end date and updates their status, sending notifications as needed.'

    def handle(self, *args, **options):
        check_and_update_project_status()
        self.stdout.write(self.style.SUCCESS('Checked and updated project statuses.'))