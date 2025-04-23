// Function to handle search and display results
async function handleSearch(query) {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/auth/login.html';
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/search?q=${encodeURIComponent(query)}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.status === 401) {
            window.location.href = '/auth/login.html';
            return;
        }

        if (!response.ok) {
            throw new Error('Search failed');
        }

        const results = await response.json();
        displaySearchResults(results);
    } catch (error) {
        console.error('Search error:', error);
        displayError('Search failed. Please try again.');
    }
}

// Function to display search results
function displaySearchResults(results) {
    const resultsContainer = document.getElementById('searchResults');
    if (!resultsContainer) return;

    if (!results || results.length === 0) {
        resultsContainer.innerHTML = '<p>No results found</p>';
        return;
    }

    const resultsList = results.map(result => `
        <div class="search-result">
            <h3>
                <a href="/api/markdown/${encodeURIComponent(result.path)}" 
                   onclick="return checkAuth(event)">${result.title}</a>
            </h3>
            <p>${result.excerpt}</p>
        </div>
    `).join('');

    resultsContainer.innerHTML = resultsList;
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

// Initialize search when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const searchForm = document.getElementById('searchForm');
    if (searchForm) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const query = document.getElementById('searchInput').value;
            handleSearch(query);
        });
    }
}); 
async function handleSearch(query) {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/auth/login.html';
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/search?q=${encodeURIComponent(query)}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.status === 401) {
            window.location.href = '/auth/login.html';
            return;
        }

        if (!response.ok) {
            throw new Error('Search failed');
        }

        const results = await response.json();
        displaySearchResults(results);
    } catch (error) {
        console.error('Search error:', error);
        displayError('Search failed. Please try again.');
    }
}

// Function to display search results
function displaySearchResults(results) {
    const resultsContainer = document.getElementById('searchResults');
    if (!resultsContainer) return;

    if (!results || results.length === 0) {
        resultsContainer.innerHTML = '<p>No results found</p>';
        return;
    }

    const resultsList = results.map(result => `
        <div class="search-result">
            <h3>
                <a href="/api/markdown/${encodeURIComponent(result.path)}" 
                   onclick="return checkAuth(event)">${result.title}</a>
            </h3>
            <p>${result.excerpt}</p>
        </div>
    `).join('');

    resultsContainer.innerHTML = resultsList;
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

// Initialize search when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const searchForm = document.getElementById('searchForm');
    if (searchForm) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const query = document.getElementById('searchInput').value;
            handleSearch(query);
        });
    }
}); 
async function handleSearch(query) {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/auth/login.html';
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/search?q=${encodeURIComponent(query)}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.status === 401) {
            window.location.href = '/auth/login.html';
            return;
        }

        if (!response.ok) {
            throw new Error('Search failed');
        }

        const results = await response.json();
        displaySearchResults(results);
    } catch (error) {
        console.error('Search error:', error);
        displayError('Search failed. Please try again.');
    }
}

// Function to display search results
function displaySearchResults(results) {
    const resultsContainer = document.getElementById('searchResults');
    if (!resultsContainer) return;

    if (!results || results.length === 0) {
        resultsContainer.innerHTML = '<p>No results found</p>';
        return;
    }

    const resultsList = results.map(result => `
        <div class="search-result">
            <h3>
                <a href="/api/markdown/${encodeURIComponent(result.path)}" 
                   onclick="return checkAuth(event)">${result.title}</a>
            </h3>
            <p>${result.excerpt}</p>
        </div>
    `).join('');

    resultsContainer.innerHTML = resultsList;
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

// Initialize search when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const searchForm = document.getElementById('searchForm');
    if (searchForm) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const query = document.getElementById('searchInput').value;
            handleSearch(query);
        });
    }
}); 
async function handleSearch(query) {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/auth/login.html';
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/search?q=${encodeURIComponent(query)}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.status === 401) {
            window.location.href = '/auth/login.html';
            return;
        }

        if (!response.ok) {
            throw new Error('Search failed');
        }

        const results = await response.json();
        displaySearchResults(results);
    } catch (error) {
        console.error('Search error:', error);
        displayError('Search failed. Please try again.');
    }
}

// Function to display search results
function displaySearchResults(results) {
    const resultsContainer = document.getElementById('searchResults');
    if (!resultsContainer) return;

    if (!results || results.length === 0) {
        resultsContainer.innerHTML = '<p>No results found</p>';
        return;
    }

    const resultsList = results.map(result => `
        <div class="search-result">
            <h3>
                <a href="/api/markdown/${encodeURIComponent(result.path)}" 
                   onclick="return checkAuth(event)">${result.title}</a>
            </h3>
            <p>${result.excerpt}</p>
        </div>
    `).join('');

    resultsContainer.innerHTML = resultsList;
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

// Initialize search when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const searchForm = document.getElementById('searchForm');
    if (searchForm) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const query = document.getElementById('searchInput').value;
            handleSearch(query);
        });
    }
}); 
 