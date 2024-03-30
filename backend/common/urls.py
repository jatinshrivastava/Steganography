from django.urls import path, re_path

from . import views


app_name = "common"
urlpatterns = [
    re_path("", views.IndexView.as_view(), name="index"),
    # re_path("login/", views.IndexView.as_view(), name="index"),
]
