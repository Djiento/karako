from rest_framework.routers import DefaultRouter

from .views import IdeaViewSet, CaptureViewSet, TagViewSet


router = DefaultRouter()

router.register(
    "ideas",
    IdeaViewSet,
    basename="idea",
)

router.register(
    "captures",
    CaptureViewSet,
    basename="capture",
)

router.register(
    "tags",
    TagViewSet,
    basename="tag",
)

urlpatterns = router.urls