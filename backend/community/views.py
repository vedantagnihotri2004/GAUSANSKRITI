from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from .models import ForumCategory, ForumTopic, ForumReply, Event, EventParticipant
from .serializers import (
    ForumCategorySerializer, 
    ForumTopicSerializer, 
    ForumReplySerializer, 
    ForumTopicDetailSerializer,
    EventSerializer,
    EventDetailSerializer,
    EventParticipantSerializer
)

class ForumCategoryViewSet(viewsets.ModelViewSet):
    """ViewSet for forum categories"""
    queryset = ForumCategory.objects.all()
    serializer_class = ForumCategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        return [permissions.IsAuthenticatedOrReadOnly()]

class ForumTopicViewSet(viewsets.ModelViewSet):
    """ViewSet for forum topics"""
    queryset = ForumTopic.objects.all().order_by('-is_sticky', '-created_at')
    serializer_class = ForumTopicSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['category', 'created_by', 'is_closed', 'is_sticky']
    search_fields = ['title', 'content']
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ForumTopicDetailSerializer
        return ForumTopicSerializer
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        # Increment view count
        instance.views += 1
        instance.save(update_fields=['views'])
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def add_reply(self, request, pk=None):
        topic = self.get_object()
        
        # Check if topic is closed
        if topic.is_closed:
            return Response({"error": "This topic is closed for new replies"}, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = ForumReplySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(topic=topic, created_by=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def toggle_closed(self, request, pk=None):
        topic = self.get_object()
        
        # Only admin or the creator can close/open a topic
        if request.user.is_staff or topic.created_by == request.user:
            topic.is_closed = not topic.is_closed
            topic.save()
            return Response({"status": "closed" if topic.is_closed else "open"})
        
        return Response({"error": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)

class ForumReplyViewSet(viewsets.ModelViewSet):
    """ViewSet for forum replies"""
    queryset = ForumReply.objects.all()
    serializer_class = ForumReplySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    def get_permissions(self):
        if self.action in ['update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated()]
        return [permissions.IsAuthenticatedOrReadOnly()]
    
    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        # Only the creator or staff can update
        if instance.created_by != request.user and not request.user.is_staff:
            return Response({"error": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)
        return super().update(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        # Only the creator or staff can delete
        if instance.created_by != request.user and not request.user.is_staff:
            return Response({"error": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)

class EventViewSet(viewsets.ModelViewSet):
    """ViewSet for community events"""
    queryset = Event.objects.filter(end_date__gte=timezone.now()).order_by('start_date')
    serializer_class = EventSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['is_online', 'organized_by']
    search_fields = ['title', 'description', 'location']
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return EventDetailSerializer
        return EventSerializer
    
    def perform_create(self, serializer):
        serializer.save(organized_by=self.request.user)
    
    @action(detail=False, methods=['get'])
    def past_events(self, request):
        past_events = Event.objects.filter(end_date__lt=timezone.now()).order_by('-end_date')
        page = self.paginate_queryset(past_events)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(past_events, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def join(self, request, pk=None):
        event = self.get_object()
        
        # Check if event already ended
        if event.end_date < timezone.now():
            return Response({"error": "This event has already ended"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if user already joined
        if EventParticipant.objects.filter(event=event, user=request.user).exists():
            return Response({"error": "You've already joined this event"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Add user as participant
        participant = EventParticipant.objects.create(event=event, user=request.user)
        serializer = EventParticipantSerializer(participant)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'])
    def leave(self, request, pk=None):
        event = self.get_object()
        
        # Check if user has joined
        try:
            participant = EventParticipant.objects.get(event=event, user=request.user)
            participant.delete()
            return Response({"message": "Successfully left the event"}, status=status.HTTP_200_OK)
        except EventParticipant.DoesNotExist:
            return Response({"error": "You haven't joined this event"}, status=status.HTTP_400_BAD_REQUEST)
