// Authentication utilities

/**
 * Extract user role from JWT token
 * @returns {Object} User info with role and authentication status
 */
function extractUserInfo() {
    const token = localStorage.getItem('token');
    if (!token) {
        return { authenticated: false, role: null };
    }
    
    try {
        // Parse JWT payload
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(window.atob(base64));
        
        // Check expiration
        const expiry = payload.exp * 1000; // Convert to milliseconds
        if (Date.now() >= expiry) {
            localStorage.removeItem('token');
            return { authenticated: false, role: null, expired: true };
        }
        
        // Extract role - could be in different locations depending on token structure
        const role = 
            payload.role || 
            (payload.user && payload.user.role) || 
            null;
            
        return { 
            authenticated: true, 
            role: role,
            email: payload.sub || payload.email || (payload.user && payload.user.email),
            payload: payload // Include full payload for debugging
        };
    } catch (e) {
        console.error("Error extracting user info from token:", e);
        localStorage.removeItem('token');
        return { authenticated: false, role: null, error: e.message };
    }
}

/**
 * Check if user is authenticated
 */
function isAuthenticated() {
    const userInfo = extractUserInfo();
    return userInfo.authenticated;
}

/**
 * Check if user is an admin
 */
function isAdmin() {
    const userInfo = extractUserInfo();
    return userInfo.authenticated && userInfo.role === 'admin';
}

// Export utilities
window.authUtils = {
    extractUserInfo,
    isAuthenticated,
    isAdmin
}; 