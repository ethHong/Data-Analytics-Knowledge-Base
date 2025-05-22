// Check if user is authenticated when accessing markdown pages
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.top.location.href = '/auth/login.html';
        return;
    }

    // Verify token with backend
    fetch(API_BASE_URL + '/api/auth/me', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    }).then(response => {
        if (!response.ok) {
            throw new Error('Authentication failed');
        }
        return response.json();
    }).catch(error => {
        console.error('Authentication error:', error);
        window.top.location.href = '/auth/login.html';
    });
}); 