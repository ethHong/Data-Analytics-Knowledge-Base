// Immediate admin access protection
(function() {
    // Don't run this on login page
    if (window.location.pathname.includes('/auth/login.html')) {
        return;
    }
    
    // Check if this is an admin page
    if (window.location.pathname.includes('/admin/')) {
        // Hide content immediately to prevent flash
        document.write('<style>body { visibility: hidden; }</style>');
        
        // Load auth-utils.js first
        const script = document.createElement('script');
        script.src = '/js/auth-utils.js';
        script.onload = function() {
            checkAdminAccess();
        };
        script.onerror = function() {
            // If auth-utils.js fails to load, fall back to basic token check
            fallbackAdminCheck();
        };
        document.head.appendChild(script);
    }
    
    // Function to check admin access using auth-utils
    function checkAdminAccess() {
        if (window.authUtils) {
            const userInfo = window.authUtils.extractUserInfo();
            console.log("User info:", userInfo);
            
            if (!userInfo.authenticated) {
                window.location.replace('/auth/login.html');
                return;
            }
            
            if (userInfo.role !== 'admin') {
                console.log("Non-admin access denied:", userInfo.role);
                window.location.replace('/index.html');
                return;
            }
            
            console.log("Admin access granted for:", userInfo.email);
            
            // If we get here, show the content
            window.addEventListener('DOMContentLoaded', function() {
                document.body.style.visibility = 'visible';
            });
        } else {
            // If authUtils is not available, fall back to basic check
            fallbackAdminCheck();
        }
    }
    
    // Fallback check if auth-utils.js isn't loaded
    function fallbackAdminCheck() {
        const token = localStorage.getItem('token');
        
        if (!token) {
            window.location.replace('/auth/login.html');
            return;
        }
        
        try {
            // Basic token parsing
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const payload = JSON.parse(window.atob(base64));
            
            console.log("Fallback token check:", payload);
            
            // Check for admin role in common locations
            const role = payload.role || 
                (payload.user && payload.user.role) || 
                null;
            
            if (role !== 'admin') {
                window.location.replace('/index.html');
                return;
            }
            
            // Show content
            window.addEventListener('DOMContentLoaded', function() {
                document.body.style.visibility = 'visible';
            });
        } catch (e) {
            console.error("Fallback token check failed:", e);
            window.location.replace('/auth/login.html');
        }
    }
})(); 