from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.translation import gettext_lazy as _

from common.models import UploadedFile, SteganographyRecord
from .forms import CustomUserCreationForm
from .models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    form = CustomUserCreationForm
    list_display = ("id", "first_name", "last_name", "email", "created", "modified")
    list_filter = ("is_active", "is_staff", "groups")
    search_fields = ("email",)
    ordering = ("email",)
    filter_horizontal = (
        "groups",
        "user_permissions",
    )

    fieldsets = (
        (None, {"fields": ("first_name", "last_name", "email", "password")}),
        (
            _("Permissions"),
            {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")},
        ),
    )
    add_fieldsets = ((None, {"classes": ("wide",), "fields": ("email", "password1", "password2")}),)


@admin.register(UploadedFile)
class UploadedFileAdmin(admin.ModelAdmin):
    list_display = ['id', 'file', 'created', 'modified']
    pass


@admin.register(SteganographyRecord)
class SteganographyRecordAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'plaintext_file', 'message_file', 'encoded_file', 'skip_bits', 'length', 'mode', 'created', 'modified']
    pass
