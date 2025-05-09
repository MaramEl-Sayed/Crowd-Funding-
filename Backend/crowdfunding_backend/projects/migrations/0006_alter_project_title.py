# Generated by Django 5.1.7 on 2025-04-14 09:37

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('projects', '0005_alter_project_category'),
    ]

    operations = [
        migrations.AlterField(
            model_name='project',
            name='title',
            field=models.CharField(error_messages={'unique': 'A project with this name already exists. Please choose a different name.'}, max_length=255, unique=True),
        ),
    ]
