const API_BASE_URL = '';

async function loadMarkdown(path) {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.replace('/auth/login.html');
            return;
        }

        const response = await fetch(`${API_BASE_URL}/api/markdown/${path}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.status === 401) {
            window.location.replace('/auth/login.html');
            return;
        }

        if (response.status === 403) {
            window.location.replace('/');
            return;
        }

        if (!response.ok) {
            throw new Error(`Failed to load markdown: ${response.statusText}`);
        }

        const content = await response.text();
        const converter = new showdown.Converter();
        const html = converter.makeHtml(content);
        document.getElementById('content').innerHTML = html;
        
        // Initialize syntax highlighting
        document.querySelectorAll('pre code').forEach((block) => {
            hljs.highlightBlock(block);
        });

    } catch (error) {
        console.error('Error loading markdown:', error);
        document.getElementById('content').innerHTML = `
            <div class="alert alert-danger">
                Failed to load content. Please try again later.
            </div>
        `;
    }
}

// Get the markdown path from the URL
const urlParams = new URLSearchParams(window.location.search);
const markdownPath = urlParams.get('path');

if (markdownPath) {
    loadMarkdown(markdownPath);
} else {
    document.getElementById('content').innerHTML = `
        <div class="alert alert-warning">
            No markdown file specified.
        </div>
    `;
} 

async function loadMarkdown(path) {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.replace('/auth/login.html');
            return;
        }

        const response = await fetch(`${API_BASE_URL}/api/markdown/${path}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.status === 401) {
            window.location.replace('/auth/login.html');
            return;
        }

        if (response.status === 403) {
            window.location.replace('/');
            return;
        }

        if (!response.ok) {
            throw new Error(`Failed to load markdown: ${response.statusText}`);
        }

        const content = await response.text();
        const converter = new showdown.Converter();
        const html = converter.makeHtml(content);
        document.getElementById('content').innerHTML = html;
        
        // Initialize syntax highlighting
        document.querySelectorAll('pre code').forEach((block) => {
            hljs.highlightBlock(block);
        });

    } catch (error) {
        console.error('Error loading markdown:', error);
        document.getElementById('content').innerHTML = `
            <div class="alert alert-danger">
                Failed to load content. Please try again later.
            </div>
        `;
    }
}

// Get the markdown path from the URL
const urlParams = new URLSearchParams(window.location.search);
const markdownPath = urlParams.get('path');

if (markdownPath) {
    loadMarkdown(markdownPath);
} else {
    document.getElementById('content').innerHTML = `
        <div class="alert alert-warning">
            No markdown file specified.
        </div>
    `;
} 

async function loadMarkdown(path) {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.replace('/auth/login.html');
            return;
        }

        const response = await fetch(`${API_BASE_URL}/api/markdown/${path}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.status === 401) {
            window.location.replace('/auth/login.html');
            return;
        }

        if (response.status === 403) {
            window.location.replace('/');
            return;
        }

        if (!response.ok) {
            throw new Error(`Failed to load markdown: ${response.statusText}`);
        }

        const content = await response.text();
        const converter = new showdown.Converter();
        const html = converter.makeHtml(content);
        document.getElementById('content').innerHTML = html;
        
        // Initialize syntax highlighting
        document.querySelectorAll('pre code').forEach((block) => {
            hljs.highlightBlock(block);
        });

    } catch (error) {
        console.error('Error loading markdown:', error);
        document.getElementById('content').innerHTML = `
            <div class="alert alert-danger">
                Failed to load content. Please try again later.
            </div>
        `;
    }
}

// Get the markdown path from the URL
const urlParams = new URLSearchParams(window.location.search);
const markdownPath = urlParams.get('path');

if (markdownPath) {
    loadMarkdown(markdownPath);
} else {
    document.getElementById('content').innerHTML = `
        <div class="alert alert-warning">
            No markdown file specified.
        </div>
    `;
} 

async function loadMarkdown(path) {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.replace('/auth/login.html');
            return;
        }

        const response = await fetch(`${API_BASE_URL}/api/markdown/${path}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.status === 401) {
            window.location.replace('/auth/login.html');
            return;
        }

        if (response.status === 403) {
            window.location.replace('/');
            return;
        }

        if (!response.ok) {
            throw new Error(`Failed to load markdown: ${response.statusText}`);
        }

        const content = await response.text();
        const converter = new showdown.Converter();
        const html = converter.makeHtml(content);
        document.getElementById('content').innerHTML = html;
        
        // Initialize syntax highlighting
        document.querySelectorAll('pre code').forEach((block) => {
            hljs.highlightBlock(block);
        });

    } catch (error) {
        console.error('Error loading markdown:', error);
        document.getElementById('content').innerHTML = `
            <div class="alert alert-danger">
                Failed to load content. Please try again later.
            </div>
        `;
    }
}

// Get the markdown path from the URL
const urlParams = new URLSearchParams(window.location.search);
const markdownPath = urlParams.get('path');

if (markdownPath) {
    loadMarkdown(markdownPath);
} else {
    document.getElementById('content').innerHTML = `
        <div class="alert alert-warning">
            No markdown file specified.
        </div>
    `;
} 
 