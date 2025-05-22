// Authentication script for protected paths
(function() {
    // Don't run this on login page
    if (window.location.pathname.includes('/auth/login.html')) {
        return;
    }
    
    // Check if this is an admin page (only protect admin paths)
    if (window.location.pathname.includes('/admin/')) {
        // Hide content immediately to prevent flash
        document.write('<style>body { visibility: hidden; }</style>');
        
        const token = localStorage.getItem('token');
        
        // If no token, redirect to login immediately
        if (!token) {
            // Store the current URL for redirection after login
            sessionStorage.setItem('redirectAfterLogin', window.location.href);
            window.location.replace('/auth/login.html');
            return;
        }
        
        // Validate token (basic check)
        try {
            // Parse JWT payload
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const payload = JSON.parse(window.atob(base64));
            
            // Check expiration
            const expiry = payload.exp * 1000; // Convert to milliseconds
            if (Date.now() >= expiry) {
                // Token expired
                localStorage.removeItem('token');
                // Store the current URL for redirection after login
                sessionStorage.setItem('redirectAfterLogin', window.location.href);
                window.location.replace('/auth/login.html');
                return;
            }
            
            // If we get here, show the content
            window.addEventListener('DOMContentLoaded', function() {
                document.body.style.visibility = 'visible';
            });
        } catch (e) {
            // Invalid token format
            localStorage.removeItem('token');
            // Store the current URL for redirection after login
            sessionStorage.setItem('redirectAfterLogin', window.location.href);
            window.location.replace('/auth/login.html');
        }
    }
    
    // For markdown pages, we no longer require authentication
    if (window.location.pathname.includes('/markdowns/')) {
        // Make sure content is visible (no authentication required)
        window.addEventListener('DOMContentLoaded', function() {
            document.body.style.visibility = 'visible';
        });
    }
})(); 