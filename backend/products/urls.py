from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProductCategoryViewSet, ProductViewSet, OrderViewSet, CartViewSet

router = DefaultRouter()
router.register(r'categories', ProductCategoryViewSet)
router.register(r'items', ProductViewSet)
router.register(r'orders', OrderViewSet)
router.register(r'cart', CartViewSet, basename='cart')

urlpatterns = [
    path('', include(router.urls)),
]
