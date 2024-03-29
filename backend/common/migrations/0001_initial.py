# Generated by Django 5.0.3 on 2024-03-29 15:08

import common.models
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='SteganographyRecord',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('plaintext_file', models.FileField(upload_to=common.models.plaintext_directory_path)),
                ('message_file', models.FileField(upload_to=common.models.message_directory_path)),
                ('encoded_file', models.FileField(upload_to=common.models.encoded_directory_path)),
                ('skip_bits', models.PositiveIntegerField()),
                ('length', models.PositiveIntegerField()),
                ('mode', models.CharField(default='fixed', max_length=20)),
            ],
        ),
        migrations.CreateModel(
            name='UploadedFile',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('file', models.FileField(upload_to='uploads/')),
            ],
        ),
    ]
