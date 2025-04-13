# Generated by Django 5.2 on 2025-04-13 10:39

import django.core.validators
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0002_alter_user_managers'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='username',
            field=models.CharField(max_length=30, validators=[django.core.validators.RegexValidator(message='Username can only contain letters, numbers, and @/./+/-/_ characters.', regex='^[\\w.@+-]+$')]),
        ),
    ]
