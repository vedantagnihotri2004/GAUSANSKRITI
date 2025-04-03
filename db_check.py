import sys
from datetime import datetime
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError

try:
    # Import the MongoDB configuration
    from mongodb_config import client, db, users_collection
    
    def check_db_connection():
        print("🔍 Testing MongoDB connection...")
        try:
            # The ismaster command is cheap and does not require auth
            client.admin.command('ismaster')
            print("✅ MongoDB connection successful!")
            return True
        except ConnectionFailure:
            print("❌ MongoDB connection failed! Check if MongoDB is running.")
            return False
        except ServerSelectionTimeoutError:
            print("❌ MongoDB server selection timeout! Check your connection string and network.")
            return False
    
    def check_collections():
        print("\n🔍 Checking collections...")
        collections = db.list_collection_names()
        print(f"📋 Found {len(collections)} collections: {', '.join(collections)}")
        
        expected_collections = [
            'users', 'profiles', 'articles', 'discussions', 'comments',
            'community_members', 'forum_categories', 'forum_topics',
            'forum_replies', 'events', 'event_participants', 'cow_breeds',
            'cows', 'cow_analyses', 'ai_conversations', 'ai_messages',
            'farmers', 'farmer_reviews', 'products', 'product_categories', 
            'product_reviews', 'orders', 'order_items', 'cart_items',
            'cow_health', 'vaccinations', 'milk_production'
        ]
        
        missing_collections = [coll for coll in expected_collections if coll not in collections]
        if missing_collections:
            print(f"⚠️ Missing expected collections: {', '.join(missing_collections)}")
        else:
            print("✅ All expected collections are present.")
    
    def test_write_read():
        print("\n🔍 Testing read/write operations...")
        try:
            # Create a test document
            test_doc = {
                "username": f"test_user_{datetime.now().timestamp()}",
                "email": f"test_{datetime.now().timestamp()}@example.com",
                "test": True,
                "created_at": datetime.now()
            }
            
            # Insert the test document
            result = users_collection.insert_one(test_doc)
            print(f"✅ Document inserted with ID: {result.inserted_id}")
            
            # Read the document back
            retrieved = users_collection.find_one({"_id": result.inserted_id})
            if retrieved:
                print(f"✅ Successfully retrieved the test document")
                
                # Clean up - delete the test document
                users_collection.delete_one({"_id": result.inserted_id})
                print(f"✅ Test document deleted")
            else:
                print("❌ Failed to retrieve the test document")
        except Exception as e:
            print(f"❌ Error during read/write test: {str(e)}")
            
    if __name__ == "__main__":
        print("=" * 50)
        print("GAUSANSKRITI DATABASE CHECK")
        print("=" * 50)
        
        if check_db_connection():
            check_collections()
            test_write_read()
            
        print("\n" + "=" * 50)
        print("Database check complete!")
        print("=" * 50)
            
except ImportError:
    print("❌ Could not import MongoDB configuration. Make sure mongodb_config.py is accessible.")
    sys.exit(1)
