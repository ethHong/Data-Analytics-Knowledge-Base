// Authentication and access control
const publicPaths = [
    '/contributors/',
    '/login/',
    '/'
];

const adminPaths = [
    '/admin/',
    '/admin/users/',
    '/admin/documents/',
    '/admin/contributors/'
];

function isPublicPath(path) {
    return publicPaths.some(publicPath => path.startsWith(publicPath));
}

function isAdminPath(path) {
    return adminPaths.some(adminPath => path.startsWith(adminPath));
}

// Check if user is authenticated
async function checkAuth() {
    try {
        const response = await fetch('http://34.82.192.6:8000/api/auth/check', {
            method: 'GET',
            credentials: 'include'
        });
        
        if (response.status === 200) {
            // User is authenticated
            return true;
        } else {
            // User is not authenticated
            return false;
        }
    } catch (error) {
        console.error('Error checking authentication:', error);
        return false;
    }
}

// Redirect to login page if not authenticated
async function requireAuth() {
    const isAuthenticated = await checkAuth();
    if (!isAuthenticated) {
        window.location.href = '/login/';
    }
}

// Handle login form submission
async function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    try {
        const response = await fetch('http://34.82.192.6:8000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
            credentials: 'include'
        });
        
        if (response.status === 200) {
            // Login successful
            window.location.href = '/admin/';
        } else {
            // Login failed
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
    try {
        const response = await fetch('http://34.82.192.6:8000/api/auth/logout', {
            method: 'POST',
            credentials: 'include'
        });
        
        if (response.status === 200) {
            // Logout successful
            window.location.href = '/';
        } else {
            alert('Logout failed');
        }
    } catch (error) {
        console.error('Error during logout:', error);
        alert('Logout failed: Network error');
    }
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
});

// Run auth check when page loads
document.addEventListener('DOMContentLoaded', checkAuth);

// Export for use in other files
window.auth = {
    checkAuth,
    isPublicPath,
    isAdminPath
}; 