from rest_framework.routers import DefaultRouter

from .views import (
    DecisionViewSet,
    ExperimentViewSet,
    HypothesisViewSet,
)


router = DefaultRouter()

router.register(
    "hypotheses",
    HypothesisViewSet,
    basename="hypothesis",
)

router.register(
    "experiments",
    ExperimentViewSet,
    basename="experiment",
)

router.register(
    "decisions",
    DecisionViewSet,
    basename="decision",
)

urlpatterns = router.urls