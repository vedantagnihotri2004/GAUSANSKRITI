/**
 * Offline Data for Fallback
 * This file contains data that can be used when APIs fail or are unavailable
 */

window.offlineData = {
    // Cow breed information for offline analysis
    breeds: {
        "Gir": {
            origin: "Gujarat, India",
            characteristics: "Red/white spotted coat, curved horns, hump",
            weight: "Adult female: 385-420kg, Adult male: 550-650kg",
            milkYield: "Average 8-10L per day, 4.5-5.5% fat content",
            purity: "98%",
            traits: {
                heatTolerance: 0.95,
                diseaseResistance: 0.90,
                milkFatContent: 0.95
            }
        },
        "Sahiwal": {
            origin: "Punjab region (India/Pakistan)",
            characteristics: "Reddish-brown color, small horns",
            weight: "Adult female: 375-400kg, Adult male: 500-600kg",
            milkYield: "Average 8-12L per day, 4.5% fat content",
            purity: "95%",
            traits: {
                heatTolerance: 0.92,
                diseaseResistance: 0.95,
                milkFatContent: 0.90
            }
        },
        "Tharparkar": {
            origin: "Rajasthan, India",
            characteristics: "White/grey color, long horns",
            weight: "Adult female: 340-380kg, Adult male: 450-550kg",
            milkYield: "Average 7-8L per day, 4.5% fat content",
            purity: "97%",
            traits: {
                heatTolerance: 0.98,
                diseaseResistance: 0.93,
                milkFatContent: 0.85
            }
        },
        "Red Sindhi": {
            origin: "Sindh region (Pakistan/India)",
            characteristics: "Deep red color, small upward horns",
            weight: "Adult female: 340-380kg, Adult male: 420-520kg",
            milkYield: "Average 7-9L per day, 4.8% fat content",
            purity: "96%",
            traits: {
                heatTolerance: 0.94,
                diseaseResistance: 0.91,
                milkFatContent: 0.92
            }
        },
        "Kangayam": {
            origin: "Tamil Nadu, India",
            characteristics: "Grey-white coat, unique backward curved horns",
            weight: "Adult female: 330-370kg, Adult male: 450-550kg",
            milkYield: "Average 5-7L per day, 4.3% fat content",
            purity: "94%",
            traits: {
                heatTolerance: 0.96,
                diseaseResistance: 0.96,
                milkFatContent: 0.82
            }
        },
        "Unknown": {
            origin: "Indigenous breed",
            characteristics: "Indigenous characteristics",
            weight: "Adult female: 350-400kg, Adult male: 450-550kg",
            milkYield: "Average 6-8L per day",
            purity: "90%",
            traits: {
                heatTolerance: 0.90,
                diseaseResistance: 0.90,
                milkFatContent: 0.85
            }
        }
    },
    
    // Farmers data for e-commerce page
    farmers: [
        { 
            id: "f1", 
            name: "Vedant Agnihotri", 
            position: { lat: 28.6139, lng: 77.2090 }, 
            products: "Fresh Milk, Yogurt, Ghee", 
            rating: 5, 
            distance: "3.2",
            image: "https://randomuser.me/api/portraits/men/32.jpg" 
        },
        { 
            id: "f2", 
            name: "Somya Tyagi", 
            position: { lat: 28.5355, lng: 77.3910 }, 
            products: "Organic Milk, Ice Cream, Paneer", 
            rating: 4,
            distance: "4.7",
            image: "https://randomuser.me/api/portraits/women/44.jpg" 
        },
        { 
            id: "f3", 
            name: "Mukul Parmar", 
            position: { lat: 28.7041, lng: 77.1025 }, 
            products: "Premium Milk, Artisan Cheese, Butter", 
            rating: 5,
            distance: "2.1",
            image: "https://randomuser.me/api/portraits/men/67.jpg" 
        },
        { 
            id: "f4", 
            name: "Ritu Sharma", 
            position: { lat: 28.6508, lng: 77.2373 }, 
            products: "A2 Milk, Buttermilk, Ghee", 
            rating: 4,
            distance: "3.9",
            image: "https://randomuser.me/api/portraits/women/22.jpg" 
        },
        { 
            id: "f5", 
            name: "Kiran Patel", 
            position: { lat: 28.5921, lng: 77.0460 }, 
            products: "Gir Cow Milk, Curd, Ghee", 
            rating: 5,
            distance: "5.3",
            image: "https://randomuser.me/api/portraits/women/56.jpg" 
        }
    ],
    
    // Community content for when API is unavailable
    community: {
        featuredArticle: {
            id: 1,
            title: "Benefits of Indigenous Cattle Farming",
            content: "Indigenous cattle breeds of India like Gir, Sahiwal, and Tharparkar offer numerous advantages over exotic breeds. They are well-adapted to local climate conditions, resistant to diseases, and require less maintenance. Their milk contains A2 beta-casein protein which is considered healthier than A1 protein found in many exotic cattle breeds. Indigenous cows can thrive on locally available feed resources and are more sustainable for small-scale farmers. Supporting indigenous cattle farming helps preserve genetic diversity and promotes sustainable agriculture practices.",
            author: "Dr. Rajesh Kumar",
            date_posted: "2023-06-15"
        },
        recentArticles: [
            {
                id: 2,
                title: "Best Practices for Gir Cattle Management",
                content: "Gir cattle, native to Gujarat, are known for their distinctive curved horns and red-spotted white coat. For optimal management, provide adequate shade and clean water. Feed them a balanced diet of green fodder (15-20kg), dry fodder (5-7kg), and concentrate (2-3kg) for lactating cows. Regular health check-ups and vaccinations against FMD, HS, and BQ are essential. Maintain clean housing with proper drainage and ventilation to prevent disease. Follow a systematic breeding program with proper heat detection and timely insemination for maximum reproductive efficiency.",
                author: "Suresh Patel",
                date_posted: "2023-07-02"
            },
            {
                id: 3,
                title: "Organic Feeding Strategies for Indigenous Cows",
                content: "Organic feeding for indigenous cows should focus on locally sourced, chemical-free fodder and feed. Cultivate organic napier grass, guinea grass, and legumes like stylo and lucerne. Supplement with homemade concentrate mixtures using organic grains and oilcakes. Azolla cultivation provides a rich protein source. Traditional herbs like turmeric, neem, and tulsi can be added to boost immunity. Use jaggery water with salt as an energy drink during summer. Silage preparation from excess fodder ensures year-round supply. This approach improves milk quality and reduces dependency on external inputs.",
                author: "Meera Singh",
                date_posted: "2023-07-20"
            },
            {
                id: 4,
                title: "Value Addition to Milk from Indigenous Cows",
                content: "Indigenous cow milk, with its high fat content and rich A2 protein, is perfect for value-added products. Ghee production is highly profitable, with indigenous cow ghee commanding premium prices. Traditional sweets like pedha, khoa, and paneer yield excellent results. Fermented products like curd and buttermilk benefit from the unique composition of indigenous milk. Proper packaging, branding, and direct marketing channels can significantly increase farm income. Building a reputation for authentic, pure products from indigenous cows can establish a loyal customer base willing to pay premium prices.",
                author: "Anita Desai",
                date_posted: "2023-08-05"
            }
        ],
        discussions: [
            {
                id: 1,
                topic: "Effective Natural Remedies for Common Cattle Ailments",
                description: "Share your knowledge about traditional treatments using herbs and natural ingredients.",
                author_id: 123,
                author_name: "Ramesh Joshi",
                date_posted: "2023-08-10",
                comments_count: 24,
                icon: "fa-leaf"
            },
            {
                id: 2,
                topic: "Marketing Strategies for Indigenous Cow Products",
                description: "Let's discuss how to effectively market and get premium prices for indigenous cow products.",
                author_id: 134,
                author_name: "Priya Sharma",
                date_posted: "2023-08-07",
                comments_count: 18,
                icon: "fa-shopping-cart"
            },
            {
                id: 3,
                topic: "Seasonal Feeding Adjustments for Indigenous Cows",
                description: "How do you adjust your feeding practices across different seasons?",
                author_id: 156,
                author_name: "Harish Singh",
                date_posted: "2023-08-01",
                comments_count: 15,
                icon: "fa-sun"
            }
        ]
    }
};

