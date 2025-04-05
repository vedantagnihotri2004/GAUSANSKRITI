/**
 * API Client for GauSanskriti
 * Handles all API requests for the application
 */

// API base URL - would be configured per environment
const API_BASE_URL = 'https://api.gausanskriti.com/api/v1';

// Centralized API client
window.api = {
    // Auth methods
    auth: {
        login: async (email, password) => {
            try {
                const response = await fetch(`${API_BASE_URL}/auth/login/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Login failed');
                }
                
                const data = await response.json();
                
                // Store token in localStorage
                localStorage.setItem('auth_token', data.token);
                localStorage.setItem('user_data', JSON.stringify(data.user));
                
                return data.user;
            } catch (error) {
                console.error('Login error:', error);
                throw error;
            }
        },
        
        logout: async () => {
            // Clear localStorage
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user_data');
            
            // Optionally call logout endpoint
            try {
                await fetch(`${API_BASE_URL}/auth/logout/`, {
                    method: 'POST',
                    headers: getAuthHeaders()
                });
            } catch (error) {
                console.error('Logout error:', error);
                // Continue with local logout even if server logout fails
            }
        },
        
        register: async (userData) => {
            try {
                const response = await fetch(`${API_BASE_URL}/auth/register/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(userData)
                });
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Registration failed');
                }
                
                return await response.json();
            } catch (error) {
                console.error('Registration error:', error);
                throw error;
            }
        },
        
        isAuthenticated: () => {
            return !!localStorage.getItem('auth_token');
        },
        
        getCurrentUser: () => {
            const userData = localStorage.getItem('user_data');
            return userData ? JSON.parse(userData) : null;
        }
    },
    
    // Community methods
    community: {
        getFeaturedArticle: async () => {
            const response = await fetch(`${API_BASE_URL}/community/featured/`, {
                headers: getAuthHeaders()
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch featured article');
            }
            
            return await response.json();
        },
        
        getHighlightedArticle: async () => {
            const response = await fetch(`${API_BASE_URL}/community/highlight/`, {
                headers: getAuthHeaders()
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch highlighted article');
            }
            
            return await response.json();
        },
        
        getArticles: async (page = 1) => {
            const response = await fetch(`${API_BASE_URL}/community/articles/?page=${page}`, {
                headers: getAuthHeaders()
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch articles');
            }
            
            return await response.json();
        },
        
        getDiscussions: async (page = 1) => {
            const response = await fetch(`${API_BASE_URL}/community/discussions/?page=${page}`, {
                headers: getAuthHeaders()
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch discussions');
            }
            
            return await response.json();
        },
        
        joinCommunity: async (formData) => {
            const response = await fetch(`${API_BASE_URL}/community/join/`, {
                method: 'POST',
                headers: {
                    ...getAuthHeaders(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            
            if (!response.ok) {
                throw new Error('Failed to join community');
            }
            
            return await response.json();
        },
        
        searchContent: async (query) => {
            const response = await fetch(`${API_BASE_URL}/community/search/?q=${encodeURIComponent(query)}`, {
                headers: getAuthHeaders()
            });
            
            if (!response.ok) {
                throw new Error('Search failed');
            }
            
            return await response.json();
        }
    },
    
    // E-commerce methods
    ecommerce: {
        getFarmers: async (location = null) => {
            let url = `${API_BASE_URL}/ecommerce/farmers/`;
            if (location) {
                url += `?location=${encodeURIComponent(location)}`;
            }
            
            const response = await fetch(url, {
                headers: getAuthHeaders()
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch farmers data');
            }
            
            return await response.json();
        },
        
        getFarmerDetails: async (farmerId) => {
            const response = await fetch(`${API_BASE_URL}/ecommerce/farmers/${farmerId}/`, {
                headers: getAuthHeaders()
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch farmer details');
            }
            
            return await response.json();
        },
        
        getProducts: async (category = null) => {
            let url = `${API_BASE_URL}/ecommerce/products/`;
            if (category) {
                url += `?category=${encodeURIComponent(category)}`;
            }
            
            const response = await fetch(url, {
                headers: getAuthHeaders()
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch products');
            }
            
            return await response.json();
        }
    },
    
    // AI analysis methods
    ai: {
        analyzeImage: async (imageData) => {
            const response = await fetch(`${API_BASE_URL}/ai/analyze/`, {
                method: 'POST',
                headers: {
                    ...getAuthHeaders(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ image: imageData })
            });
            
            if (!response.ok) {
                throw new Error('Image analysis failed');
            }
            
            return await response.json();
        },
        
        getAiAssistantResponse: async (query) => {
            const response = await fetch(`${API_BASE_URL}/ai/assistant/`, {
                method: 'POST',
                headers: {
                    ...getAuthHeaders(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ query })
            });
            
            if (!response.ok) {
                throw new Error('AI assistant request failed');
            }
            
            return await response.json();
        }
    }
};

// Helper function to get authentication headers
function getAuthHeaders() {
    const token = localStorage.getItem('auth_token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
}

// Direct access to Gemini API for client-side use
// Note: In production, proxying through your backend is recommended for API key security
window.api.gemini = {
    generateResponse: async (prompt, options = {}) => {
        const GEMINI_API_KEY = window.ApiKeys?.getKey('GEMINI_API') || 'YOUR_API_KEY'; // Secure in production
        
        const defaultOptions = {
            temperature: 0.2,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024
        };
        
        const mergedOptions = { ...defaultOptions, ...options };
        
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }],
                generationConfig: mergedOptions
            })
        });
        
        if (!response.ok) {
            throw new Error(`Gemini API error: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
    }
};
