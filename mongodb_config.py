from pymongo import MongoClient
import os
import atexit
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# MongoDB connection string from environment variable or use default
MONGO_URI = os.environ.get('MONGO_URI', 'mongodb://localhost:27017')

# Create MongoDB client
client = MongoClient(MONGO_URI)

# Define database
db = client['gausanskriti_db']

# Define collections
users_collection = db['users']
profiles_collection = db['profiles']
articles_collection = db['articles']
discussions_collection = db['discussions']
comments_collection = db['comments']
community_members_collection = db['community_members']
forum_categories_collection = db['forum_categories']
forum_topics_collection = db['forum_topics']
forum_replies_collection = db['forum_replies']
events_collection = db['events']
event_participants_collection = db['event_participants']
cow_breeds_collection = db['cow_breeds']
cows_collection = db['cows']
cow_analyses_collection = db['cow_analyses']
ai_conversations_collection = db['ai_conversations']
ai_messages_collection = db['ai_messages']

# Additional collections for Django models
farmers_collection = db['farmers']
farmer_reviews_collection = db['farmer_reviews']
products_collection = db['products']
product_categories_collection = db['product_categories']
product_reviews_collection = db['product_reviews']
orders_collection = db['orders']
order_items_collection = db['order_items']
cart_items_collection = db['cart_items']
cow_health_collection = db['cow_health']
vaccinations_collection = db['vaccinations']
milk_production_collection = db['milk_production']

# Create indexes for better query performance
users_collection.create_index('username', unique=True)
users_collection.create_index('email', unique=True)
articles_collection.create_index('date_posted')
discussions_collection.create_index('date_posted')
ai_conversations_collection.create_index('user_id')
forum_topics_collection.create_index('category_id')
forum_replies_collection.create_index('topic_id')
comments_collection.create_index('discussion_id')
event_participants_collection.create_index([('event_id', 1), ('user_id', 1)], unique=True)

# Additional indexes for new collections
farmers_collection.create_index('user_id')
products_collection.create_index('farmer_id')
products_collection.create_index('category_id')
product_reviews_collection.create_index([('product_id', 1), ('reviewer_id', 1)])
orders_collection.create_index('customer_id')
order_items_collection.create_index('order_id')
cart_items_collection.create_index([('user_id', 1), ('product_id', 1)], unique=True)
cow_health_collection.create_index('cow_id')
vaccinations_collection.create_index('cow_id')
milk_production_collection.create_index([('cow_id', 1), ('date', 1)])

# Close connection when application exits
def close_mongodb_connection():
    client.close()
    print("MongoDB connection closed.")

atexit.register(close_mongodb_connection)
