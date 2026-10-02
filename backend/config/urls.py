from django.contrib import admin
from django.urls import include, path


urlpatterns = [
    path("admin/", admin.site.urls),

    # Authentication
    path("api/auth/", include("apps.users.urls")),

    # Ideas
    path("api/", include("apps.ideas.urls")),

    # Research
    path("api/research/", include("apps.research.urls")),

    # Validation
    path("api/", include("apps.validation.urls")),

    # Projects
    path("api/", include("apps.projects.urls")),

    # Tasks
    path("api/", include("apps.tasks.urls")),

    # AI
    path("api/ai/", include("apps.ai.urls")),
    path("api/", include("apps.ai.urls")),
]