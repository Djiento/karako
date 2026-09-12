from rest_framework import serializers

from .models import Idea, Tag


class IdeaSerializer(serializers.ModelSerializer):

    tags = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Tag.objects.all(),
        required=False,
    )

    class Meta:
        model = Idea

        fields = [
            "id",
            "title",
            "description",
            "problem",
            "solution",
            "target",
            "status",
            "score",
            "tags",
            "created_at",
            "updated_at",
            "archived_at",
            "next_action",
        ]

        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
            "archived_at",
        ]