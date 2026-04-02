from django.urls import include, path
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response


@api_view(["GET"])
@permission_classes([AllowAny])
def health_check(_request):
    return Response(
        {
            "status": "ok",
            "service": "smart-job-application-tracker-api",
            "version": "v1",
        }
    )


urlpatterns = [
    path("health/", health_check, name="health-check"),
    path("auth/", include(("apps.users.api.urls", "users"), namespace="auth")),
    path("", include(("apps.applications.api.urls", "applications"), namespace="applications")),
    path("", include(("apps.resumes.api.urls", "resumes"), namespace="resumes")),
    path("", include(("apps.ai_matching.api.urls", "ai-matching"), namespace="ai-matching")),
    path("", include(("apps.analytics.api.urls", "analytics"), namespace="analytics")),
]
