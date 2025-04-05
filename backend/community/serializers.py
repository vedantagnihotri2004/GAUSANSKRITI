from rest_framework import serializers
from .models import ForumCategory, ForumTopic, ForumReply, Event, EventParticipant
from users.serializers import UserProfileSerializer

class ForumCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ForumCategory
        fields = '__all__'

class ForumReplySerializer(serializers.ModelSerializer):
    created_by_details = UserProfileSerializer(source='created_by', read_only=True)
    
    class Meta:
        model = ForumReply
        fields = ('id', 'topic', 'content', 'created_by', 'created_by_details', 'created_at', 'updated_at')
        read_only_fields = ('created_by',)

class ForumTopicSerializer(serializers.ModelSerializer):
    created_by_details = UserProfileSerializer(source='created_by', read_only=True)
    category_name = serializers.ReadOnlyField(source='category.name')
    reply_count = serializers.SerializerMethodField()
    
    class Meta:
        model = ForumTopic
        fields = ('id', 'title', 'content', 'category', 'category_name', 'created_by', 
                  'created_by_details', 'created_at', 'updated_at', 'is_closed', 
                  'is_sticky', 'views', 'reply_count')
        read_only_fields = ('created_by', 'views', 'reply_count')
    
    def get_reply_count(self, obj):
        return obj.replies.count()

class ForumTopicDetailSerializer(serializers.ModelSerializer):
    created_by_details = UserProfileSerializer(source='created_by', read_only=True)
    category = ForumCategorySerializer(read_only=True)
    replies = ForumReplySerializer(many=True, read_only=True)
    
    class Meta:
        model = ForumTopic
        fields = ('id', 'title', 'content', 'category', 'created_by', 'created_by_details', 
                  'created_at', 'updated_at', 'is_closed', 'is_sticky', 'views', 'replies')
        read_only_fields = ('created_by', 'views')

class EventParticipantSerializer(serializers.ModelSerializer):
    user_details = UserProfileSerializer(source='user', read_only=True)
    
    class Meta:
        model = EventParticipant
        fields = ('id', 'event', 'user', 'user_details', 'registered_at')
        read_only_fields = ('user',)

class EventSerializer(serializers.ModelSerializer):
    organized_by_details = UserProfileSerializer(source='organized_by', read_only=True)
    participant_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Event
        fields = ('id', 'title', 'description', 'location', 'start_date', 'end_date', 
                  'organized_by', 'organized_by_details', 'image', 'is_online', 
                  'online_link', 'created_at', 'participant_count')
        read_only_fields = ('organized_by',)
    
    def get_participant_count(self, obj):
        return obj.participants.count()

class EventDetailSerializer(serializers.ModelSerializer):
    organized_by_details = UserProfileSerializer(source='organized_by', read_only=True)
    participants = EventParticipantSerializer(source='participants.all', many=True, read_only=True)
    is_participant = serializers.SerializerMethodField()
    
    class Meta:
        model = Event
        fields = ('id', 'title', 'description', 'location', 'start_date', 'end_date', 
                  'organized_by', 'organized_by_details', 'image', 'is_online', 
                  'online_link', 'created_at', 'participants', 'is_participant')
        read_only_fields = ('organized_by',)
    
    def get_is_participant(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.participants.filter(user=request.user).exists()
        return False
