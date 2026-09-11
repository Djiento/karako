from rest_framework import serializers

from .models import Project


class ProjectSerializer(serializers.ModelSerializer):

    class Meta:
        model = Project

        fields = [
            "id",
            "idea",
            "name",
            "description",
            "status",
            "start_date",
            "target_date",
            "completed_at",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "completed_at",
            "created_at",
            "updated_at",
        ]

    def validate_idea(self, idea):
        request = self.context.get("request")

        if request and idea and idea.user != request.user:
            raise serializers.ValidationError(
                "Cette idée ne vous appartient pas."
            )

        return idea