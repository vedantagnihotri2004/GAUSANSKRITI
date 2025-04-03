from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CowAnalysisViewSet, AIAssistantViewSet

router = DefaultRouter()
router.register(r'cow-analysis', CowAnalysisViewSet)
router.register(r'assistant', AIAssistantViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
