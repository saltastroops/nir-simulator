from django.contrib import admin
from django.urls import path

from nirwals.views import spectrum_view, throughput_view, exposure_view

urlpatterns = [
    path("api/admin/", admin.site.urls),
    path("api/exposure", exposure_view, name="exposure"),
    path("api/spectra/", spectrum_view, name="spectrum"),
    path("api/throughput/", throughput_view, name="throughput"),
]
