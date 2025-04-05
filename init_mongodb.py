from mongodb_config import db, client
from mongodb_data_access import (
    create_user, create_article, create_discussion, add_comment_to_discussion,
    add_community_member
)
from datetime import datetime, timedelta
import random

def initialize_database():
    """Initialize MongoDB with sample data"""
    print("Initializing MongoDB database...")
    
    # Clear existing data
    for collection in db.list_collection_names():
        db[collection].drop()
        print(f"Dropped collection: {collection}")
    
    # Create users
    print("Creating users...")
    admin_id = create_user("admin", "admin@example.com", "adminpassword", "Admin", "User", is_staff=True)
    user1_id = create_user("farmer1", "farmer1@example.com", "password123", "Ravi", "Kumar")
    user2_id = create_user("farmer2", "farmer2@example.com", "password456", "Anita", "Sharma")
    
    # Create articles
    print("Creating articles...")
    featured_id = create_article(
        "Improving Milk Production Through Better Nutrition",
        """Learn how advanced nutrition strategies are helping farms to significantly increase production up to 35%. Our research team has identified key nutrients that not only improve yield but also enhance milk quality and cattle health.
        
        Balanced feed formulas that include the right mix of proteins, energy, minerals, and vitamins are transforming the dairy industry. Indigenous cows respond particularly well to natural supplements that align with their digestive systems.
        
        This comprehensive study spans three years of research across different climatic zones in India, providing region-specific recommendations.""",
        admin_id,
        is_featured=True
    )
    
    create_article(
        "Sustainable Pasture Management Techniques",
        """Discover how innovative pasture management can improve livestock health and productivity while maintaining ecological balance in your farm environment.
        
        Rotational grazing systems have shown a 40% increase in pasture utilization when implemented correctly. This approach allows grass recovery periods that promote deeper root systems and greater drought resistance.
        
        Our team of agricultural experts has compiled best practices from successful farms across India, with special attention to methods that work well with indigenous cattle breeds.""",
        user1_id
    )
    
    create_article(
        "Robotic Milking: One Year Later",
        """Exploring the transformative impact of robotic technology in modern dairy farming with real results from farms that made the transition.
        
        After implementing robotic milking systems, participating farms reported labor savings of up to 30% while seeing milk quality improvements. Cows adapted to the new systems within 2-3 weeks on average.
        
        The financial analysis shows that despite the high initial investment, the return on investment timeline averages 4-5 years for medium-sized operations.""",
        user2_id
    )
    
    create_article(
        "Climate Adaptation for Dairy Farms",
        """Essential strategies to help your dairy operation adapt to changing climate conditions while maintaining optimal production levels.
        
        As temperatures rise and weather patterns become less predictable, dairy farmers need to implement heat management systems, water conservation techniques, and consider climate-resistant fodder crops.
        
        Indigenous breeds like Gir, Sahiwal, and Tharparkar show remarkable resilience to climatic stress when properly managed.""",
        user1_id
    )
    
    # Create discussions
    print("Creating discussions...")
    discussion1_id = create_discussion(
        "Organic Feed Alternatives",
        "Discussing cost-effective organic feed options for small dairy operations",
        user1_id,
        "fa-leaf"
    )
    
    discussion2_id = create_discussion(
        "Equipment Sharing Network",
        "Creating a local network for sharing specialized dairy equipment",
        user2_id,
        "fa-tractor"
    )
    
    discussion3_id = create_discussion(
        "Milk Price Forecasting",
        "Analyzing market trends and predicting future milk prices",
        admin_id,
        "fa-chart-line"
    )
    
    # Add comments
    print("Adding comments...")
    add_comment_to_discussion(
        discussion1_id,
        user2_id,
        "I've had great results using sprouted grains as part of my feed mix. It's cost-effective if you set up a simple sprouting system."
    )
    
    add_comment_to_discussion(
        discussion1_id,
        admin_id,
        "Local agricultural universities often have resources on region-specific organic feed formulations. Has anyone tried reaching out to them?"
    )
    
    add_comment_to_discussion(
        discussion2_id,
        user1_id,
        "I think we should create a mobile app where farmers can list equipment they're willing to share and the dates they're available."
    )
    
    add_comment_to_discussion(
        discussion2_id,
        user2_id,
        "Great idea! We should also establish some standards for maintenance and cleaning."
    )
    
    # Add community members
    print("Adding community members...")
    add_community_member(
        "Suresh Patel",
        "suresh@example.com",
        "Interested in indigenous cow breeds and organic farming methods",
        "Green Valley Farm"
    )
    
    add_community_member(
        "Priya Singh",
        "priya@example.com",
        "Looking to learn about modern dairy techniques compatible with traditional practices",
        "Heritage Dairy"
    )
    
    print("Database initialization complete!")

if __name__ == "__main__":
    # Run initialization
    try:
        initialize_database()
    except Exception as e:
        print(f"Error during initialization: {e}")
    finally:
        # Close connection
        client.close()
