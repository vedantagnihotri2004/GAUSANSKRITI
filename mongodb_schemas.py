from pymongo import MongoClient
from mongodb_config import db

# Schema validation for users
db.command('collMod', 'users', validator={
    '$jsonSchema': {
        'bsonType': 'object',
        'required': ['username', 'email', 'password_hash', 'date_joined'],
        'properties': {
            'username': {'bsonType': 'string'},
            'email': {'bsonType': 'string'},
            'password_hash': {'bsonType': 'string'},
            'first_name': {'bsonType': 'string'},
            'last_name': {'bsonType': 'string'},
            'is_active': {'bsonType': 'bool'},
            'is_staff': {'bsonType': 'bool'},
            'date_joined': {'bsonType': 'date'}
        }
    }
})

# Schema validation for profiles
db.command('collMod', 'profiles', validator={
    '$jsonSchema': {
        'bsonType': 'object',
        'required': ['user_id'],
        'properties': {
            'user_id': {'bsonType': 'objectId'},
            'farm_name': {'bsonType': 'string'},
            'location': {'bsonType': 'string'},
            'interests': {'bsonType': 'string'},
            'bio': {'bsonType': 'string'},
            'profile_image': {'bsonType': 'string'}
        }
    }
})

# Schema validation for articles
db.command('collMod', 'articles', validator={
    '$jsonSchema': {
        'bsonType': 'object',
        'required': ['title', 'content', 'author_id', 'date_posted'],
        'properties': {
            'title': {'bsonType': 'string'},
            'content': {'bsonType': 'string'},
            'author_id': {'bsonType': 'objectId'},
            'date_posted': {'bsonType': 'date'},
            'is_featured': {'bsonType': 'bool'}
        }
    }
})

# Schema validation for discussions
db.command('collMod', 'discussions', validator={
    '$jsonSchema': {
        'bsonType': 'object',
        'required': ['topic', 'description', 'author_id', 'date_posted'],
        'properties': {
            'topic': {'bsonType': 'string'},
            'description': {'bsonType': 'string'},
            'author_id': {'bsonType': 'objectId'},
            'date_posted': {'bsonType': 'date'},
            'icon': {'bsonType': 'string'}
        }
    }
})

# Schema validation for comments
db.command('collMod', 'comments', validator={
    '$jsonSchema': {
        'bsonType': 'object',
        'required': ['discussion_id', 'author_id', 'content', 'date_posted'],
        'properties': {
            'discussion_id': {'bsonType': 'objectId'},
            'author_id': {'bsonType': 'objectId'},
            'content': {'bsonType': 'string'},
            'date_posted': {'bsonType': 'date'}
        }
    }
})

# Schema validation for community members
db.command('collMod', 'community_members', validator={
    '$jsonSchema': {
        'bsonType': 'object',
        'required': ['name', 'email', 'interests', 'date_joined'],
        'properties': {
            'name': {'bsonType': 'string'},
            'email': {'bsonType': 'string'},
            'farm_name': {'bsonType': 'string'},
            'interests': {'bsonType': 'string'},
            'date_joined': {'bsonType': 'date'}
        }
    }
})

# Schema for forum categories
db.command('collMod', 'forum_categories', validator={
    '$jsonSchema': {
        'bsonType': 'object',
        'required': ['name', 'description'],
        'properties': {
            'name': {'bsonType': 'string'},
            'description': {'bsonType': 'string'},
        }
    }
})

# Schema for forum topics
db.command('collMod', 'forum_topics', validator={
    '$jsonSchema': {
        'bsonType': 'object',
        'required': ['title', 'content', 'category_id', 'created_by', 'created_at'],
        'properties': {
            'title': {'bsonType': 'string'},
            'content': {'bsonType': 'string'},
            'category_id': {'bsonType': 'objectId'},
            'created_by': {'bsonType': 'objectId'},
            'created_at': {'bsonType': 'date'},
            'updated_at': {'bsonType': 'date'},
            'is_closed': {'bsonType': 'bool'},
            'is_sticky': {'bsonType': 'bool'},
            'views': {'bsonType': 'int'}
        }
    }
})

# Schema for AI conversations
db.command('collMod', 'ai_conversations', validator={
    '$jsonSchema': {
        'bsonType': 'object',
        'required': ['user_id', 'started_at', 'last_activity'],
        'properties': {
            'user_id': {'bsonType': 'objectId'},
            'started_at': {'bsonType': 'date'},
            'last_activity': {'bsonType': 'date'},
        }
    }
})

# Schema for AI messages
db.command('collMod', 'ai_messages', validator={
    '$jsonSchema': {
        'bsonType': 'object',
        'required': ['conversation_id', 'sender_type', 'content', 'timestamp'],
        'properties': {
            'conversation_id': {'bsonType': 'objectId'},
            'sender_type': {'bsonType': 'string', 'enum': ['user', 'ai', 'system']},
            'content': {'bsonType': 'string'},
            'timestamp': {'bsonType': 'date'},
        }
    }
})
