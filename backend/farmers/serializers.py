from rest_framework import serializers
from .models import Farmer, FarmerReview
from users.serializers import UserSerializer

class FarmerReviewSerializer(serializers.ModelSerializer):
    reviewer_name = serializers.ReadOnlyField(source='reviewer.username')
    
    class Meta:
        model = FarmerReview
        fields = ('id', 'farmer', 'reviewer', 'reviewer_name', 'rating', 'comment', 'created_at')
        read_only_fields = ('reviewer',)
    
    def create(self, validated_data):
        validated_data['reviewer'] = self.context['request'].user
        return super().create(validated_data)

class FarmerSerializer(serializers.ModelSerializer):
    user_details = UserSerializer(source='user', read_only=True)
    
    class Meta:
        model = Farmer
        fields = ('id', 'user', 'user_details', 'farm_name', 'farm_location', 'farm_size', 
                  'experience_years', 'specialization', 'certification', 'latitude', 
                  'longitude', 'rating', 'description', 'created_at', 'updated_at')
        read_only_fields = ('user', 'rating')

class FarmerDetailSerializer(serializers.ModelSerializer):
    user_details = UserSerializer(source='user', read_only=True)
    reviews = FarmerReviewSerializer(many=True, read_only=True)
    
    class Meta:
        model = Farmer
        fields = ('id', 'user', 'user_details', 'farm_name', 'farm_location', 'farm_size', 
                  'experience_years', 'specialization', 'certification', 'latitude', 
                  'longitude', 'rating', 'description', 'created_at', 'updated_at', 'reviews')
        read_only_fields = ('user', 'rating')