// Provide helper functions to access offline data
window.getOfflineData = {
    // Get breed information
    breedInfo: function(breedName) {
        // Normalize breed name for case-insensitive comparison
        const normalizedName = breedName.trim().toLowerCase();
        
        // Find the breed (case insensitive)
        const breed = Object.keys(window.offlineData.breeds).find(key => 
            key.toLowerCase() === normalizedName
        );
        
        // Return the breed info or the unknown breed as fallback
        return window.offlineData.breeds[breed] || window.offlineData.breeds["Unknown"];
    },
    
    // Get community data
    getFeaturedArticle: function() {
        return { article: window.offlineData.community.featuredArticle };
    },
    
    getRecentArticles: function(page = 1, perPage = 3) {
        const start = (page - 1) * perPage;
        const end = start + perPage;
        const articles = window.offlineData.community.recentArticles.slice(start, end);
        
        return {
            results: articles,
            count: window.offlineData.community.recentArticles.length,
            next: end < window.offlineData.community.recentArticles.length ? page + 1 : null,
            previous: page > 1 ? page - 1 : null
        };
    },
    
    getDiscussions: function(page = 1, perPage = 3) {
        const start = (page - 1) * perPage;
        const end = start + perPage;
        const discussions = window.offlineData.community.discussions.slice(start, end);
        
        return {
            results: discussions,
            count: window.offlineData.community.discussions.length,
            next: end < window.offlineData.community.discussions.length ? page + 1 : null,
            previous: page > 1 ? page - 1 : null
        };
    }
};
