// Authentication and access control
// Remove hardcoded base URL and use relative paths

const publicPaths = [
    '/contributors.html',
    '/auth/login.html',
    '/index.html',
    '/'
];

// Pages that require authentication but not admin role
const userPaths = [
    '/auth/profile.html',
    '/markdowns/'  // All document pages
];

// Pages that require admin role
const adminPaths = [
    '/admin/index.md',
    '/admin/users.md',
    '/admin/documents.md',
    '/admin/contributors.md'
];

function isPublicPath(path) {
    return publicPaths.some(publicPath => path.includes(publicPath));
}

function isUserPath(path) {
    return userPaths.some(userPath => path.includes(userPath));
}

function isAdminPath(path) {
    return adminPaths.some(adminPath => path.includes(adminPath));
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
        } else {
            localStorage.removeItem('token');
            return { authenticated: false, isAdmin: false };
        }
    } catch (error) {
        console.error('Error checking authentication:', error);
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

// Redirect to login page if not authenticated or not admin for admin pages
async function requireAuth() {
    hideContent();  // Hide content while checking auth
    const { authenticated, isAdmin } = await checkAuth();
    const currentPath = window.location.pathname;
    console.log('Current path:', currentPath);
    console.log('Auth status:', { authenticated, isAdmin });

    // Allow public paths without authentication
    if (isPublicPath(currentPath)) {
        showContent();
        return;
    }

    // Check if user is authenticated
    if (!authenticated) {
        window.location.href = '/auth/login.html';
        return;
    }

    // For admin paths, check admin role
    if (isAdminPath(currentPath)) {
        if (isAdmin) {
            // Allow access if user is admin
            showContent();
            return;
        } else {
            // Redirect if not admin
            alert('You do not have permission to access this page');
            window.location.href = '/index.html';
            return;
        }
    }

    // For user paths, allow if authenticated
    if (isUserPath(currentPath)) {
        showContent();
        return;
    }

    // Default: show content if we get here
    showContent();
}

// Handle login form submission
async function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    try {
        const response = await fetch('http://34.82.192.6:8000/api/auth/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`
        });
        
        if (response.status === 200) {
            const data = await response.json();
            localStorage.setItem('token', data.access_token);
            
            // Check if user is admin
            const authCheck = await checkAuth();
            if (authCheck.isAdmin) {
                window.location.href = '/admin/index.html';
            } else {
                window.location.href = '/index.html';
            }
        } else {
            const error = await response.text();
            alert('Login failed: ' + error);
        }
    } catch (error) {
        console.error('Error during login:', error);
        alert('Login failed: Network error');
    }
}

// Handle logout
async function handleLogout() {
    localStorage.removeItem('token');
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
    requireAuth
}; 