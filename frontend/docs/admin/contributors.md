# Contributor Management

<div class="contributors-grid">
  <!-- Contributors will be loaded dynamically -->
</div>

<style>
.contributors-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;
}

.profile-card {
    background: white;
    border: 1px solid #ddd;
    border-radius: 8px;
    overflow: hidden;
    transition: all 0.2s ease;
}

.profile-card:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
}

.profile-header {
    padding: 20px;
    text-align: center;
    background: #f8f9fa;
    border-bottom: 1px solid #ddd;
}

.profile-image {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    object-fit: cover;
    border: 3px solid white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.profile-info {
    padding: 20px;
}

.profile-info h3 {
    margin: 0 0 10px;
    color: #333;
}

.organization {
    color: #666;
    margin: 0 0 15px;
    font-size: 0.9em;
}

.contributions {
    margin: 15px 0;
}

.contributions summary {
    cursor: pointer;
    padding: 8px 0;
}

.contributions-list {
    list-style: none;
    padding: 10px 0;
    margin: 0;
}

.contributions-list li {
    padding: 8px 0;
    border-bottom: 1px solid #eee;
}

.contributions-list li:last-child {
    border-bottom: none;
}

.contributions-list a {
    color: #1a73e8;
    text-decoration: none;
}

.contributions-list a:hover {
    text-decoration: underline;
}

.add-contributor {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 200px;
    cursor: pointer;
    background: #f8f9fa;
    border: 2px dashed #ddd;
}

.add-contributor:hover {
    border-color: #1a73e8;
    background: #f0f7fe;
}

.add-icon {
    color: #1a73e8;
    margin-bottom: 10px;
}

.add-text h3 {
    margin: 0;
    color: #1a73e8;
}

.button {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    border: 1px solid #ddd;
    border-radius: 6px;
    background: white;
    color: #1a73e8;
    cursor: pointer;
    font-size: 14px;
    text-decoration: none;
    transition: all 0.2s;
    margin: 5px 0;
    width: 100%;
    justify-content: center;
}

.button:hover {
    background: #f8f9fa;
    border-color: #1a73e8;
}

.button.primary {
    background: #1a73e8;
    border-color: #1557b0;
    color: white;
}

.button.primary:hover {
    background: #1557b0;
}

.button.danger {
    color: #dc3545;
}

.button.danger:hover {
    background: #dc3545;
    border-color: #dc3545;
    color: white;
}

.checkbox-container {
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
}

.checkbox-container input[type="checkbox"] {
    width: 18px;
    height: 18px;
}

/* Modal styles from documents.md */
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

.form-group {
    margin-bottom: 20px;
}

.form-group label {
    display: block;
    margin-bottom: 8px;
    color: #333;
    font-weight: 500;
}

.form-group input {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
}

.form-group small {
    display: block;
    margin-top: 4px;
    color: #666;
    font-size: 12px;
}

.document-list {
    margin-top: 20px;
}

.document-item {
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
    margin-bottom: 8px;
    background: white;
}

.document-item:hover {
    border-color: #1a73e8;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.search-container {
    margin-bottom: 20px;
}

.search-container input {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
}
</style>

<script>
// Authentication check - redirect non-admin users to login
document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.replace('/auth/login.html');
        return;
    }
    
    // Check admin status
    fetch('http://34.82.192.6:8000/api/auth/me', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        if (response.status === 401) {
            window.location.replace('/auth/login.html');
            return null;
        }
        if (!response.ok) {
            throw new Error('Failed to verify user');
        }
        return response.json();
    })
    .then(userData => {
        if (!userData) return;
        if (userData.role !== 'admin') {
            window.location.replace('/index.html');
        }
    })
    .catch(error => {
        console.error('Authentication error:', error);
        window.location.replace('/auth/login.html');
    });
});

// Add these variables at the top of the script section
let allDocuments = [];
let selectedContributions = new Set();

// Function to fetch and display contributors
async function loadContributors() {
    try {
        // Try to fetch from API first
        const apiResponse = await fetch('http://34.82.192.6:8000/api/contributors');
        if (apiResponse.ok) {
            const data = await apiResponse.json();
            displayContributors(data.contributors || []);
            return;
        }
        
        // If API fails, fall back to local JSON
        console.log('API unavailable, falling back to local JSON');
        const jsonResponse = await fetch('../../data/contributors.json');
        if (!jsonResponse.ok) {
            throw new Error('Failed to fetch contributors data from both API and local JSON');
        }
        const data = await jsonResponse.json();
        displayContributors(data.contributors || []);
    } catch (error) {
        console.error('Error loading contributors:', error);
        const grid = document.querySelector('.contributors-grid');
        if (grid) {
            grid.innerHTML = `
                <div class="error-message">
                    <p>Error loading contributors: ${error.message}</p>
                    <button class="button primary" onclick="loadContributors()">Try Again</button>
                </div>
            `;
        }
    }
}

