from rest_framework import serializers


class ApplyStructureSerializer(serializers.Serializer):
    problem = serializers.CharField(
        required=False,
        allow_blank=True,
    )
    solution = serializers.CharField(
        required=False,
        allow_blank=True,
    )
    target = serializers.CharField(
        required=False,
        allow_blank=True,
    )
    hypotheses = serializers.ListField(
        child=serializers.CharField(),
        required=False,
        allow_empty=True,
    )
    next_action = serializers.CharField(
        required=False,
        allow_blank=True,
    )

class ChatMessageSerializer(serializers.Serializer):
    message = serializers.CharField(
        required=True,
        allow_blank=False,
        trim_whitespace=True,
    )


class AIChatMessageSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    role = serializers.CharField(read_only=True)
    content = serializers.CharField(read_only=True)
    created_at = serializers.DateTimeField(read_only=True)


class AIChatSessionSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    idea = serializers.IntegerField(read_only=True)
    title = serializers.CharField(read_only=True)
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)


class AIActionSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    action_type = serializers.CharField(read_only=True)
    title = serializers.CharField(read_only=True)
    payload = serializers.JSONField(read_only=True)
    status = serializers.CharField(read_only=True)
    created_at = serializers.DateTimeField(read_only=True)
    applied_at = serializers.DateTimeField(read_only=True)