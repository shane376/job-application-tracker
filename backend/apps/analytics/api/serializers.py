from rest_framework import serializers


class AnalyticsOverviewSerializer(serializers.Serializer):
    total_applications = serializers.IntegerField()
    status_breakdown = serializers.DictField(child=serializers.IntegerField())
    resumes_uploaded = serializers.IntegerField()
    matches_generated = serializers.IntegerField()
    avg_match_score = serializers.FloatField()
