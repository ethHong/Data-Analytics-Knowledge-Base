// Authentication and access control
// Remove hardcoded base URL and use relative paths

// TEMPORARILY DISABLED FOR DEBUGGING
// Public paths that don't require authentication
const publicPaths = [
    '/auth/login.html',
    '/index.html',
    '/',
    '/contributors.html',  // Keep contributors page public
    '/graph.html'
];

// Paths that require user authentication
const userPaths = [
    '/auth/profile.html',
    '/markdowns/'
];

// Paths that require admin authentication
const adminPaths = [
    '/admin/',  // All paths under /admin/ require admin access
    '/documents.html'  // Document management requires admin access
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
    // First normalize the path
    const normalizedPath = path.replace('/admin/auth/login.html', '/auth/login.html');
    if (normalizedPath !== path) {
        window.location.replace('/auth/login.html');
        return true;
    }

    // Check if path starts with any admin paths
    return adminPaths.some(adminPath => {
        if (adminPath.endsWith('/')) {
            return path.startsWith(adminPath);
        }
        return path === adminPath;
    });
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
        const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            credentials: 'include'
        });
        
        if (response.status === 200) {
            const userData = await response.json();
            return {
                authenticated: true,
                isAdmin: userData.role === 'admin',
                user: userData
            };
        } else {
            // For any error response, remove token and consider not authenticated
            localStorage.removeItem('token');
            return { authenticated: false, isAdmin: false };
        }
    } catch (error) {
        console.error('Network error checking authentication:', error);
        // On network error, consider not authenticated
        localStorage.removeItem('token');
        return { authenticated: false, isAdmin: false };
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
    hideContent();
    const currentPath = window.location.pathname;
    
    // Always allow public paths
    if (isPublicPath(currentPath)) {
        showContent();
        return true;
    }

    const authCheck = await checkAuth();
    
    // If not authenticated, redirect to login
    if (!authCheck.authenticated) {
        sessionStorage.setItem('redirectAfterLogin', currentPath);
        window.location.replace(getLoginPath());
        return false;
    }

    // For admin paths, check admin status
    if (isAdminPath(currentPath)) {
        if (!authCheck.isAdmin) {
            window.location.replace('/index.html');
            return false;
        }
    }

    // For user paths, being authenticated is enough
    if (isUserPath(currentPath)) {
        showContent();
        return true;
    }

    // If path is not in any list, treat as requiring admin authentication
    if (!authCheck.isAdmin) {
        window.location.replace('/index.html');
        return false;
    }

    showContent();
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
            body: `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`,
            credentials: 'include'
        });
        
        if (response.status === 200) {
            const data = await response.json();
            localStorage.setItem('token', data.access_token);
            
            // Check if user is admin and handle redirect
            const authCheck = await checkAuth();
            
            // Get redirect path from session storage or default to index
            const redirectPath = sessionStorage.getItem('redirectAfterLogin') || '/index.html';
            sessionStorage.removeItem('redirectAfterLogin');
            
            // Only redirect to admin paths if user is admin
            if (redirectPath.startsWith('/admin/') && !authCheck.isAdmin) {
                window.location.replace('/index.html');
            } else {
                window.location.replace(redirectPath);
            }
        } else {
            const errorDiv = document.querySelector('.error-message') || document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.style.color = 'red';
            errorDiv.style.marginTop = '10px';
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
    window.location.replace('/index.html');
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
    requireAuth().then(isAuthorized => {
        if (!isAuthorized) {
            return;
        }
        showContent();
    });
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

// Create a new secure admin check function
function secureAdminPages() {
    const currentPath = window.location.pathname;
    
    // Skip for non-admin pages and login page
    if (!isAdminPath(currentPath) || currentPath.includes('/auth/login.html')) {
        return;
    }
    
    console.log("Checking admin access for:", currentPath);
    
    // We'll let the main requireAuth function handle the checks
    // This avoids duplicate checks and potential conflicts
}

// Call secure admin check immediately
secureAdminPages(); 