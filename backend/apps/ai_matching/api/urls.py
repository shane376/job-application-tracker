from django.urls import path

from apps.ai_matching.api.views import MatchListView, RunMatchView

urlpatterns = [
    path("ai/matches/", MatchListView.as_view(), name="match-list"),
    path("ai/match/", RunMatchView.as_view(), name="match-run"),
]
