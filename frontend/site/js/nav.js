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
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                // Only remove token if it's actually invalid
                localStorage.removeItem('token');
            }
            throw new Error('Failed to get user info');
        }

        const user = await response.json();
        
        // Update navigation
        const loginLinks = document.querySelectorAll('a[href*="auth/login.html"]');
        loginLinks.forEach(link => {
            const listItem = link.closest('li');
            if (listItem) {
                link.textContent = '👋 Logout';
                link.href = '#';
                link.onclick = (e) => {
                    e.preventDefault();
                    localStorage.removeItem('token');
                    window.location.reload();
                };
            }
        });

        // Show profile link when logged in
        const profileLinks = document.querySelectorAll('a[href*="auth/profile.html"]');
        profileLinks.forEach(link => {
            const listItem = link.closest('li');
            if (listItem) listItem.style.display = 'block';
        });

        // Add username to navigation
        const accountLabel = document.querySelector('label[for="__nav_2"]');
        if (accountLabel) {
            accountLabel.innerHTML = `<span class="md-nav__icon md-icon"></span>👤 ${user.email}`;
        }

        // Show/hide admin section based on user role
        const adminSection = document.querySelector('li.md-nav__item--nested:has(a[href*="admin/"])');
        if (adminSection) {
            adminSection.style.display = user.role === 'admin' ? 'block' : 'none';
        }

    } catch (error) {
        console.error('Error:', error);
        // Don't remove token on network errors
        const profileLinks = document.querySelectorAll('a[href*="auth/profile.html"]');
        profileLinks.forEach(link => {
            const listItem = link.closest('li');
            if (listItem) listItem.style.display = 'none';
        });
    }
}); 