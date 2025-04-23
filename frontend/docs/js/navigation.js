// Function to load and display navigation menu
async function loadNavigation() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/auth/login.html';
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/documents`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.status === 401) {
            window.location.href = '/auth/login.html';
            return;
        }

        if (!response.ok) {
            throw new Error('Failed to load navigation');
        }

        const data = await response.json();
        displayNavigation(data.documents);
    } catch (error) {
        console.error('Navigation error:', error);
        displayError('Failed to load navigation');
    }
}

// Function to display navigation menu
function displayNavigation(documents) {
    const navContainer = document.getElementById('navigation');
    if (!navContainer) return;

    const navItems = documents.map(doc => `
        <div class="nav-item">
            <a href="/api/markdown/${encodeURIComponent(doc.path)}" 
               onclick="return checkAuth(event)">${doc.title}</a>
        </div>
    `).join('');

    navContainer.innerHTML = navItems;
}

// Function to check authentication before following link
function checkAuth(event) {
    const token = localStorage.getItem('token');
    if (!token) {
        event.preventDefault();
        window.location.href = '/auth/login.html';
        return false;
    }
    return true;
}

// Initialize navigation when the page loads
document.addEventListener('DOMContentLoaded', loadNavigation); 