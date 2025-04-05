/**
 * Network status monitor
 * Detects online/offline status and handles transitions
 */

(function() {
    // Initialize status
    let isOnline = navigator.onLine;
    
    // Function to update UI based on network status
    function updateNetworkStatus(online) {
        isOnline = online;
        
        // Dispatch custom event for the application
        const event = new CustomEvent('networkStatusChange', {
            detail: { isOnline }
        });
        window.dispatchEvent(event);
        
        // If coming back online, try to reconnect
        if (isOnline && window.dbConnection) {
            window.dbConnection.checkConnection();
        }
        // If going offline, trigger offline mode
        else if (!isOnline && window.dbConnection) {
            window.dbConnection.triggerOfflineMode();
        }
        
        console.log('Network status:', isOnline ? 'Online' : 'Offline');
    }

    // Listen for browser online/offline events
    window.addEventListener('online', () => updateNetworkStatus(true));
    window.addEventListener('offline', () => updateNetworkStatus(false));
    
    // Check network status periodically
    setInterval(() => {
        // Only update if status has changed
        if (navigator.onLine !== isOnline) {
            updateNetworkStatus(navigator.onLine);
        }
    }, 5000); // Check every 5 seconds
    
    // Initialize status on script load
    updateNetworkStatus(navigator.onLine);
    
    // Export method to check status
    window.networkStatus = {
        isOnline: () => isOnline,
        checkConnection: () => {
            return new Promise((resolve, reject) => {
                // Try to fetch a small file to confirm real connectivity
                fetch('/offline-check.json?nocache=' + Date.now(), { 
                    method: 'HEAD',
                    cache: 'no-store'
                })
                .then(() => {
                    updateNetworkStatus(true);
                    resolve(true);
                })
                .catch(() => {
                    updateNetworkStatus(false);
                    resolve(false);
                });
            });
        }
    };
})();
