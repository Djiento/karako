from django.contrib import admin
from django.urls import include, path




urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("apps.users.urls")),
    path("register/", include("apps.users.urls")),
    path("api/", include("apps.ideas.urls")),
    path("api/", include("apps.research.urls")),
    path("api/", include("apps.validation.urls")),
    path("api/", include("apps.projects.urls")),
    path("api/", include("apps.tasks.urls")),
]
