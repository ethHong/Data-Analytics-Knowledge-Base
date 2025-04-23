// Document Viewer Script
document.addEventListener('DOMContentLoaded', async () => {
    // Check authentication
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.replace('/auth/login.html');
        return;
    }

    // Get document path from URL
    const urlParams = new URLSearchParams(window.location.search);
    const docPath = urlParams.get('path');
    
    if (!docPath) {
        displayError('No document specified');
        return;
    }

    try {
        // Fetch document content
        const response = await fetch(`${API_BASE_URL}/api/documents/${docPath}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });

        if (response.status === 401) {
            window.location.replace('/auth/login.html');
            return;
        }

        if (response.status === 403) {
            window.location.replace('/index.html');
            return;
        }

        if (!response.ok) {
            throw new Error(`Failed to load document: ${response.status}`);
        }

        const data = await response.json();
        
        // Display document
        displayDocument(data);
    } catch (error) {
        console.error('Error loading document:', error);
        displayError('Failed to load document. Please try again later.');
    }
});

function displayDocument(data) {
    const container = document.getElementById('document-container');
    if (!container) return;

    // Set title
    document.title = data.title;
    
    // Create content
    container.innerHTML = `
        <div class="document-header">
            <h1>${data.title}</h1>
        </div>
        <div class="document-content markdown-body">
            ${marked(data.content)}
        </div>
    `;

    // Apply syntax highlighting if available
    if (window.hljs) {
        document.querySelectorAll('pre code').forEach((block) => {
            hljs.highlightBlock(block);
        });
    }
}

function displayError(message) {
    const container = document.getElementById('document-container');
    if (!container) return;

    container.innerHTML = `
        <div class="error-message">
            <h2>Error</h2>
            <p>${message}</p>
            <button onclick="window.location.reload()">Try Again</button>
        </div>
    `;
} 