// Function to display contributors with admin controls
function displayContributors(contributors) {
    const grid = document.querySelector('.contributors-grid');
    if (!grid) return;

    const contributorCards = contributors.map(contributor => `
        <div class="profile-card" data-contributor-id="${contributor.id}">
            <div class="profile-header">
                <img class="profile-image" src="${contributor.image || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(contributor.name)}" alt="${contributor.name}" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(contributor.name)}'">
            </div>
            <div class="profile-info">
                <h3>${contributor.name}</h3>
                <p class="organization">${contributor.organization}</p>
                <a href="${contributor.linkedin}" target="_blank" class="button">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                    </svg>
                    LinkedIn
                </a>
                <details class="contributions">
                    <summary class="button primary">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                        </svg>
                        Contributions
                    </summary>
                    <ul class="contributions-list"></ul>
                </details>
                <button class="button" onclick="openContributorModal('${contributor.id}')">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
                    </svg>
                    Edit Info
                </button>
                <button class="button" onclick="openContributionModal('${contributor.id}')">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34"/>
                        <polygon points="18 2 22 6 12 16 8 16 8 12 18 2"/>
                    </svg>
                    Edit Contributions
                </button>
                <button class="button danger" onclick="deleteContributor('${contributor.id}')">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M3 6h18"/>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                    Delete
                </button>
            </div>
        </div>
    `).join('');

    const addNewCard = `
        <div class="profile-card add-contributor" onclick="openContributorModal()">
            <div class="add-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
            </div>
            <div class="add-text">
                <h3>Add New Contributor</h3>
            </div>
        </div>
    `;

    grid.innerHTML = contributorCards + addNewCard;

    // Load contributions for each contributor
    contributors.forEach(contributor => {
        loadContributorContributions(contributor.id);
    });
}

