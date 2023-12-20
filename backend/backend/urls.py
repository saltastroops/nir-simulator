from django.contrib import admin
from django.shortcuts import render
from django.urls import path

from nirwals.views import spectrum_view, throughput_view


def home(request):
    return render(request, "index.html", {})


urlpatterns = [
    path("api/admin/", admin.site.urls),
    path("api/spectra/", spectrum_view, name="spectrum"),
    path("api/throughput/", throughput_view, name="throughput"),
]
