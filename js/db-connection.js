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
            database: false
        };
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
            document.body.appendChild(this.statusElement);
        }
        
        this.checkConnection();
    }

    // Check API and database connection
    async checkConnection() {
        this.updateStatus('checking', 'Checking connection...');
        
        try {
            // Try to connect to health check endpoint
            const response = await fetch(`${this.apiBaseUrl}/health/`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                cache: 'no-cache'
            });
            
            if (response.ok) {
                const data = await response.json();
                this.connectionStatus.api = true;
                this.connectionStatus.database = data.database_connected;
                
                if (this.connectionStatus.database) {
                    this.updateStatus('connected', 'Connected to database');
                } else {
                    this.updateStatus('error', 'API online but database unreachable');
                }
            } else {
                this.updateStatus('error', 'API server unreachable');
            }
        } catch (error) {
            console.error('Connection check failed:', error);
            this.updateStatus('error', 'Connection failed');
        }
    }

    // Update the status indicator
    updateStatus(status, message) {
        if (!this.statusElement) return;
        
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
