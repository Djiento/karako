from rest_framework import serializers

from .models import Conversation, Research


class ResearchSerializer(serializers.ModelSerializer):

    class Meta:
        model = Research

        fields = [
            "id",
            "idea",
            "title",
            "content",
            "research_type",
            "source_url",
            "source_name",
            "is_finding",
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


class ConversationSerializer(serializers.ModelSerializer):

    class Meta:
        model = Conversation

        fields = [
            "id",
            "idea",
            "title",
            "provider",
            "content",
            "summary",
            "source_url",
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