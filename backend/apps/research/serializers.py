from rest_framework import serializers

from .models import ResearchItem


class ResearchItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResearchItem
        fields = [
            "id",
            "idea",
            "title",
            "research_type",
            "url",
            "content",
            "notes",
            "source",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
        ]

    def validate_idea(self, idea):
        request = self.context.get("request")

        if request and idea.user != request.user:
            raise serializers.ValidationError(
                "Cette idée ne vous appartient pas."
            )

        return idea