// Function to load contributor contributions
async function loadContributorContributions(contributorId) {
    try {
        const response = await fetch(`http://34.82.192.6:8000/api/contributors/${contributorId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch contributor data');
        }
        const data = await response.json();
        updateContributorContributions(contributorId, data.contributions || []);
    } catch (error) {
        console.error('Error loading contributions:', error);
    }
}

// Function to update contributor contributions display
function updateContributorContributions(contributorId, contributions) {
    const contributionsEl = document.querySelector(`[data-contributor-id="${contributorId}"] .contributions-list`);
    if (!contributionsEl) return;

    if (!contributions || contributions.length === 0) {
        contributionsEl.innerHTML = '<li>No contributions yet</li>';
        return;
    }

    const contributionsList = contributions.map(doc => {
        return `<li><a href="../../markdowns/${encodeURIComponent(doc.title)}/">${doc.title}</a></li>`;
    }).join('');
    
    contributionsEl.innerHTML = contributionsList;
}

// Function to toggle contributions visibility
function toggleContributions(contributorId) {
    const card = document.querySelector(`[data-contributor-id="${contributorId}"]`);
    const container = card.querySelector('.contributions-container');
    const isVisible = container.style.display === 'block';
    container.style.display = isVisible ? 'none' : 'block';
}

// Function to close any modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

// Add event listeners to close modals when clicking outside
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
}

// Function to open contributor modal for editing or creating
function openContributorModal(contributorId = null) {
    const modal = document.getElementById('contributorModal');
    const form = document.getElementById('contributorForm');
    const title = modal.querySelector('.modal-header h2');

    // Reset form
    form.reset();
    
    if (contributorId) {
        title.textContent = 'Edit Contributor';
        // Fetch current contributor data
        fetch(`http://34.82.192.6:8000/api/contributors/${contributorId}`)
            .then(response => response.json())
            .then(data => {
                form.elements.name.value = data.name;
                form.elements.organization.value = data.organization;
                form.elements.linkedin.value = data.linkedin || '';
                form.elements.image.value = data.image || '';
                form.dataset.contributorId = contributorId;
            })
            .catch(error => {
                console.error('Error loading contributor:', error);
                alert('Failed to load contributor data');
            });
    } else {
        title.textContent = 'Add New Contributor';
        delete form.dataset.contributorId;
    }

    modal.style.display = 'block';
}

// Function to save contributor
async function saveContributor(event) {
    event.preventDefault();
    const form = event.target;
    const contributorId = form.dataset.contributorId;
    const isNewContributor = !contributorId;

    const contributorData = {
        name: form.elements.name.value,
        organization: form.elements.organization.value,
        linkedin: form.elements.linkedin.value,
        image: form.elements.image.value
    };

    if (isNewContributor) {
        // Generate ID from name (lowercase, replace spaces with hyphens)
        contributorData.id = contributorData.name.toLowerCase().replace(/\s+/g, '-');
    }

    try {
        const response = await fetch(`http://34.82.192.6:8000/api/contributors${isNewContributor ? '' : '/' + contributorId}`, {
            method: isNewContributor ? 'POST' : 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(contributorData)
        });

        if (!response.ok) {
            throw new Error('Failed to save contributor');
        }

        // Close modal and refresh list
        closeModal('contributorModal');
        loadContributors();
        
        // Show success message
        alert(isNewContributor ? 'Contributor added successfully!' : 'Contributor updated successfully!');
    } catch (error) {
        console.error('Error saving contributor:', error);
        alert('Failed to save contributor. Please try again.');
    }
}

// Function to delete contributor
async function deleteContributor(contributorId) {
    if (!confirm('Are you sure you want to delete this contributor? This action cannot be undone.')) {
        return;
    }

    try {
        const response = await fetch(`http://34.82.192.6:8000/api/contributors/${contributorId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Failed to delete contributor');
        }

        // Refresh list
        loadContributors();
        
        // Show success message
        alert('Contributor deleted successfully!');
    } catch (error) {
        console.error('Error deleting contributor:', error);
        alert('Failed to delete contributor. Please try again.');
    }
}

// Add these functions before the openContributionModal function
function filterContributionDocuments() {
    const searchInput = document.getElementById('contributionSearch');
    if (!searchInput) return;
    
    const searchTerm = searchInput.value.toLowerCase();
    const filteredDocs = allDocuments.filter(doc => 
        doc.title.toLowerCase().includes(searchTerm)
    );
    
    displayContributionDocuments(filteredDocs);
}

function handleContributionSelection(event) {
    const title = event.target.value;
    if (event.target.checked) {
        selectedContributions.add(title);
    } else {
        selectedContributions.delete(title);
    }
}

// Update the openContributionModal function
async function openContributionModal(contributorId) {
    const modal = document.getElementById('contributionModal');
    modal.dataset.contributorId = contributorId;
    
    try {
        // Fetch documents
        const apiUrl = 'http://34.82.192.6:8000/api/documents';
        console.log('Fetching documents from:', apiUrl);
        
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });
        
        console.log('Documents response status:', response.status);
        
        if (!response.ok) {
            throw new Error('Failed to fetch documents');
        }
        
        const data = await response.json();
        console.log('Documents data:', data);
        
        if (!data || !Array.isArray(data.documents)) {
            throw new Error('Invalid data format received from API');
        }
        
        // Store all documents globally
        allDocuments = data.documents;
        
        // Get current contributor data to know which documents are selected
        const contributorResponse = await fetch(`http://34.82.192.6:8000/api/contributors/${contributorId}`);
        if (!contributorResponse.ok) {
            throw new Error('Failed to fetch contributor data');
        }
        const contributor = await contributorResponse.json();
        
        // Reset and set selected documents
        selectedContributions.clear();
        if (contributor.contributions) {
            contributor.contributions.forEach(doc => selectedContributions.add(doc.title));
        }
        
        // Display documents with selections
        displayContributionDocuments(allDocuments);
        
        // Show the modal
        modal.style.display = 'block';
    } catch (error) {
        console.error('Error opening contribution modal:', error);
        alert('Failed to load documents. Please try again.');
    }
}

// Update the displayContributionDocuments function
function displayContributionDocuments(documents) {
    const documentList = document.getElementById('contributionDocumentList');
    if (!documentList) {
        console.error('Document list container not found');
        return;
    }

    if (!documents || documents.length === 0) {
        documentList.innerHTML = '<div class="no-documents">No documents found.</div>';
        return;
    }

    const html = documents
        .sort((a, b) => a.title.localeCompare(b.title))
        .map(doc => `
            <div class="document-item">
                <label class="checkbox-container">
                    <input type="checkbox" 
                           value="${doc.title}" 
                           ${selectedContributions.has(doc.title) ? 'checked' : ''}
                           onchange="handleContributionSelection(event)">
                    <div class="document-info">
                        <span class="document-title">${doc.title}</span>
                    </div>
                </label>
            </div>
        `).join('');

    documentList.innerHTML = html;
    console.log('Documents displayed:', documents.length);
}

// Helper function to fetch documents
async function fetchDocuments() {
    try {
        const response = await fetch('http://34.82.192.6:8000/api/documents');
        if (!response.ok) {
            throw new Error('Failed to fetch documents');
        }
        const data = await response.json();
        return data.documents || [];
    } catch (error) {
        console.error('Error fetching documents:', error);
        return [];
    }
}

// Function to save contributions
async function saveContributions() {
    const modal = document.getElementById('contributionModal');
    const contributorId = modal.dataset.contributorId;
    
    if (!contributorId) {
        console.error('No contributor ID found');
        alert('Error: Could not identify the contributor');
        return;
    }

    // Get selected documents
    const selectedDocs = Array.from(document.querySelectorAll('#contributionDocumentList input[type="checkbox"]:checked'))
        .map(checkbox => ({
            title: checkbox.value,
            path: `markdowns/${checkbox.value}.md`
        }));

    console.log('Saving contributions:', {
        contributorId,
        selectedDocs
    });

    try {
        // First, save to API
        const apiResponse = await fetch(`http://34.82.192.6:8000/api/contributors/${contributorId}/contributions`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                contributions: selectedDocs
            })
        });

        if (!apiResponse.ok) {
            const errorData = await apiResponse.text();
            console.error('API error response:', errorData);
            throw new Error(`Failed to save contributions to API: ${errorData}`);
        }

        // Then, update local JSON file
        const jsonResponse = await fetch('../../data/contributors.json');
        if (!jsonResponse.ok) {
            throw new Error('Failed to fetch local contributors.json');
        }
        const jsonData = await jsonResponse.json();
        
        // Find and update the contributor's contributions
        const contributorIndex = jsonData.contributors.findIndex(c => c.id === contributorId);
        if (contributorIndex === -1) {
            throw new Error('Contributor not found in local JSON file');
        }
        
        jsonData.contributors[contributorIndex].contributions = selectedDocs;
        
        // Save updated JSON back to file
        const saveResponse = await fetch('../../data/contributors.json', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(jsonData, null, 2)
        });

        if (!saveResponse.ok) {
            throw new Error('Failed to save to local JSON file');
        }

        // Close modal and refresh contributions
        closeModal('contributionModal');
        await loadContributorContributions(contributorId);
        
        // Show success message
        alert('Contributions updated successfully in both API and local file!');
    } catch (error) {
        console.error('Error saving contributions:', error);
        alert(error.message);
    }
}

