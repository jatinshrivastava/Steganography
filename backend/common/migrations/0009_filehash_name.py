# Generated by Django 5.0.3 on 2024-04-01 21:57

import datetime
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('common', '0008_uploadedfile_user'),
    ]

    operations = [
        migrations.AddField(
            model_name='filehash',
            name='name',
            field=models.CharField(default=datetime.datetime(2024, 4, 1, 21, 57, 59, 227076, tzinfo=datetime.timezone.utc), max_length=256),
            preserve_default=False,
        ),
    ]