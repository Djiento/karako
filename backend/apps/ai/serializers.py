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