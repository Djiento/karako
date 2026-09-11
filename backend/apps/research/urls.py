from rest_framework.routers import DefaultRouter

from .views import (
    ConversationViewSet,
    ResearchViewSet,
)


router = DefaultRouter()

router.register(
    "research",
    ResearchViewSet,
    basename="research",
)

router.register(
    "conversations",
    ConversationViewSet,
    basename="conversation",
)

urlpatterns = router.urls