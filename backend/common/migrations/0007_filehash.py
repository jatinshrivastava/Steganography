# Generated by Django 5.0.3 on 2024-04-01 21:20

import django.db.models.deletion
import django.utils.timezone
import model_utils.fields
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('common', '0006_alter_cryptographickey_key_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='FileHash',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created', model_utils.fields.AutoCreatedField(db_index=True, default=django.utils.timezone.now, editable=False, verbose_name='created')),
                ('modified', model_utils.fields.AutoLastModifiedField(db_index=True, default=django.utils.timezone.now, editable=False, verbose_name='modified')),
                ('hash', models.CharField(max_length=64)),
                ('file', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to='common.uploadedfile')),
            ],
            options={
                'abstract': False,
            },
        ),
    ]