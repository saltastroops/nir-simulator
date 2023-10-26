from django.contrib import admin
from django.shortcuts import render
from django.urls import path, include

from nirwals.views import spectra, throughput
from nirwals.views.throughput import throughput
from nirwals.views.exposure import solve_for_snr


def home(request):
    return render(request, "index.html", {})


urlpatterns = [
    path("admin/", admin.site.urls),
    path("", home, name="home"),
    path("__reload__/", include("django_browser_reload.urls")),
    path("spectra/", spectra, name="spectra"),
    path("throughput/", throughput, name="throughput"),
    path("solve/", solve_for_snr, name='solve-snr')
]
