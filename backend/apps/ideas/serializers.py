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

    def validate_tags(self, tags):
        request = self.context.get("request")

        if request:
            for tag in tags:
                if tag.user != request.user:
                    raise serializers.ValidationError(
                        "Un ou plusieurs tags ne vous appartiennent pas."
                    )

        return tags