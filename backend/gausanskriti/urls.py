from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from .views import health_check_view  # Add this import

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/users/', include('users.urls')),
    path('api/cows/', include('cows.urls')),
    path('api/farmers/', include('farmers.urls')),
    path('api/products/', include('products.urls')),
    path('api/ai/', include('ai.urls')),
    path('api/community/', include('community.urls')),
    path('api/health/', health_check_view, name='health_check'),  # Add this line
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
