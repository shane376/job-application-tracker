from django.contrib import admin

from apps.ai_matching.models import MatchResult


@admin.register(MatchResult)
class MatchResultAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "application", "resume", "match_score", "created_at")
    list_filter = ("created_at",)
    search_fields = ("user__username",)
