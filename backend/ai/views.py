from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.utils import timezone
import random
from cows.models import CowBreed
from .models import CowAnalysis, AIConversation, AIMessage
from .serializers import (
    CowAnalysisSerializer, 
    AIConversationSerializer,
    AIMessageSerializer,
    SendMessageSerializer
)

class CowAnalysisViewSet(viewsets.ModelViewSet):
    """ViewSet for AI cow analysis"""
    queryset = CowAnalysis.objects.all()
    serializer_class = CowAnalysisSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Users can only see their own analyses
        return CowAnalysis.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        # Here we would implement the actual AI model to analyze the image
        # For this example, we'll mock the analysis with random values
        
        # Get a random breed for demonstration
        breeds = CowBreed.objects.all()
        detected_breed = random.choice(breeds) if breeds.exists() else None
        
        # Mock analysis results
        analysis_data = {
            'user': self.request.user,
            'detected_breed': detected_breed,
            'confidence': random.uniform(70.0, 99.9),
            'weight_estimate': random.uniform(300.0, 600.0),
            'health_score': random.uniform(60.0, 95.0),
            'body_condition_score': random.uniform(2.5, 4.5),
            'estimated_milk_production': random.uniform(10.0, 25.0),
            'pure_breed_percentage': random.uniform(80.0, 99.9),
        }
        
        # Save the analysis
        serializer.save(**analysis_data)

class AIAssistantViewSet(viewsets.ModelViewSet):
    """ViewSet for AI assistant conversations"""
    queryset = AIConversation.objects.all()
    serializer_class = AIConversationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Users can only see their own conversations
        return AIConversation.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        # Create a new conversation
        conversation = serializer.save(user=self.request.user)
        
        # Add a welcome message from the AI
        AIMessage.objects.create(
            conversation=conversation,
            sender_type='ai',
            content='Hello! I am GauSanskriti AI Assistant. How can I help you with indigenous cows today?'
        )
        
        return conversation
    
    @action(detail=True, methods=['post'])
    def send_message(self, request, pk=None):
        conversation = self.get_object()
        serializer = SendMessageSerializer(data=request.data)
        
        if serializer.is_valid():
            # Save user message
            AIMessage.objects.create(
                conversation=conversation,
                sender_type='user',
                content=serializer.validated_data['content']
            )
            
            # Update conversation's last_activity
            conversation.last_activity = timezone.now()
            conversation.save()
            
            # In a real implementation, we would process the message with an actual AI model
            # Generate an AI response based on user's message
            ai_response = self.generate_ai_response(serializer.validated_data['content'])
            
            # Save AI response
            ai_message = AIMessage.objects.create(
                conversation=conversation,
                sender_type='ai',
                content=ai_response
            )
            
            return Response(AIMessageSerializer(ai_message).data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def generate_ai_response(self, user_message):
        """
        Mock AI response generation.
        In a real implementation, this would use an actual LLM like GPT.
        """
        # Simple keyword-based responses as a mock
        user_message = user_message.lower()
        
        if 'health' in user_message or 'disease' in user_message:
            return "Regular health check-ups are important for indigenous cows. Make sure to monitor body temperature, appetite, and behavior. If you notice any abnormalities, consult a veterinarian immediately."
        
        elif 'feed' in user_message or 'food' in user_message or 'diet' in user_message:
            return "Indigenous cows thrive on a diet of local grasses, hay, and natural feed. You can supplement with mineral mixtures and clean water. Avoid processed feeds with chemicals."
        
        elif 'milk' in user_message or 'production' in user_message:
            return "Indigenous cow milk is known for its A2 protein content and health benefits. Regular milking, good nutrition, and proper care can help maintain healthy milk production levels."
        
        elif 'breed' in user_message or 'breeding' in user_message:
            return "India has many precious indigenous cow breeds like Gir, Sahiwal, Tharparkar, and Kankrej. Each has unique characteristics adapted to local climates. Natural breeding with pure indigenous bulls is preferred to maintain genetic purity."
        
        elif 'thank' in user_message:
            return "You're welcome! Feel free to ask more questions about indigenous cows anytime."
        
        else:
            return "Indigenous cows are a treasure of India. They offer many benefits beyond milk, including medicinal urine, dung for organic farming, and sustainable agriculture practices. How else can I assist you with indigenous cow management?"
