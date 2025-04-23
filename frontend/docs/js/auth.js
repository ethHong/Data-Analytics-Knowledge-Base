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
    '/admin',  // Match any admin path
];

function isPublicPath(path) {
    return publicPaths.some(publicPath => path.includes(publicPath));
}

function isUserPath(path) {
    return userPaths.some(userPath => path.includes(userPath));
}

function isAdminPath(path) {
    // Check if the path starts with /admin
    return path.includes('/admin');
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
    hideContent();  // Hide content while checking auth
    
    const { authenticated, isAdmin } = await checkAuth();
    const currentPath = window.location.pathname;
    console.log('Current path:', currentPath);
    console.log('Auth status:', { authenticated, isAdmin });

    // Check admin access first
    if (isAdminPath(currentPath)) {
        console.log('Admin path detected');
        if (!authenticated || !isAdmin) {
            console.log('User not authenticated or not admin, redirecting to login');
            sessionStorage.setItem('redirectAfterLogin', currentPath);
            window.location.href = getLoginPath();
            return;
        }
        showContent();
        return;
    }

    // Handle public paths
    if (isPublicPath(currentPath)) {
        showContent();
        return;
    }

    // Handle authenticated paths
    if (!authenticated) {
        sessionStorage.setItem('redirectAfterLogin', currentPath);
        window.location.href = getLoginPath();
        return;
    }

    // Show content for authenticated users
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
            
            // Check if user is admin and handle redirect
            const authCheck = await checkAuth();
            const redirectPath = sessionStorage.getItem('redirectAfterLogin') || '/index.html';
            sessionStorage.removeItem('redirectAfterLogin');

            if (redirectPath.includes('/admin') && !authCheck.isAdmin) {
                // If trying to access admin page but not admin, go to home
                window.location.href = '/index.html';
            } else {
                window.location.href = redirectPath;
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
    requireAuth
}; 