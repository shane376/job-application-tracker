from django.contrib import admin

from apps.applications.models import Application


@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "company", "role", "status", "created_at")
    list_filter = ("status", "created_at")
    search_fields = ("company", "role", "user__username")
