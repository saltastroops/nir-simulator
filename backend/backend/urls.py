from django.contrib import admin
from django.shortcuts import render
from django.urls import path, include
from django.http import JsonResponse
import random


def home(request):
    return render(request, "index.html", {})


def throughput(request):
    # Handle the POST request
    # You can access POST data using request.POST dictionary
    data = {
        'x': [1, 2, 3, 4, 5],
        'y': [random.randint(0, 10) for _ in range(5)]
    }
    return JsonResponse(data)


urlpatterns = [
    path("admin/", admin.site.urls),
    path("", home, name="home"),
    path("__reload__/", include("django_browser_reload.urls")),
    path("throughput/", throughput, name='throughput')
]
