document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        // Hide profile link if not logged in
        const profileLinks = document.querySelectorAll('a[href*="auth/profile.html"]');
        profileLinks.forEach(link => {
            const listItem = link.closest('li');
            if (listItem) listItem.style.display = 'none';
        });
        return;
    }

    try {
        // Get user info
        const response = await fetch('http://34.82.192.6:8000/api/auth/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to get user info');
        }

        const user = await response.json();
        
        // Update navigation
        const loginLinks = document.querySelectorAll('a[href*="auth/login.html"]');
        loginLinks.forEach(link => {
            link.textContent = '👋 Logout';
            link.href = '#';
            link.onclick = (e) => {
                e.preventDefault();
                localStorage.removeItem('token');
                window.location.reload();
            };
        });

        // Add username to navigation
        const accountLabel = document.querySelector('a[href*="auth/login.html"]').closest('li').previousElementSibling;
        if (accountLabel) {
            accountLabel.textContent = `👤 ${user.email}`;
        }

        // Show/hide admin section based on user role
        const adminSection = document.querySelector('a[href*="admin/index"]').closest('li.md-nav__item');
        if (adminSection) {
            adminSection.style.display = user.role === 'admin' ? 'block' : 'none';
        }

    } catch (error) {
        console.error('Error:', error);
        localStorage.removeItem('token');
    }
}); 