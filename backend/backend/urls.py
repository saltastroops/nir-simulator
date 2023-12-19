from django.contrib import admin
from django.shortcuts import render
from django.urls import path, include

from nirwals.views import spectra, throughput


def home(request):
    return render(request, "index.html", {})


urlpatterns = [
    path("api/admin/", admin.site.urls),
    path("api/spectra/", spectra, name="spectra"),
    path("api/throughput/", throughput, name="throughput"),
]
