# Generated by Django 5.1.6 on 2025-04-08 17:28

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0002_remove_user_is_activiated_alter_user_is_active'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='is_activiated',
            field=models.BooleanField(default=False),
        ),
        migrations.AlterField(
            model_name='user',
            name='is_active',
            field=models.BooleanField(default=True, help_text='Designates whether this user should be treated as active. Unselect this instead of deleting accounts.', verbose_name='active'),
        ),
    ]
