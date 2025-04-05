from rest_framework import viewsets, permissions, generics, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from django_filters.rest_framework import DjangoFilterBackend
from math import cos, radians
from .models import Farmer, FarmerReview
from .serializers import FarmerSerializer, FarmerDetailSerializer, FarmerReviewSerializer

class IsFarmerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow farmers to edit their own profile.
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions are only allowed to the farmer themselves
        return obj.user == request.user

class FarmerViewSet(viewsets.ModelViewSet):
    """ViewSet for viewing and editing farmer profiles"""
    queryset = Farmer.objects.all()
    serializer_class = FarmerSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsFarmerOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['specialization', 'certification']
    search_fields = ['farm_name', 'farm_location', 'specialization']
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return FarmerDetailSerializer
        return FarmerSerializer
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def add_review(self, request, pk=None):
        farmer = self.get_object()
        # Users can't review themselves
        if farmer.user == request.user:
            raise ValidationError("You cannot review your own farm.")
        
        # Check if user has already reviewed this farmer
        existing_review = FarmerReview.objects.filter(farmer=farmer, reviewer=request.user).first()
        if existing_review:
            # Update existing review
            serializer = FarmerReviewSerializer(existing_review, data=request.data, context={'request': request})
        else:
            # Create new review
            serializer = FarmerReviewSerializer(data=request.data, context={'request': request})
        
        serializer.is_valid(raise_exception=True)
        serializer.save(farmer=farmer, reviewer=request.user)
        
        # Update farmer's average rating
        avg_rating = FarmerReview.objects.filter(farmer=farmer).values_list('rating', flat=True)
        if avg_rating:
            farmer.rating = sum(avg_rating) / len(avg_rating)
            farmer.save()
        
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def nearby(self, request):
        """
        Find farmers nearby a given location
        ?lat=xx.xxxx&lng=yy.yyyy&radius=10
        """
        try:
            lat = float(request.query_params.get('lat', 0))
            lng = float(request.query_params.get('lng', 0))
            radius = float(request.query_params.get('radius', 10))  # Default 10km
        except ValueError:
            return Response({"error": "Invalid coordinates or radius"}, status=400)
        
        # This is a simplified approach - in production, you'd use GeoDjango for proper spatial queries
        # For now, we're using a bounding box as an approximation
        
        # Approximate conversion: 1 degree ~ 111km at the equator
        lat_change = radius / 111.0
        # Longitude degrees vary based on latitude, but this is a rough approximation
        lng_change = radius / (111.0 * abs(cos(radians(lat))))
        
        nearby_farmers = Farmer.objects.filter(
            latitude__gte=lat-lat_change,
            latitude__lte=lat+lat_change,
            longitude__gte=lng-lng_change,
            longitude__lte=lng+lng_change,
        )
        
        serializer = FarmerSerializer(nearby_farmers, many=True)
        return Response(serializer.data)
