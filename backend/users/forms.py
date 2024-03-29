from django.contrib.auth.forms import UserCreationForm, UserChangeForm
from django import forms

from users.models import User


class CustomUserCreationForm(UserCreationForm):
    first_name = forms.CharField(required=True, max_length=30)
    last_name = forms.CharField(required=True, max_length=150)
    username = forms.EmailField(max_length=255)

    class Meta:
        model = User
        fields = UserCreationForm.Meta.fields + ('first_name', 'last_name', 'email')


class CustomUserCreationForm(UserChangeForm):
    first_name = forms.CharField(required=True, max_length=30)
    last_name = forms.CharField(required=True, max_length=150)
    username = forms.EmailField(max_length=255)

    class Meta:
        model = User
        fields = UserCreationForm.Meta.fields + ('first_name', 'last_name', 'email')
