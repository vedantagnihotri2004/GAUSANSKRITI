// Auth status check for protected pages
(function() {
    // Paths that require authentication
    const protectedPaths = [
        '/ai.html',
        '/ecomm.html',
        '/community1.html'
    ];
    
    // Check if current page is protected
    const currentPath = window.location.pathname;
    const isProtected = protectedPaths.some(path => 
        currentPath.endsWith(path) || currentPath === path
    );
    
    // Redirect to login if not authenticated on protected pages
    if (isProtected && window.api && !api.auth.isAuthenticated()) {
        // Save the current URL to redirect back after login
        const returnUrl = window.location.href;
        window.location.href = `loginpage.html?redirect=${encodeURIComponent(returnUrl)}`;
    }
    
    // Handle login redirects
    if (currentPath.endsWith('/loginpage.html')) {
        const urlParams = new URLSearchParams(window.location.search);
        const redirect = urlParams.get('redirect');
        
        // Store redirect URL in session storage
        if (redirect) {
            sessionStorage.setItem('auth_redirect', redirect);
        }
    }
    
    // Add logout functionality to any logout buttons
    document.addEventListener('DOMContentLoaded', function() {
        const logoutButtons = document.querySelectorAll('.logout-btn');
        logoutButtons.forEach(button => {
            button.addEventListener('click', async function(e) {
                e.preventDefault();
                
                if (window.api) {
                    await api.auth.logout();
                }
                
                window.location.href = 'index.html';
            });
        });
    });
})();
