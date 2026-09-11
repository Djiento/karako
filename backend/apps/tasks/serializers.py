from rest_framework import serializers

from .models import Task


class TaskSerializer(serializers.ModelSerializer):

    class Meta:
        model = Task

        fields = [
            "id",
            "project",
            "idea",
            "title",
            "description",
            "status",
            "priority",
            "due_date",
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

    def validate(self, attrs):
        request = self.context.get("request")

        project = attrs.get("project")
        idea = attrs.get("idea")

        if request:
            if project and project.user != request.user:
                raise serializers.ValidationError({
                    "project": "Ce projet ne vous appartient pas."
                })

            if idea and idea.user != request.user:
                raise serializers.ValidationError({
                    "idea": "Cette idée ne vous appartient pas."
                })

        return attrs