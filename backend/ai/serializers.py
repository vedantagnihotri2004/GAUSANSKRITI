from rest_framework import serializers
from .models import CowAnalysis, AIConversation, AIMessage
from cows.serializers import CowBreedSerializer

class CowAnalysisSerializer(serializers.ModelSerializer):
    breed_name = serializers.ReadOnlyField(source='detected_breed.name')
    
    class Meta:
        model = CowAnalysis
        fields = ('id', 'cow', 'user', 'image', 'date', 'detected_breed', 'breed_name', 
                  'confidence', 'weight_estimate', 'health_score', 'body_condition_score', 
                  'estimated_milk_production', 'pure_breed_percentage', 'notes')
        read_only_fields = ('user', 'date', 'detected_breed', 'confidence', 'weight_estimate', 
                            'health_score', 'body_condition_score', 'estimated_milk_production', 
                            'pure_breed_percentage')

class AIMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIMessage
        fields = ('id', 'conversation', 'sender_type', 'content', 'timestamp')
        read_only_fields = ('timestamp',)

class AIConversationSerializer(serializers.ModelSerializer):
    messages = AIMessageSerializer(many=True, read_only=True)
    
    class Meta:
        model = AIConversation
        fields = ('id', 'user', 'started_at', 'last_activity', 'messages')
        read_only_fields = ('user', 'started_at', 'last_activity')

class SendMessageSerializer(serializers.Serializer):
    content = serializers.CharField()
