from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include(("config.api.urls", "api"), namespace="api")),
    path("api/v1/", include(("config.api.urls", "api-v1"), namespace="api-v1")),
]
