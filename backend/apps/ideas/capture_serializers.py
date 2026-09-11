from rest_framework import serializers

from .models import Capture


class CaptureSerializer(serializers.ModelSerializer):

    class Meta:
        model = Capture

        fields = [
            "id",
            "idea",
            "content",
            "capture_type",
            "source",
            "context",
            "status",
            "captured_at",
            "created_at",
        ]

        read_only_fields = [
            "id",
            "user",
            "created_at",
        ]