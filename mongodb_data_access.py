from mongodb_config import (
    users_collection, profiles_collection, articles_collection,
    discussions_collection, comments_collection, community_members_collection,
    forum_categories_collection, forum_topics_collection, forum_replies_collection,
    events_collection, event_participants_collection, cow_breeds_collection,
    cows_collection, cow_analyses_collection, ai_conversations_collection,
    ai_messages_collection
)
from bson.objectid import ObjectId
from datetime import datetime
import bcrypt
from pymongo.errors import DuplicateKeyError

# User operations
def create_user(username, email, password, first_name="", last_name="", is_staff=False):
    """Create a new user with hashed password"""
    try:
        password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        user_id = users_collection.insert_one({
            'username': username,
            'email': email,
            'password_hash': password_hash,
            'first_name': first_name,
            'last_name': last_name,
            'is_active': True,
            'is_staff': is_staff,
            'date_joined': datetime.now()
        }).inserted_id
        return user_id
    except DuplicateKeyError:
        return None

def get_user_by_id(user_id):
    """Get user by ID"""
    return users_collection.find_one({'_id': ObjectId(user_id)})

def get_user_by_username(username):
    """Get user by username"""
    return users_collection.find_one({'username': username})

def verify_password(username, password):
    """Verify user password"""
    user = get_user_by_username(username)
    if user and bcrypt.checkpw(password.encode('utf-8'), user['password_hash'].encode('utf-8')):
        return user
    return None

# Article operations
def create_article(title, content, author_id, is_featured=False):
    """Create a new article"""
    article_id = articles_collection.insert_one({
        'title': title,
        'content': content,
        'author_id': ObjectId(author_id),
        'date_posted': datetime.now(),
        'is_featured': is_featured
    }).inserted_id
    return article_id

def get_featured_article():
    """Get the featured article"""
    return articles_collection.find_one({'is_featured': True})

def get_recent_articles(limit=3):
    """Get most recent articles"""
    return list(articles_collection.find().sort('date_posted', -1).limit(limit))

# Discussion operations
def create_discussion(topic, description, author_id, icon='fa-leaf'):
    """Create a new discussion"""
    discussion_id = discussions_collection.insert_one({
        'topic': topic,
        'description': description,
        'author_id': ObjectId(author_id),
        'date_posted': datetime.now(),
        'icon': icon
    }).inserted_id
    return discussion_id

def get_recent_discussions(limit=3):
    """Get most recent discussions"""
    return list(discussions_collection.find().sort('date_posted', -1).limit(limit))

# Comment operations
def add_comment_to_discussion(discussion_id, author_id, content):
    """Add a comment to a discussion"""
    comment_id = comments_collection.insert_one({
        'discussion_id': ObjectId(discussion_id),
        'author_id': ObjectId(author_id),
        'content': content,
        'date_posted': datetime.now()
    }).inserted_id
    return comment_id

def get_comments_for_discussion(discussion_id):
    """Get comments for a discussion"""
    return list(comments_collection.find({'discussion_id': ObjectId(discussion_id)}).sort('date_posted', 1))

# Community member operations
def add_community_member(name, email, interests, farm_name=""):
    """Add a community member"""
    member_id = community_members_collection.insert_one({
        'name': name,
        'email': email,
        'farm_name': farm_name,
        'interests': interests,
        'date_joined': datetime.now()
    }).inserted_id
    return member_id

# AI conversation operations
def create_ai_conversation(user_id):
    """Create a new AI conversation"""
    now = datetime.now()
    conversation_id = ai_conversations_collection.insert_one({
        'user_id': ObjectId(user_id),
        'started_at': now,
        'last_activity': now
    }).inserted_id
    
    # Add welcome message
    add_ai_message(conversation_id, "ai", "Welcome! I'm your AI assistant. Ask me questions about indigenous cattle breeds, health concerns, or farming practices!")
    
    return conversation_id

def add_ai_message(conversation_id, sender_type, content):
    """Add a message to an AI conversation"""
    # Update conversation last activity
    ai_conversations_collection.update_one(
        {'_id': ObjectId(conversation_id)},
        {'$set': {'last_activity': datetime.now()}}
    )
    
    # Add message
    message_id = ai_messages_collection.insert_one({
        'conversation_id': ObjectId(conversation_id),
        'sender_type': sender_type,
        'content': content,
        'timestamp': datetime.now()
    }).inserted_id
    
    return message_id

def get_conversation_messages(conversation_id):
    """Get all messages for a conversation"""
    return list(ai_messages_collection.find(
        {'conversation_id': ObjectId(conversation_id)}
    ).sort('timestamp', 1))

# Search operations
def search_content(query):
    """Search articles and discussions for matching content"""
    articles = list(articles_collection.find({
        '$or': [
            {'title': {'$regex': query, '$options': 'i'}},
            {'content': {'$regex': query, '$options': 'i'}}
        ]
    }))
    
    discussions = list(discussions_collection.find({
        '$or': [
            {'topic': {'$regex': query, '$options': 'i'}},
            {'description': {'$regex': query, '$options': 'i'}}
        ]
    }))
    
    return {'articles': articles, 'discussions': discussions}
