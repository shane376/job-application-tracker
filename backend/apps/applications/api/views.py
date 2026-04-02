from rest_framework import permissions, viewsets

from apps.applications.api.permissions import IsOwner
from apps.applications.api.serializers import ApplicationSerializer
from apps.applications.models import Application


class ApplicationViewSet(viewsets.ModelViewSet):
    serializer_class = ApplicationSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]

    def get_queryset(self):
        return Application.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
