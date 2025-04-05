/**
 * Secure API Key Management
 * This module provides a secure way to manage API keys
 */

(function() {
    // Private key storage with closure for enhanced security
    const keys = {
        // Default keys - in production these would be loaded securely
        'GEMINI_API': 'AIzaSyAdenkp-kwH3JiHQjL6NcMPaL8mXi5LGag',
        'VISION_API': 'AIzaSyCVtOs0sS8koTM-Z4wBLMFIjo2-4aPzdRU'
    };
    
    // Required keys check
    const requiredKeys = ['GEMINI_API', 'VISION_API'];
    
    // Public methods
    window.ApiKeys = {
        // Get a key by name
        getKey: function(keyName) {
            return keys[keyName] || null;
        },
        
        // Set a key (used for runtime changes)
        setKey: function(keyName, keyValue) {
            if (!keyName || !keyValue) return false;
            keys[keyName] = keyValue;
            return true;
        },
        
        // Check if a particular key is valid
        isKeyValid: function(keyValue) {
            // Simple validation that key is non-empty and looks like a Google API key
            return typeof keyValue === 'string' && 
                   keyValue.length > 20 && 
                   keyValue.startsWith('AIza');
        },
        
        // Validate that all required keys are present
        validateRequiredKeys: function() {
            const results = {
                allValid: true,
                details: {}
            };
            
            requiredKeys.forEach(key => {
                const isValid = !!keys[key] && this.isKeyValid(keys[key]);
                results.details[key] = isValid;
                
                if (!isValid) results.allValid = false;
            });
            
            return results;
        },
        
        // Test actual API connectivity
        testGeminiConnectivity: async function() {
            try {
                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${keys['GEMINI_API']}`, {
                    method: 'GET'
                });
                
                if (response.ok) {
                    return { success: true, status: response.status };
                } else {
                    return { 
                        success: false, 
                        status: response.status,
                        message: `API returned status ${response.status}`
                    };
                }
            } catch (error) {
                return { 
                    success: false, 
                    message: error.message || 'Connection failed' 
                };
            }
        }
    };
})();
