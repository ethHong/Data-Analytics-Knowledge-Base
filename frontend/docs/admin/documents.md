# Document Management

<script src="https://cdn.jsdelivr.net/npm/@babel/polyfill@7.12.1/dist/polyfill.min.js"></script>

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

<!-- Contribution Modal Template -->
<div id="contributionModal" class="modal">
    <div class="modal-content">
        <div class="modal-header">
            <h2>Edit Contributions</h2>
            <button class="close-button" onclick="closeModal('contributionModal')">&times;</button>
        </div>
        <div class="modal-body">
            <div class="search-container">
                <input type="text" id="contributionSearch" placeholder="Search documents..." onkeyup="filterContributionDocuments()">
            </div>
            <div id="contributionDocumentList" class="document-list scrollable">
                <!-- Documents with checkboxes will be loaded here -->
            </div>
        </div>
        <div class="modal-footer">
            <button class="button secondary" onclick="closeModal('contributionModal')">Cancel</button>
            <button class="button primary" onclick="saveContributions()">Save Changes</button>
        </div>
    </div>
</div>

<script>
let allDocuments = [];
let selectedContributions = new Set();

async function fetchDocuments() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.replace('/auth/login.html');
            return;
        }

        const apiUrl = 'http://34.82.192.6:8000/api/documents';
        console.log('Fetching documents from:', apiUrl);

        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });

        console.log('Response status:', response.status);

        if (response.status === 401) {
            // Not authenticated
            window.location.replace('/auth/login.html');
            return;
        }

        if (response.status === 403) {
            // Not authorized (not admin)
            window.location.replace('/index.html');
            return;
        }

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
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

        // If there's an error, hide the content and show error message
        document.body.style.visibility = 'hidden';
        const documentList = document.getElementById('documentList');
        if (documentList) {
            documentList.innerHTML = `
                <div class="no-documents">
                    <p>Error loading documents:</p>
                    <p>${error.message}</p>
                    <p>Please ensure:</p>
                    <ul style="text-align: left; margin: 10px auto; display: inline-block;">
                        <li>You are logged in as an admin</li>
                        <li>The API server is running</li>
                        <li>You have network connectivity</li>
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

    const html = documents
        .sort((a, b) => a.title.localeCompare(b.title))
        .map(doc => `
            <div class="document-item">
                <div class="document-info">
                    <span class="document-title">${doc.title}</span>
                    <span class="document-path">${doc.path}</span>
                </div>
                <div class="document-actions">
                    <button class="button" onclick="viewDocument('${doc.title}')">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                            <circle cx="12" cy="12" r="3"/>
                        </svg>
                        View
                    </button>
                </div>
            </div>
        `).join('');

    documentList.innerHTML = html;
}

function displayContributionDocuments(documents) {
    const documentList = document.getElementById('contributionDocumentList');
    if (!documentList) return;

    if (!documents || documents.length === 0) {
        documentList.innerHTML = '<div class="no-documents">No documents found.</div>';
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

    // Generate HTML for each category with checkboxes
    const html = Object.entries(categories)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([category, docs]) => `
            <div class="category-section">
                <h3 class="category-title">${category}</h3>
                <div class="document-items">
                    ${docs.sort((a, b) => a.title.localeCompare(b.title))
                        .map(doc => `
                            <div class="document-item">
                                <label class="checkbox-container">
                                    <input type="checkbox" 
                                           value="${doc.path}" 
                                           ${selectedContributions.has(doc.path) ? 'checked' : ''}
                                           onchange="handleContributionSelection(event)">
                                    <div class="document-info">
                                        <span class="document-title">${doc.title}</span>
                                        <span class="document-path">${doc.path}</span>
                                    </div>
                                </label>
                            </div>
                        `).join('')}
                </div>
            </div>
        `).join('');

    documentList.innerHTML = html;
}

function handleContributionSelection(event) {
    const path = event.target.value;
    if (event.target.checked) {
        selectedContributions.add(path);
    } else {
        selectedContributions.delete(path);
    }
}

function filterContributionDocuments() {
    const searchInput = document.getElementById('contributionSearch');
    if (!searchInput) return;
    
    const searchTerm = searchInput.value.toLowerCase();
    const filteredDocs = allDocuments.filter(doc => 
        doc.title.toLowerCase().includes(searchTerm) || 
        doc.path.toLowerCase().includes(searchTerm) ||
        doc.category.toLowerCase().includes(searchTerm)
    );
    
    displayContributionDocuments(filteredDocs);
}

function filterDocuments() {
    const searchInput = document.getElementById('documentSearch');
    if (!searchInput) return;
    
    const searchTerm = searchInput.value.toLowerCase();
    const filteredDocs = allDocuments.filter(doc => 
        doc.title.toLowerCase().includes(searchTerm) || 
        doc.path.toLowerCase().includes(searchTerm)
    );
    
    displayDocuments(filteredDocs);
}

function handleRefresh() {
    console.log('Refreshing documents...');
    fetchDocuments();
}

async function viewDocument(title) {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.replace('/auth/login.html');
            return;
        }

        const encodedName = encodeURIComponent(title);
        const url = `../../markdowns/${encodedName}/`;
        
        // First check if user has access
        const response = await fetch(`http://34.82.192.6:8000/documents/${encodedName}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
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
            throw new Error(`Server error: ${response.status}`);
        }

        window.location.href = url;
    } catch (error) {
        console.error('Error accessing document:', error);
        alert('Error accessing document. Please try again.');
    }
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
    height: calc(100vh - 100px); /* Increased height */
    max-width: 1200px; /* Added max-width */
    margin: 0 auto; /* Center the section */
    display: flex;
    flex-direction: column;
}

