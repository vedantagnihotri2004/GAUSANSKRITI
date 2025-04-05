from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CowBreedViewSet,
    CowViewSet,
    CowHealthViewSet,
    VaccinationViewSet,
    MilkProductionViewSet
)

router = DefaultRouter()
router.register(r'breeds', CowBreedViewSet)
router.register(r'cows', CowViewSet)
router.register(r'health', CowHealthViewSet)
router.register(r'vaccinations', VaccinationViewSet)
router.register(r'milk-production', MilkProductionViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
