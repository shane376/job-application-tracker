from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.ai_matching.api.serializers import MatchRequestSerializer, MatchResultSerializer
from apps.ai_matching.models import MatchResult
from apps.ai_matching.services.matching_service import AiMatchingError, analyze_resume_match
from apps.applications.models import Application
from apps.resumes.models import Resume


class MatchListView(generics.ListAPIView):
    serializer_class = MatchResultSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return MatchResult.objects.filter(user=self.request.user)


class RunMatchView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = MatchRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        resume = Resume.objects.filter(id=data["resume_id"], user=request.user).first()
        if not resume:
            return Response({"detail": "Resume not found."}, status=status.HTTP_404_NOT_FOUND)

        application = None
        job_description = data.get("job_description", "")

        application_id = data.get("application_id")
        if application_id:
            application = Application.objects.filter(id=application_id, user=request.user).first()
            if not application:
                return Response({"detail": "Application not found."}, status=status.HTTP_404_NOT_FOUND)
            if not job_description:
                job_description = application.job_description

        if not job_description:
            return Response(
                {"detail": "job_description is required when application has no job description."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            result = analyze_resume_match(resume.extracted_text, job_description)
        except AiMatchingError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_502_BAD_GATEWAY)

        match_result = MatchResult.objects.create(
            user=request.user,
            application=application,
            resume=resume,
            job_description_text=job_description,
            match_score=max(0, min(100, int(result.get("match_score", 0)))),
            missing_skills=result.get("missing_skills", []),
            improvement_suggestions=result.get("improvement_suggestions", []),
            raw_response=result.get("raw_response", result),
        )

        return Response(MatchResultSerializer(match_result).data, status=status.HTTP_201_CREATED)
