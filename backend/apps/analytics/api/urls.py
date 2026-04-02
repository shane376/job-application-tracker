from django.urls import path

from apps.analytics.api.views import AnalyticsOverviewView

urlpatterns = [
    path("analytics/overview/", AnalyticsOverviewView.as_view(), name="analytics-overview"),
]