// Initialize document loading
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Contributor management page loaded');
    // Initial contributors fetch
    await loadContributors();
    
    // Initial documents fetch
    const documents = await fetchDocuments();
    if (documents) {
        allDocuments = documents;
    }
    
    // Add event listener for the refresh button
    const refreshButton = document.querySelector('.refresh-button');
    if (refreshButton) {
        refreshButton.addEventListener('click', handleRefresh);
    }
});

// Simple refresh function
function handleRefresh() {
    loadContributors();
}
</script>

<!-- Contribution Modal -->
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
            <div id="contributionDocumentList" class="document-list">
                <!-- Documents will be loaded here -->
            </div>
        </div>
        <div class="modal-footer">
            <button class="button" onclick="closeModal('contributionModal')">Cancel</button>
            <button class="button primary" onclick="saveContributions()">Save Changes</button>
        </div>
    </div>
</div>

<!-- Contributor Modal -->
<div id="contributorModal" class="modal">
    <div class="modal-content">
        <div class="modal-header">
            <h2>Add New Contributor</h2>
            <button class="close-button" onclick="closeModal('contributorModal')">&times;</button>
        </div>
        <div class="modal-body">
            <form id="contributorForm" onsubmit="saveContributor(event)">
                <div class="form-group">
                    <label for="name">Name *</label>
                    <input type="text" id="name" name="name" required>
                </div>
                <div class="form-group">
                    <label for="organization">Organization *</label>
                    <input type="text" id="organization" name="organization" required>
                </div>
                <div class="form-group">
                    <label for="linkedin">LinkedIn URL</label>
                    <input type="url" id="linkedin" name="linkedin">
                </div>
                <div class="form-group">
                    <label for="image">Profile Image URL</label>
                    <input type="url" id="image" name="image">
                    <small>Leave empty to use auto-generated avatar</small>
                </div>
                <div class="modal-footer">
                    <button type="button" class="button" onclick="closeModal('contributorModal')">Cancel</button>
                    <button type="submit" class="button primary">Save</button>
                </div>
            </form>
        </div>
    </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/@babel/polyfill@7.12.1/dist/polyfill.min.js"></script> 