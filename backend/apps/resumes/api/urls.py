from rest_framework.routers import DefaultRouter

from apps.resumes.api.views import ResumeViewSet

router = DefaultRouter()
router.register("resumes", ResumeViewSet, basename="resumes")

urlpatterns = router.urls
