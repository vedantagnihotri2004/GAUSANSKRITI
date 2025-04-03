from django.db import models
from django.conf import settings
from cows.models import Cow, CowBreed

class CowAnalysis(models.Model):
    """Model for AI cow analysis results"""
    cow = models.ForeignKey(Cow, on_delete=models.SET_NULL, null=True, blank=True, related_name='analyses')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    image = models.ImageField(upload_to='cow_analysis_images/')
    date = models.DateTimeField(auto_now_add=True)
    
    # Analysis results
    detected_breed = models.ForeignKey(CowBreed, on_delete=models.SET_NULL, null=True)
    confidence = models.FloatField(help_text="Confidence score (0-100)")
    weight_estimate = models.FloatField(help_text="Estimated weight in kg", null=True, blank=True)
    health_score = models.FloatField(help_text="Overall health score (0-100)", null=True, blank=True)
    body_condition_score = models.FloatField(help_text="Body condition score (1-5)", null=True, blank=True)
    estimated_milk_production = models.FloatField(help_text="Estimated milk production in liters", null=True, blank=True)
    pure_breed_percentage = models.FloatField(help_text="Estimated pure breed percentage", null=True, blank=True)
    notes = models.TextField(blank=True, null=True)
    
    def __str__(self):
        return f"Analysis for {self.cow.name if self.cow else 'Unknown'} on {self.date}"

class AIConversation(models.Model):
    """Model for AI chat conversations"""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    started_at = models.DateTimeField(auto_now_add=True)
    last_activity = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Conversation with {self.user.username} started on {self.started_at}"

class AIMessage(models.Model):
    """Model for individual AI chat messages"""
    MESSAGE_TYPES = (
        ('user', 'User'),
        ('ai', 'AI'),
        ('system', 'System'),
    )
    
    conversation = models.ForeignKey(AIConversation, on_delete=models.CASCADE, related_name='messages')
    sender_type = models.CharField(max_length=10, choices=MESSAGE_TYPES)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['timestamp']
    
    def __str__(self):
        return f"{self.sender_type} message in conversation {self.conversation.id}"
