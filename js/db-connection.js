/**
 * Database connection checker for frontend
 * This script checks if the API and database are accessible
 */

class DatabaseConnection {
    constructor() {
        this.statusElement = null;
        this.apiBaseUrl = 'http://localhost:8000/api';
        this.connectionStatus = {
            api: false,
            database: false,
            aiServices: false
        };
        this.retryCount = 0;
        this.maxRetries = 3;
        this.showStatusIndicator = false; // Set to false by default
    }

    // Initialize connection status element
    init(statusElementId) {
        this.statusElement = document.getElementById(statusElementId);
        if (!this.statusElement) {
            console.warn('Status element not found, creating one');
            this.statusElement = document.createElement('div');
            this.statusElement.id = statusElementId || 'db-connection-status';
            this.statusElement.style.position = 'fixed';
            this.statusElement.style.bottom = '10px';
            this.statusElement.style.left = '10px';
            this.statusElement.style.padding = '5px 10px';
            this.statusElement.style.borderRadius = '3px';
            this.statusElement.style.fontSize = '12px';
            this.statusElement.style.zIndex = '9999';
            this.statusElement.style.display = 'none'; // Hide by default
            document.body.appendChild(this.statusElement);
        } else {
            // Hide existing status element
            this.statusElement.style.display = 'none';
        }
        
        this.checkConnection();
        this.checkAIServices();
    }

    // Check API and database connection
    async checkConnection() {
        // Don't show checking status visually
        if (this.showStatusIndicator) {
            this.updateStatus('checking', 'Checking connection...');
        }
        
        try {
            // Try to connect to health check endpoint
            const response = await fetch(`${this.apiBaseUrl}/health/`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                cache: 'no-cache',
                // Add a timeout to prevent long waits
                signal: AbortSignal.timeout(5000)
            });
            
            if (response.ok) {
                const data = await response.json();
                this.connectionStatus.api = true;
                this.connectionStatus.database = data.database_connected;
                
                if (this.connectionStatus.database) {
                    if (this.showStatusIndicator) {
                        this.updateStatus('connected', 'Connected to database');
                    }
                    // Reset retry count on success
                    this.retryCount = 0;
                } else {
                    if (this.showStatusIndicator) {
                        this.updateStatus('error', 'API online but database unreachable');
                    }
                    this.tryReconnect();
                }
            } else {
                if (this.showStatusIndicator) {
                    this.updateStatus('error', 'API server unreachable');
                }
                this.tryReconnect();
            }
        } catch (error) {
            console.error('Connection check failed:', error);
            
            if (error.name === 'TimeoutError' || error.name === 'AbortError') {
                if (this.showStatusIndicator) {
                    this.updateStatus('error', 'Connection timeout');
                }
            } else {
                if (this.showStatusIndicator) {
                    this.updateStatus('error', 'Connection failed');
                }
            }
            
            // Try to reconnect after failure
            this.tryReconnect();
        }
    }
    
    // Check if AI services (Gemini, Vision API) are accessible
    async checkAIServices() {
        // Validate API keys first
        const apiValidation = window.ApiKeys?.validateRequiredKeys();
        
        if (!apiValidation || !apiValidation.allValid) {
            this.connectionStatus.aiServices = false;
            console.warn('AI services unavailable: Missing or invalid API keys');
            return;
        }
        
        try {
            // For Gemini API - simple request to check access
            const geminiUrl = 'https://generativelanguage.googleapis.com/v1beta/models?key=' + 
                              window.ApiKeys.getKey('GEMINI_API');
            
            const response = await fetch(geminiUrl, {
                method: 'GET',
                signal: AbortSignal.timeout(3000)
            });
            
            if (response.ok) {
                this.connectionStatus.aiServices = true;
                console.log('AI services available');
            } else {
                throw new Error(`Gemini API returned status: ${response.status}`);
            }
        } catch (error) {
            console.warn('AI services check failed:', error);
            this.connectionStatus.aiServices = false;
        }
    }

    // Try to reconnect with exponential backoff
    tryReconnect() {
        if (this.retryCount < this.maxRetries) {
            this.retryCount++;
            const backoffTime = Math.pow(2, this.retryCount) * 1000; // Exponential backoff: 2s, 4s, 8s
            
            if (this.showStatusIndicator) {
                this.updateStatus('checking', `Reconnecting (${this.retryCount}/${this.maxRetries})...`);
            }
            
            setTimeout(() => {
                this.checkConnection();
            }, backoffTime);
        } else {
            if (this.showStatusIndicator) {
                this.updateStatus('error', 'Connection issues detected');
            }
        }
    }

    // Update the status indicator
    updateStatus(status, message) {
        if (!this.statusElement || !this.showStatusIndicator) return;
        
        this.statusElement.textContent = message;
        
        // Apply appropriate styling
        this.statusElement.className = ''; // Clear existing classes
        this.statusElement.classList.add('db-status', `db-status-${status}`);
        
        switch (status) {
            case 'connected':
                this.statusElement.style.backgroundColor = '#4CAF50';
                this.statusElement.style.color = 'white';
                break;
            case 'checking':
                this.statusElement.style.backgroundColor = '#FFC107';
                this.statusElement.style.color = 'black';
                break;
            case 'error':
                this.statusElement.style.backgroundColor = '#F44336';
                this.statusElement.style.color = 'white';
                break;
            default:
                this.statusElement.style.backgroundColor = '#9E9E9E';
                this.statusElement.style.color = 'white';
        }
        
        // Auto-hide after 5 seconds if connected
        if (status === 'connected') {
            setTimeout(() => {
                if (this.statusElement) {
                    this.statusElement.style.opacity = '0.3';
                }
            }, 5000);
        }
    }

    // Get current connection status
    getStatus() {
        return this.connectionStatus;
    }
}

// Create global instance
window.dbConnection = new DatabaseConnection();

// Initialize when document is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.dbConnection.init('db-connection-status');
});
