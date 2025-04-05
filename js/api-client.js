/**
 * Enhanced API Client Utility
 * Provides robust fetch operations with automatic retries and fallbacks
 */

class ApiClient {
  constructor(options = {}) {
    this.baseUrl = options.baseUrl || 'https://api.gausanskriti.com/api/v1';
    this.timeout = options.timeout || 8000;
    this.retries = options.retries || 2;
    this.retryDelay = options.retryDelay || 1000;
    this.enableFallback = options.enableFallback !== false;
    this.suppressConnectionErrors = options.suppressConnectionErrors !== false;
  }

  /**
   * Fetch data with automatic retries and fallbacks
   */
  async fetch(endpoint, options = {}) {
    let attempt = 0;
    
    while (attempt <= this.retries) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);
        
        const fetchOptions = {
          ...options,
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
            ...this._getAuthHeaders(),
            ...options.headers,
          }
        };
        
        const response = await fetch(`${this.baseUrl}${endpoint}`, fetchOptions);
        clearTimeout(timeoutId);
        
        // Check if response is for cow-related endpoints that require special processing
        if (endpoint.includes('/cows/') && response.headers.get('content-type')?.includes('image')) {
          return await response.blob();
        }
        
        if (!response.ok) {
          throw new Error(`API responded with status: ${response.status}`);
        }
        
        return await response.json();
      } catch (error) {
        attempt++;
        
        if (error.name === 'AbortError') {
          console.warn(`Request timeout for ${endpoint}`);
        } else {
          // Log the error but don't show to user if suppressConnectionErrors is true
          console.error(`API request failed (attempt ${attempt}/${this.retries + 1}):`, error);
        }
        
        if (attempt <= this.retries) {
          // Wait before retrying with exponential backoff
          await new Promise(resolve => setTimeout(resolve, this.retryDelay * Math.pow(2, attempt - 1)));
        } else if (this.enableFallback) {
          // All retries failed, try to get data from fallback
          return await this._getFallbackData(endpoint);
        } else {
          // If we're suppressing connection errors for user experience, return empty data instead of throwing
          if (this.suppressConnectionErrors) {
            console.error('Connection issues detected, but suppressing user-facing error');
            return this._getEmptyResponseForEndpoint(endpoint);
          }
          throw error;
        }
      }
    }
  }
  
  /**
   * Get authentication headers if user is logged in
   */
  _getAuthHeaders() {
    const token = localStorage.getItem('auth_token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }
  
  /**
   * Get fallback data for offline use
   */
  async _getFallbackData(endpoint) {
    // Check if we have offline data available
    if (!window.getOfflineData) {
      throw new Error('No fallback data available');
    }

    // Map API endpoints to offline data methods
    const endpointMap = {
      '/community/featured/': 'getFeaturedArticle',
      '/community/highlight/': 'getFeaturedArticle',
      '/community/articles/': 'getRecentArticles',
      '/community/discussions/': 'getDiscussions',
      '/ecommerce/farmers/': 'getFarmers',
      '/cows/breeds/': 'getCowBreeds',
      '/cows/breed/': 'getCowBreedDetails',
      '/cows/nearby-farmers/': 'getNearbyFarmers',
      '/cows/care-guide/': 'getCowCareGuide'
    };
    
    // Clean up endpoint to match our map (remove query params)
    const cleanEndpoint = endpoint.split('?')[0];
    
    // Get the correct fallback method
    const fallbackMethod = endpointMap[cleanEndpoint];
    
    if (!fallbackMethod || !window.getOfflineData[fallbackMethod]) {
      throw new Error(`No fallback available for ${endpoint}`);
    }
    
    // Return the fallback data
    return window.getOfflineData[fallbackMethod]();
  }
  
  /**
   * Returns empty but valid response structure for endpoints when connection fails
   */
  _getEmptyResponseForEndpoint(endpoint) {
    if (endpoint.includes('/cows/breeds')) {
      return { breeds: [] };
    } else if (endpoint.includes('/cows/nearby-farmers')) {
      return { farmers: [] };
    } else if (endpoint.includes('/cows/breed/')) {
      return { name: 'Unknown', description: 'Information temporarily unavailable', care: [], weight: 'N/A', images: [] };
    } else {
      return { data: [] };
    }
  }
  
  /**
   * Get information about indigenous cow breeds
   */
  async getIndigenousCowBreeds() {
    return this.fetch('/cows/breeds/');
  }
  
  /**
   * Get detailed information about a specific cow breed
   */
  async getCowBreedDetails(breedId) {
    return this.fetch(`/cows/breed/${breedId}`);
  }
  
  /**
   * Get nearby farmers who maintain indigenous cows
   */
  async getNearbyFarmers(lat, lng, radius = 25) {
    return this.fetch(`/cows/nearby-farmers/?lat=${lat}&lng=${lng}&radius=${radius}`);
  }
  
  /**
   * Get care guide for indigenous cows
   */
  async getCowCareGuide(breedId = null) {
    const endpoint = breedId ? `/cows/care-guide/${breedId}` : '/cows/care-guide/';
    return this.fetch(endpoint);
  }
  
  /**
   * Process image through vision API to identify cow breed
   */
  async identifyCowBreed(imageBlob) {
    const formData = new FormData();
    formData.append('image', imageBlob);
    
    return this.fetch('/vision/identify-cow/', {
      method: 'POST',
      headers: {
        // Remove content-type so browser can set it with boundary for FormData
        'Content-Type': undefined
      },
      body: formData
    });
  }
}

// Create a global instance
window.apiClient = new ApiClient({
  suppressConnectionErrors: true  // Prevent connection popups
});
