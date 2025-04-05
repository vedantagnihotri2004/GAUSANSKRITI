from rest_framework import viewsets, permissions, generics, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import CowBreed, Cow, CowHealth, Vaccination, MilkProduction
from .serializers import (
    CowBreedSerializer,
    CowSerializer,
    CowHealthSerializer,
    VaccinationSerializer,
    MilkProductionSerializer,
    CowDetailSerializer
)

class CowBreedViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for viewing cow breeds"""
    queryset = CowBreed.objects.all()
    serializer_class = CowBreedSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'origin']

class CowViewSet(viewsets.ModelViewSet):
    """ViewSet for managing cows"""
    queryset = Cow.objects.all()
    serializer_class = CowSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['breed', 'owner', 'is_pregnant']
    search_fields = ['name', 'breed__name', 'registration_number']
    
    def get_queryset(self):
        """Filter cows to only show those belonging to the current user's farm"""
        user = self.request.user
        if user.user_type == 'farmer':
            return Cow.objects.filter(owner__user=user)
        return Cow.objects.all()
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return CowDetailSerializer
        return CowSerializer
    
    @action(detail=True, methods=['get'])
    def health_history(self, request, pk=None):
        cow = self.get_object()
        health_records = CowHealth.objects.filter(cow=cow).order_by('-date')
        serializer = CowHealthSerializer(health_records, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def vaccination_history(self, request, pk=None):
        cow = self.get_object()
        vaccinations = Vaccination.objects.filter(cow=cow).order_by('-date_administered')
        serializer = VaccinationSerializer(vaccinations, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def milk_production(self, request, pk=None):
        cow = self.get_object()
        milk_records = MilkProduction.objects.filter(cow=cow).order_by('-date')
        serializer = MilkProductionSerializer(milk_records, many=True)
        return Response(serializer.data)

class CowHealthViewSet(viewsets.ModelViewSet):
    """ViewSet for managing cow health records"""
    queryset = CowHealth.objects.all()
    serializer_class = CowHealthSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['cow', 'date']
    
    def get_queryset(self):
        user = self.request.user
        if user.user_type == 'farmer':
            return CowHealth.objects.filter(cow__owner__user=user)
        return CowHealth.objects.all()

class VaccinationViewSet(viewsets.ModelViewSet):
    """ViewSet for managing vaccinations"""
    queryset = Vaccination.objects.all()
    serializer_class = VaccinationSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['cow', 'name']
    
    def get_queryset(self):
        user = self.request.user
        if user.user_type == 'farmer':
            return Vaccination.objects.filter(cow__owner__user=user)
        return Vaccination.objects.all()

class MilkProductionViewSet(viewsets.ModelViewSet):
    """ViewSet for managing milk production records"""
    queryset = MilkProduction.objects.all()
    serializer_class = MilkProductionSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['cow', 'date']
    
    def get_queryset(self):
        user = self.request.user
        if user.user_type == 'farmer':
            return MilkProduction.objects.filter(cow__owner__user=user)
        return MilkProduction.objects.all()
