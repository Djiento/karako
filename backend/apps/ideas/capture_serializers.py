from rest_framework import serializers

from .models import Capture, Idea


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
            "status",
            "captured_at",
            "created_at",
        ]

    def validate_idea(self, idea):
        request = self.context.get("request")

        if request and idea is not None:
            if idea.user != request.user:
                raise serializers.ValidationError(
                    "Cette idée ne vous appartient pas."
                )

        return idea