# Document Management

<div class="admin-section">
  <div class="search-container">
    <input type="text" id="documentSearch" placeholder="Search documents..." onkeyup="filterDocuments()">
    <button type="button" class="refresh-button" onclick="handleRefresh()">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M23 4v6h-6"></path>
        <path d="M1 20v-6h6"></path>
        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
      </svg>
      Refresh
    </button>
  </div>
  <div id="documentList" class="document-list">
    <!-- Documents will be loaded here -->
  </div>
</div>

<script>
let allDocuments = [];

async function fetchDocuments() {
    try {
        // Use relative URL instead of hardcoded IP
        const apiUrl = '/api/documents';
        console.log('Fetching documents from:', apiUrl);
        
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('API endpoint not found. Please check if the API server is running.');
            } else {
                throw new Error(`Server error: ${response.status}`);
            }
        }
        
        const data = await response.json();
        console.log('Response data:', data);
        
        if (!data || !Array.isArray(data.documents)) {
            throw new Error('Invalid data format received from API');
        }
        
        allDocuments = data.documents;
        displayDocuments(allDocuments);
    } catch (error) {
        console.error('Error details:', {
            message: error.message,
            name: error.name,
            stack: error.stack
        });
        
        const documentList = document.getElementById('documentList');
        if (documentList) {
            documentList.innerHTML = `
                <div class="no-documents">
                    <p>Error loading documents:</p>
                    <p>${error.message}</p>
                    <p>Please ensure:</p>
                    <ul style="text-align: left; margin: 10px auto; display: inline-block;">
                        <li>The API server is running</li>
                        <li>You have network connectivity</li>
                        <li>The correct API endpoint is configured</li>
                    </ul>
                    <button class="refresh-button" onclick="handleRefresh()">
                        Try Again
                    </button>
                </div>`;
        }
    }
}

function displayDocuments(documents) {
    const documentList = document.getElementById('documentList');
    if (!documentList) {
        console.error('Document list container not found');
        return;
    }

    if (!documents || documents.length === 0) {
        documentList.innerHTML = '<div class="no-documents">No documents found. Try refreshing the list.</div>';
        return;
    }

    // Group documents by category
    const categories = {};
    documents.forEach(doc => {
        if (!categories[doc.category]) {
            categories[doc.category] = [];
        }
        categories[doc.category].push(doc);
    });

    // Generate HTML for each category
    const html = Object.entries(categories)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([category, docs]) => `
            <div class="category-section">
                <h3 class="category-title">${category}</h3>
                ${docs.sort((a, b) => a.title.localeCompare(b.title))
                    .map(doc => `
                        <div class="document-item">
                            <div class="document-info">
                                <span class="document-title">${doc.title}</span>
                                <span class="document-path">${doc.path}</span>
                            </div>
                            <div class="document-actions">
                                <button class="button" onclick="viewDocument('${doc.path}')">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                        <circle cx="12" cy="12" r="3"/>
                                    </svg>
                                    View
                                </button>
                            </div>
                        </div>
                    `).join('')}
            </div>
        `).join('');

    documentList.innerHTML = html;
}

function filterDocuments() {
    const searchInput = document.getElementById('documentSearch');
    if (!searchInput) return;
    
    const searchTerm = searchInput.value.toLowerCase();
    const filteredDocs = allDocuments.filter(doc => 
        doc.title.toLowerCase().includes(searchTerm) || 
        doc.path.toLowerCase().includes(searchTerm) ||
        doc.category.toLowerCase().includes(searchTerm)
    );
    
    displayDocuments(filteredDocs);
}

function handleRefresh() {
    console.log('Refreshing documents...');
    fetchDocuments();
}

function viewDocument(path) {
    // Remove 'docs/' prefix and '.md' suffix, add trailing slash
    const formattedPath = path.replace(/^docs\//, '').replace(/\.md$/, '/');
    window.location.href = `../../${formattedPath}`;
}

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('Document management page loaded');
    fetchDocuments();
});
</script>

<style>
.admin-section {
    padding: 20px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.search-container {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
}

.search-container input {
    flex: 1;
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
}

.refresh-button {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 8px 16px;
    border: 1px solid #ddd;
    border-radius: 4px;
    background: white;
    cursor: pointer;
}

.refresh-button:hover {
    background: #f5f5f5;
}

.document-list {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.category-section {
    background: white;
    border: 1px solid #ddd;
    border-radius: 8px;
    overflow: hidden;
}

.category-title {
    margin: 0;
    padding: 12px 16px;
    background: #f5f5f5;
    border-bottom: 1px solid #ddd;
    font-size: 1.1em;
    color: #333;
}

.document-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    border-bottom: 1px solid #ddd;
    background: white;
}

.document-item:last-child {
    border-bottom: none;
}

.document-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.document-title {
    font-weight: 500;
    color: #333;
}

.document-path {
    font-size: 12px;
    color: #666;
}

.document-actions {
    display: flex;
    gap: 8px;
}

.button {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 6px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    background: white;
    cursor: pointer;
    font-size: 14px;
}

.button:hover {
    background: #f5f5f5;
}

.no-documents {
    text-align: center;
    padding: 20px;
    color: #666;
    font-style: italic;
}
</style> 