.search-container {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
    position: sticky;
    top: 0;
    background: white;
    z-index: 1;
    padding: 10px 0;
}

.search-container input {
    flex: 1;
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
}

.document-list {
    flex: 1;
    overflow-y: auto;
    padding: 0 10px;
    margin: 0 -10px; /* Negative margin to allow full-width scrolling */
}

.scrollable {
    max-height: 60vh;
    overflow-y: auto;
    padding-right: 10px;
}

.category-section {
    background: white;
    border: 1px solid #ddd;
    border-radius: 8px;
    overflow: hidden;
    margin-bottom: 20px;
}

.category-title {
    margin: 0;
    padding: 12px 16px;
    background: #f5f5f5;
    border-bottom: 1px solid #ddd;
    font-size: 1.1em;
    color: #333;
    position: sticky;
    top: 0;
    z-index: 1;
}

.document-items {
    padding: 8px 0;
}

.document-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px; /* Increased padding */
    border: 1px solid #ddd;
    border-radius: 8px; /* Increased border radius */
    background: white;
    margin-bottom: 12px; /* Increased margin */
    transition: all 0.2s ease;
}

.document-item:hover {
    border-color: #1a73e8;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* Enhanced shadow */
    transform: translateY(-1px); /* Subtle lift effect */
}

.document-info {
    display: flex;
    flex-direction: column;
    gap: 6px; /* Increased gap */
    flex: 1;
    padding-right: 20px; /* Added padding */
}

.document-title {
    font-weight: 500;
    color: #333;
    font-size: 16px; /* Increased font size */
}

.document-path {
    font-size: 13px; /* Increased font size */
    color: #666;
}

.document-actions {
    display: flex;
    gap: 8px;
}

.button {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px; /* Increased padding */
    border: 1px solid #ddd;
    border-radius: 6px; /* Increased border radius */
    background: white;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.2s;
    color: #1a73e8; /* Added color */
}

.button:hover {
    background: #f8f9fa;
    border-color: #1a73e8;
    color: #1557b0; /* Darker color on hover */
}

.button svg {
    stroke: currentColor; /* Match icon color to text */
}

.refresh-button {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    border: 1px solid #ddd;
    border-radius: 6px;
    background: white;
    cursor: pointer;
    transition: all 0.2s;
    min-width: 100px; /* Added min-width */
    justify-content: center; /* Center content */
}

.refresh-button:hover {
    background: #f8f9fa;
    border-color: #1a73e8;
    color: #1557b0;
}

.no-documents {
    text-align: center;
    padding: 40px 20px; /* Increased padding */
    color: #666;
    font-style: italic;
    background: #f8f9fa;
    border-radius: 8px;
    margin: 20px 0;
}

/* Add custom scrollbar styling */
.document-list::-webkit-scrollbar {
    width: 8px;
}

.document-list::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
}

.document-list::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 4px;
}

.document-list::-webkit-scrollbar-thumb:hover {
    background: #999;
}

.modal {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    z-index: 1000;
}

.modal-content {
    position: relative;
    background: white;
    margin: 50px auto;
    padding: 0;
    width: 90%;
    max-width: 800px;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid #ddd;
}

.modal-header h2 {
    margin: 0;
    font-size: 1.5em;
    color: #333;
}

.close-button {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #666;
}

.modal-body {
    padding: 20px;
    max-height: 70vh;
    overflow-y: auto;
}

.modal-footer {
    padding: 16px 20px;
    border-top: 1px solid #ddd;
    display: flex;
    justify-content: flex-end;
    gap: 10px;
}
</style> 