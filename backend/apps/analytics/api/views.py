from django.db.models import Avg, Count
from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.ai_matching.models import MatchResult
from apps.analytics.api.serializers import AnalyticsOverviewSerializer
from apps.applications.models import Application
from apps.resumes.models import Resume


class AnalyticsOverviewView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        applications = Application.objects.filter(user=request.user)
        matches = MatchResult.objects.filter(user=request.user)

        status_counts = {item["status"]: item["count"] for item in applications.values("status").annotate(count=Count("id"))}

        payload = {
            "total_applications": applications.count(),
            "status_breakdown": {
                "applied": status_counts.get("applied", 0),
                "interview": status_counts.get("interview", 0),
                "rejected": status_counts.get("rejected", 0),
                "offer": status_counts.get("offer", 0),
            },
            "resumes_uploaded": Resume.objects.filter(user=request.user).count(),
            "matches_generated": matches.count(),
            "avg_match_score": round(matches.aggregate(avg=Avg("match_score")).get("avg") or 0, 2),
        }

        serializer = AnalyticsOverviewSerializer(payload)
        return Response(serializer.data)
