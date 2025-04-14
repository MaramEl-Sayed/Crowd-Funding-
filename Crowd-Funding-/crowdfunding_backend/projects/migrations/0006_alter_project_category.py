# Generated by Django 5.2 on 2025-04-14 08:44

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("projects", "0005_alter_project_category"),
    ]

    operations = [
        migrations.AlterField(
            model_name="project",
            name="category",
            field=models.CharField(
                choices=[
                    ("Technology", "Technology"),
                    ("Health", "Health"),
                    ("Education", "Education"),
                    ("Art", "Art"),
                    ("Charity", "Charity"),
                ],
                max_length=50,
            ),
        ),
    ]
