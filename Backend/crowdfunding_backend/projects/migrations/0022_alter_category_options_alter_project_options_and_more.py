# Generated by Django 5.2 on 2025-05-02 03:35

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('projects', '0021_alter_category_options_alter_project_options_and_more'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='category',
            options={},
        ),
        migrations.AlterModelOptions(
            name='project',
            options={},
        ),
        migrations.AlterModelOptions(
            name='report',
            options={},
        ),
        migrations.AlterModelOptions(
            name='tag',
            options={},
        ),
        migrations.AlterField(
            model_name='rating',
            name='value',
            field=models.PositiveSmallIntegerField(),
        ),
    ]
