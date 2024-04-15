# Generated by Django 5.0.3 on 2024-04-15 05:01

import common.models
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('common', '0010_filehash_user'),
    ]

    operations = [
        migrations.AlterField(
            model_name='steganographyrecord',
            name='message_file',
            field=models.FileField(null=True, upload_to=common.models.message_directory_path),
        ),
    ]
