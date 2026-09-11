from rest_framework import serializers

from .models import Decision, Experiment, Hypothesis


class HypothesisSerializer(serializers.ModelSerializer):

    class Meta:
        model = Hypothesis

        fields = [
            "id",
            "idea",
            "statement",
            "why_important",
            "status",
            "confidence",
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


class ExperimentSerializer(serializers.ModelSerializer):

    class Meta:
        model = Experiment

        fields = [
            "id",
            "hypothesis",
            "title",
            "description",
            "success_criteria",
            "result",
            "status",
            "started_at",
            "completed_at",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
        ]

    def validate_hypothesis(self, hypothesis):
        request = self.context.get("request")

        if request and hypothesis.user != request.user:
            raise serializers.ValidationError(
                "Cette hypothèse ne vous appartient pas."
            )

        return hypothesis


class DecisionSerializer(serializers.ModelSerializer):

    class Meta:
        model = Decision

        fields = [
            "id",
            "idea",
            "decision_type",
            "title",
            "reasoning",
            "evidence",
            "created_at",
        ]

        read_only_fields = [
            "id",
            "created_at",
        ]

    def validate_idea(self, idea):
        request = self.context.get("request")

        if request and idea.user != request.user:
            raise serializers.ValidationError(
                "Cette idée ne vous appartient pas."
            )

        return idea