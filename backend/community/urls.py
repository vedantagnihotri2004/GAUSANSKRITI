from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ForumCategoryViewSet, ForumTopicViewSet, ForumReplyViewSet, EventViewSet

router = DefaultRouter()
router.register(r'forum/categories', ForumCategoryViewSet)
router.register(r'forum/topics', ForumTopicViewSet)
router.register(r'forum/replies', ForumReplyViewSet)
router.register(r'events', EventViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
