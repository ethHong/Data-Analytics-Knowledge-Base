// Authentication and access control
// Remove hardcoded base URL and use relative paths

// Public paths that don't require authentication
const publicPaths = [
    '/auth/login.html',
    '/index.html',
    '/',
    '/contributors.html',
    '/graph.html'
];

// Paths that require user authentication
const userPaths = [
    '/auth/profile.html',
    '/markdowns/',
    '/documents.html'
];

// Paths that require admin authentication
const adminPaths = [
    '/admin/index.md',
    '/admin/users.md',
    '/admin/documents.md',
    '/admin/contributors.md'
];

function isPublicPath(path) {
    return publicPaths.some(publicPath => {
        if (publicPath.endsWith('/')) {
            return path.startsWith(publicPath);
        }
        return path === publicPath;
    });
}

function isUserPath(path) {
    return userPaths.some(userPath => {
        if (userPath.endsWith('/')) {
            return path.startsWith(userPath);
        }
        return path === userPath;
    });
}

function isAdminPath(path) {
    return adminPaths.some(adminPath => path === adminPath);
}

// Get auth headers for API requests
function getAuthHeaders() {
    const token = localStorage.getItem('token');
    return token ? {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    } : {
        'Content-Type': 'application/json'
    };
}

// Check if user is authenticated and has admin role
async function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        return { authenticated: false, isAdmin: false };
    }

    try {
        const response = await fetch('http://34.82.192.6:8000/api/auth/me', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.status === 200) {
            const userData = await response.json();
            return {
                authenticated: true,
                isAdmin: userData.role === 'admin',
                user: userData
            };
        } else if (response.status === 401) {
            // Only remove token if it's actually invalid
            localStorage.removeItem('token');
            return { authenticated: false, isAdmin: false };
        } else {
            // For other errors, keep the token and stay logged in
            console.error('Non-401 error from auth check:', response.status);
            return { authenticated: true, isAdmin: false };
        }
    } catch (error) {
        console.error('Network error checking authentication:', error);
        // On network error, assume user is still authenticated
        return { authenticated: true, isAdmin: false };
    }
}

// Hide content until auth check is complete
function hideContent() {
    document.body.style.visibility = 'hidden';
}

function showContent() {
    document.body.style.visibility = 'visible';
}

// Get the correct login redirect path
function getLoginPath() {
    return '/auth/login.html';
}

// Redirect to login page if not authenticated or not admin for admin pages
async function requireAuth() {
    const currentPath = window.location.pathname;
    
    // Always allow public paths
    if (isPublicPath(currentPath)) {
        return true;
    }

    const authCheck = await checkAuth();
    
    // If not authenticated, redirect to login
    if (!authCheck.isAuthenticated) {
        sessionStorage.setItem('redirectAfterLogin', currentPath);
        window.location.replace('/auth/login.html');
        return false;
    }

    // For admin paths, check admin status
    if (isAdminPath(currentPath)) {
        if (!authCheck.isAdmin) {
            window.location.replace('/index.html');
            return false;
        }
        return true;
    }

    // For user paths, being authenticated is enough
    if (isUserPath(currentPath)) {
        return true;
    }

    // If path is not in any list, treat as requiring authentication
    return true;
}

// Handle login form submission
async function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    try {
        const response = await fetch('/api/auth/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`
        });
        
        if (response.status === 200) {
            const data = await response.json();
            localStorage.setItem('token', data.access_token);
            
            // Check if user is admin and handle redirect
            const authCheck = await checkAuth();
            
            // Notify parent window of successful login
            window.parent.postMessage({ type: 'loginSuccess', token: data.access_token }, '*');
            
            // Check if we're in an iframe
            if (window.self === window.top) {
                // Only redirect if we're not in an iframe
                const redirectPath = sessionStorage.getItem('redirectAfterLogin') || '/index.html';
                sessionStorage.removeItem('redirectAfterLogin');

                if (redirectPath.includes('/admin') && !authCheck.isAdmin) {
                    window.location.href = '/index.html';
                } else {
                    window.location.href = redirectPath;
                }
            }
            // If in iframe, do nothing - let the parent handle it
        } else {
            const errorDiv = document.querySelector('.error-message') || document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.style.color = 'red';
            errorDiv.style.marginTop = '10px';
            errorDiv.style.display = 'block';
            errorDiv.textContent = 'Invalid email or password';
            const loginForm = document.getElementById('login-form');
            if (loginForm && !loginForm.querySelector('.error-message')) {
                loginForm.appendChild(errorDiv);
            }
        }
    } catch (error) {
        console.error('Error during login:', error);
        const errorDiv = document.querySelector('.error-message') || document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.color = 'red';
        errorDiv.style.marginTop = '10px';
        errorDiv.style.display = 'block';
        errorDiv.textContent = 'Network error occurred';
        const loginForm = document.getElementById('login-form');
        if (loginForm && !loginForm.querySelector('.error-message')) {
            loginForm.appendChild(errorDiv);
        }
    }
}

// Handle logout
async function handleLogout() {
    localStorage.removeItem('token');
    sessionStorage.removeItem('redirectAfterLogin');
    window.location.href = '/index.html';
}

// Add event listeners when the document is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Add login form submit handler
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Add logout button click handler
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', handleLogout);
    }

    // Check auth for current page
    requireAuth();
});

// Export for use in other files
window.auth = {
    checkAuth,
    isPublicPath,
    isAdminPath,
    isUserPath,
    requireAuth,
    getAuthHeaders
}; 