# Generated by Django 3.2.12 on 2023-08-22 02:24

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('network', '0002_post'),
    ]

    operations = [
        migrations.RenameField(
            model_name='post',
            old_name='post',
            new_name='newPost',
        ),
    ]
