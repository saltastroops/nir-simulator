from django.contrib import admin
from django.shortcuts import render
from django.urls import path, include

from nirwals.views import spectra, throughput


def home(request):
    return render(request, "index.html", {})


urlpatterns = [
    path("admin/", admin.site.urls),
    path("", home, name="home"),
    path("__reload__/", include("django_browser_reload.urls")),
    path("spectra/", spectra, name="spectra"),
    path("throughput/", throughput, name="throughput"),
]
