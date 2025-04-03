// API Configuration
const API_BASE_URL = 'http://localhost:8000/api';
const TOKEN_KEY = 'gausanskriti_auth_token';
const REFRESH_TOKEN_KEY = 'gausanskriti_refresh_token';

// Helper function to get stored auth token
function getAuthToken() {
    return localStorage.getItem(TOKEN_KEY);
}

// Helper function to set auth tokens
function setAuthTokens(accessToken, refreshToken) {
    localStorage.setItem(TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

// Helper function to remove tokens (logout)
function clearAuthTokens() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
}

// Setup default headers for API calls
function getHeaders() {
    const headers = {
        'Content-Type': 'application/json'
    };
    
    const token = getAuthToken();
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
}

// API Request Functions
const api = {
    // Authentication endpoints
    auth: {
        login: async (username, password) => {
            try {
                const response = await fetch(`${API_BASE_URL}/users/login/`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Login failed');
                }
                
                const data = await response.json();
                setAuthTokens(data.access, data.refresh);
                return data.user;
            } catch (error) {
                console.error('Login error:', error);
                throw error;
            }
        },
        
        register: async (userData) => {
            try {
                const response = await fetch(`${API_BASE_URL}/users/register/`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(userData)
                });
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(Object.values(errorData).flat().join(', '));
                }
                
                return await response.json();
            } catch (error) {
                console.error('Registration error:', error);
                throw error;
            }
        },
        
        logout: async () => {
            try {
                const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
                await fetch(`${API_BASE_URL}/users/logout/`, {
                    method: 'POST',
                    headers: getHeaders(),
                    body: JSON.stringify({ refresh: refreshToken })
                });
                clearAuthTokens();
            } catch (error) {
                console.error('Logout error:', error);
                // Clear tokens anyway
                clearAuthTokens();
            }
        },
        
        isAuthenticated: () => {
            return !!getAuthToken();
        }
    },
    
    // Cow-related endpoints
    cows: {
        getBreeds: async () => {
            const response = await fetch(`${API_BASE_URL}/cows/breeds/`, {
                headers: getHeaders()
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch cow breeds');
            }
            
            return await response.json();
        },
        
        analyzeCow: async (imageFile) => {
            const formData = new FormData();
            formData.append('image', imageFile);
            
            const response = await fetch(`${API_BASE_URL}/ai/cow-analysis/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${getAuthToken()}`
                    // Note: Don't set Content-Type with FormData
                },
                body: formData
            });
            
            if (!response.ok) {
                throw new Error('Failed to analyze cow image');
            }
            
            return await response.json();
        }
    },
    
    // AI Assistant endpoints
    ai: {
        createConversation: async () => {
            const response = await fetch(`${API_BASE_URL}/ai/assistant/`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ title: 'New Conversation' })
            });
            
            if (!response.ok) {
                throw new Error('Failed to create conversation');
            }
            
            return await response.json();
        },
        
        sendMessage: async (conversationId, message) => {
            const response = await fetch(`${API_BASE_URL}/ai/assistant/${conversationId}/send_message/`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ content: message })
            });
            
            if (!response.ok) {
                throw new Error('Failed to send message');
            }
            
            return await response.json();
        }
    },
    
    // Products endpoints
    products: {
        getProducts: async (filters = {}) => {
            const queryParams = new URLSearchParams(filters).toString();
            const response = await fetch(`${API_BASE_URL}/products/items/?${queryParams}`, {
                headers: getHeaders()
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch products');
            }
            
            return await response.json();
        },
        
        addToCart: async (productId, quantity) => {
            const response = await fetch(`${API_BASE_URL}/products/cart/add_item/`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ product: productId, quantity })
            });
            
            if (!response.ok) {
                throw new Error('Failed to add item to cart');
            }
            
            return await response.json();
        }
    },
    
    // Community endpoints
    community: {
        getArticles: async (page = 1) => {
            const response = await fetch(`${API_BASE_URL}/community/articles/?page=${page}`, {
                headers: getHeaders()
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch articles');
            }
            
            return await response.json();
        },
        
        getFeaturedArticle: async () => {
            const response = await fetch(`${API_BASE_URL}/community/articles/featured/`, {
                headers: getHeaders()
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch featured article');
            }
            
            return await response.json();
        },
        
        getDiscussions: async (page = 1) => {
            const response = await fetch(`${API_BASE_URL}/community/discussions/?page=${page}`, {
                headers: getHeaders()
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch discussions');
            }
            
            return await response.json();
        },
        
        joinCommunity: async (formData) => {
            const response = await fetch(`${API_BASE_URL}/community/join/`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(formData)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to join community');
            }
            
            return await response.json();
        },
        
        searchContent: async (query) => {
            const response = await fetch(`${API_BASE_URL}/community/search/?q=${encodeURIComponent(query)}`, {
                headers: getHeaders()
            });
            
            if (!response.ok) {
                throw new Error('Search failed');
            }
            
            return await response.json();
        }
    },
    
    // Dashboard data endpoints
    dashboard: {
        getCowHealth: async () => {
            const response = await fetch(`${API_BASE_URL}/cows/health/`, {
                headers: getHeaders()
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch cow health data');
            }
            
            return await response.json();
        },
        
        getMilkProduction: async (days = 30) => {
            const response = await fetch(`${API_BASE_URL}/cows/milk-production/?days=${days}`, {
                headers: getHeaders()
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch milk production data');
            }
            
            return await response.json();
        },
        
        getVaccinationSchedule: async () => {
            const response = await fetch(`${API_BASE_URL}/cows/vaccinations/`, {
                headers: getHeaders()
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch vaccination schedule');
            }
            
            return await response.json();
        }
    },
    
    // E-commerce endpoints
    ecommerce: {
        getFarmers: async (location = null) => {
            let url = `${API_BASE_URL}/farmers/list/`;
            if (location) {
                url += `?location=${encodeURIComponent(location)}`;
            }
            
            const response = await fetch(url, {
                headers: getHeaders()
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch farmers');
            }
            
            return await response.json();
        },
        
        getFarmerDetails: async (farmerId) => {
            const response = await fetch(`${API_BASE_URL}/farmers/details/${farmerId}/`, {
                headers: getHeaders()
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch farmer details');
            }
            
            return await response.json();
        }
    }
};

// Export the API client
window.api = api; // Make accessible globally
