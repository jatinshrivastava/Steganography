import os

from django.db import models
from django.utils.translation import gettext_lazy as _

from model_utils.fields import AutoCreatedField, AutoLastModifiedField


class IndexedTimeStampedModel(models.Model):
    created = AutoCreatedField(_("created"), db_index=True)
    modified = AutoLastModifiedField(_("modified"), db_index=True)

    class Meta:
        abstract = True


def plaintext_directory_path(instance, filename):
    directory = 'plaintexts'
    # Get the user ID
    user_id = instance.user.id if instance.user else 'unknown'

    # Build the path
    return os.path.join(directory, filename)


def message_directory_path(instance, filename):
    directory = 'messages'
    # Get the user ID
    user_id = instance.user.id if instance.user else 'unknown'

    # Build the path
    return os.path.join(directory, filename)


def encoded_directory_path(instance, filename):
    directory = 'encoded'
    # Get the user ID
    user_id = instance.user.id if instance.user else 'unknown'

    # Build the path
    return os.path.join(directory, filename)


class UploadedFile(IndexedTimeStampedModel):
    file = models.FileField(upload_to='uploads/', null=False)  # Use ImageField for image files

    # Add other fields as needed

    def __str__(self):
        return f"MyFile {self.pk}"


class SteganographyRecord(IndexedTimeStampedModel):
    user = models.ForeignKey("users.User", on_delete=models.CASCADE, null=False)
    plaintext_file = models.FileField(upload_to=plaintext_directory_path, null=False)
    message_file = models.FileField(upload_to=message_directory_path, null=False)
    encoded_file = models.FileField(upload_to=encoded_directory_path, null=False)
    skip_bits = models.PositiveIntegerField(null=False)
    length = models.PositiveIntegerField(null=False)
    mode = models.CharField(max_length=20, default='fixed', null=False)

    # Add other fields as needed (e.g., mode of operation)

    def __str__(self):
        return f"Steganography Record {self.pk}"
