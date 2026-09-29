from rest_framework.routers import DefaultRouter

from .views import ResearchItemViewSet


router = DefaultRouter()

router.register(
    "research",
    ResearchItemViewSet,
    basename="research",
)

urlpatterns = router.urls