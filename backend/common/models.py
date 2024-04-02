import os

from django.db import models
from django.dispatch import receiver
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
    user = models.ForeignKey("users.User", on_delete=models.CASCADE)
    file = models.FileField(upload_to='uploads/', null=False)  # Use ImageField for image files

    # Add other fields as needed

    def __str__(self):
        return f"File ID: {self.pk}"


# These two auto-delete files from filesystem when they are unneeded:

@receiver(models.signals.post_delete, sender=UploadedFile)
def auto_delete_file_on_delete(sender, instance, **kwargs):
    """
    Deletes file from filesystem
    when corresponding `MediaFile` object is deleted.
    """
    if instance.file:
        if os.path.isfile(instance.file.path):
            os.remove(instance.file.path)


@receiver(models.signals.pre_save, sender=UploadedFile)
def auto_delete_file_on_change(sender, instance, **kwargs):
    """
    Deletes old file from filesystem
    when corresponding `MediaFile` object is updated
    with new file.
    """
    if not instance.pk:
        return False

    try:
        old_file = UploadedFile.objects.get(pk=instance.pk).file
    except UploadedFile.DoesNotExist:
        return False

    new_file = instance.file
    if not old_file == new_file:
        if os.path.isfile(old_file.path):
            os.remove(old_file.path)


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


# These two auto-delete files from filesystem when they are unneeded:

@receiver(models.signals.post_delete, sender=SteganographyRecord)
def auto_delete_file_on_delete(sender, instance, **kwargs):
    """
    Deletes file from filesystem
    when corresponding `MediaFile` object is deleted.
    """
    if instance.plaintext_file:
        if os.path.isfile(instance.plaintext_file.path):
            os.remove(instance.plaintext_file.path)

    if instance.message_file:
        if os.path.isfile(instance.message_file.path):
            os.remove(instance.message_file.path)

    if instance.encoded_file:
        if os.path.isfile(instance.encoded_file.path):
            os.remove(instance.encoded_file.path)


@receiver(models.signals.pre_save, sender=SteganographyRecord)
def auto_delete_file_on_change(sender, instance, **kwargs):
    """
    Deletes old file from filesystem
    when corresponding `MediaFile` object is updated
    with new file.
    """
    if not instance.pk:
        return False

    try:
        old_file = SteganographyRecord.objects.get(pk=instance.pk).file
    except SteganographyRecord.DoesNotExist:
        return False

    new_file = instance.file
    if not old_file == new_file:
        if os.path.isfile(old_file.path):
            os.remove(old_file.path)


class CryptographicKey(IndexedTimeStampedModel):
    user = models.ForeignKey("users.User", on_delete=models.CASCADE)
    name = models.CharField(max_length=256, null=False, blank=False, default=None)
    key = models.CharField(max_length=256, null=False, blank=False, default=None)

    class Meta:
        unique_together = (('user', 'key'), ('user', 'name'))


class FileHash(IndexedTimeStampedModel):
    user = models.ForeignKey("users.User", on_delete=models.CASCADE)
    file = models.OneToOneField(UploadedFile, on_delete=models.CASCADE)
    hash = models.CharField(max_length=64, null=False, blank=False)
    name = models.CharField(max_length=256, null=False, blank=False)

    def __str__(self):
        return f"FileHash {self.pk}"
