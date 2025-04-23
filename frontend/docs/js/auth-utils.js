// Authentication utilities

/**
 * Extract user role from JWT token
 * @returns {Object} User info with role and authentication status
 */
function extractUserInfo() {
    const token = localStorage.getItem('token');
    console.log("AUTH UTILS - Token exists:", !!token);
    
    if (!token) {
        console.log("AUTH UTILS - No token found");
        return { authenticated: false, role: null };
    }
    
    try {
        // Parse JWT payload
        const parts = token.split('.');
        console.log("AUTH UTILS - Token parts:", parts.length);
        
        if (parts.length !== 3) {
            console.error("AUTH UTILS - Invalid token format, not a JWT");
            return { authenticated: false, role: null, error: "Invalid token format" };
        }
        
        const base64Url = parts[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        
        // Add padding if needed
        let padding = '';
        if (base64.length % 4 !== 0) {
            padding = '='.repeat(4 - (base64.length % 4));
        }
        
        const jsonPayload = window.atob(base64 + padding);
        console.log("AUTH UTILS - Decoded payload:", jsonPayload);
        
        const payload = JSON.parse(jsonPayload);
        console.log("AUTH UTILS - Parsed payload:", payload);
        
        // Check expiration
        const expiry = payload.exp * 1000; // Convert to milliseconds
        const now = Date.now();
        console.log("AUTH UTILS - Token expiry:", new Date(expiry), "Now:", new Date(now));
        
        if (now >= expiry) {
            console.log("AUTH UTILS - Token expired");
            localStorage.removeItem('token');
            return { authenticated: false, role: null, expired: true };
        }
        
        // Extract role - could be in different locations depending on token structure
        // Check common locations for the role
        let role = null;
        
        if (payload.role) {
            console.log("AUTH UTILS - Found role in payload.role:", payload.role);
            role = payload.role;
        } else if (payload.user && payload.user.role) {
            console.log("AUTH UTILS - Found role in payload.user.role:", payload.user.role);
            role = payload.user.role;
        } else {
            console.log("AUTH UTILS - No role found in common locations");
        }
            
        // Extract email from common locations
        const email = payload.sub || payload.email || (payload.user && payload.user.email);
        console.log("AUTH UTILS - Email:", email, "Role:", role);
        
        return { 
            authenticated: true, 
            role: role,
            email: email,
            payload: payload // Include full payload for debugging
        };
    } catch (e) {
        console.error("AUTH UTILS - Error extracting user info from token:", e);
        localStorage.removeItem('token');
        return { authenticated: false, role: null, error: e.message };
    }
}

/**
 * Check if user is authenticated
 */
function isAuthenticated() {
    const userInfo = extractUserInfo();
    console.log("AUTH UTILS - isAuthenticated:", userInfo.authenticated);
    return userInfo.authenticated;
}

/**
 * Check if user is an admin
 */
function isAdmin() {
    const userInfo = extractUserInfo();
    const isAdmin = userInfo.authenticated && userInfo.role === 'admin';
    console.log("AUTH UTILS - isAdmin:", isAdmin, "Role:", userInfo.role);
    return isAdmin;
}

// Export utilities
window.authUtils = {
    extractUserInfo,
    isAuthenticated,
    isAdmin
}; 