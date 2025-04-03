from rest_framework import serializers
from .models import CowBreed, Cow, CowHealth, Vaccination, MilkProduction

class CowBreedSerializer(serializers.ModelSerializer):
    class Meta:
        model = CowBreed
        fields = '__all__'

class CowSerializer(serializers.ModelSerializer):
    breed_name = serializers.ReadOnlyField(source='breed.name')
    owner_name = serializers.ReadOnlyField(source='owner.user.username')
    
    class Meta:
        model = Cow
        fields = ('id', 'name', 'breed', 'breed_name', 'owner', 'owner_name', 'date_of_birth', 
                  'weight', 'height', 'color', 'milk_production', 'is_pregnant', 'image',
                  'registration_number', 'pure_breed_percentage', 'created_at', 'updated_at')

class CowHealthSerializer(serializers.ModelSerializer):
    class Meta:
        model = CowHealth
        fields = '__all__'

class VaccinationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vaccination
        fields = '__all__'

class MilkProductionSerializer(serializers.ModelSerializer):
    total_amount = serializers.ReadOnlyField()
    
    class Meta:
        model = MilkProduction
        fields = ('id', 'cow', 'date', 'morning_amount', 'evening_amount', 'total_amount', 'fat_content')

class CowDetailSerializer(serializers.ModelSerializer):
    breed = CowBreedSerializer(read_only=True)
    health_records = CowHealthSerializer(many=True, read_only=True)
    vaccinations = VaccinationSerializer(many=True, read_only=True)
    milk_records = MilkProductionSerializer(many=True, read_only=True)
    
    class Meta:
        model = Cow
        fields = ('id', 'name', 'breed', 'owner', 'date_of_birth', 'weight', 'height', 
                  'color', 'milk_production', 'is_pregnant', 'image', 'registration_number', 
                  'pure_breed_percentage', 'created_at', 'updated_at', 'health_records', 
                  'vaccinations', 'milk_records')
