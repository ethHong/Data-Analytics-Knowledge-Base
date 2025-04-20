// Store all available documents
let allDocuments = [];

// Store contributors data
let contributorsData = [];

// Store current contributor being edited
let currentContributor = null;
let selectedDocuments = new Set();

// API configuration
const API_BASE_URL = 'http://34.82.192.6:8000';

// Document Management Functions
async function fetchDocuments() {
    console.log('Fetching documents...');
    try {
        const response = await fetch(`${API_BASE_URL}/api/documents`);
        if (!response.ok) {
            throw new Error('Failed to fetch documents');
        }
        const data = await response.json();
        console.log('Fetched documents:', data);
        return data.documents;
    } catch (error) {
        console.error('Error fetching documents:', error);
        return null;
    }
}

// Contributor Management Functions
async function fetchContributors() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/contributors`);
        if (!response.ok) {
            throw new Error('Failed to fetch contributors');
        }
        const data = await response.json();
        return data.contributors;
    } catch (error) {
        console.error('Error fetching contributors:', error);
        return null;
    }
}

async function saveContributor(contributorData, contributorId = null) {
    const method = contributorId ? 'PUT' : 'POST';
    const url = contributorId 
        ? `${API_BASE_URL}/api/contributors/${contributorId}`
        : `${API_BASE_URL}/api/contributors`;

    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(contributorData)
        });

        if (!response.ok) {
            throw new Error('Failed to save contributor');
        }

        return await response.json();
    } catch (error) {
        console.error('Error saving contributor:', error);
        throw error;
    }
}

async function deleteContributor(contributorId) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/contributors/${contributorId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Failed to delete contributor');
        }

        return true;
    } catch (error) {
        console.error('Error deleting contributor:', error);
        throw error;
    }
}

// Modal Management Functions
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

// Event Listeners
document.addEventListener('click', function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
});

// Function to display documents in the document list
function displayDocuments(documents) {
    console.log('Displaying documents:', documents);
    const documentLists = document.querySelectorAll('.document-list');
    if (!documentLists.length) {
        console.error('No document lists found');
        return;
    }

    const documentItems = documents.map(doc => `
        <div class="document-item">
            <label>
                <input type="checkbox" value="${doc.path}" ${selectedDocuments.has(doc.path) ? 'checked' : ''}>
                <span class="document-title">${doc.title}</span>
                <span class="document-path">${doc.path}</span>
            </label>
        </div>
    `).join('');

    documentLists.forEach(list => {
        list.innerHTML = documentItems;
    });
}

// Function to display contributors in the admin dashboard
function displayContributors(contributors) {
    console.log('Displaying contributors:', contributors);
    const contributorsGrid = document.querySelector('.contributors-grid');
    if (!contributorsGrid) {
        console.error('Contributors grid not found');
        return;
    }

    const contributorCards = contributors.map(contributor => `
        <div class="contributor-card" data-contributor-id="${contributor.id}">
            <div class="contributor-header">
                <img class="contributor-avatar" src="${contributor.image}" alt="${contributor.name}">
                <div class="contributor-info">
                    <h3>${contributor.name}</h3>
                    <p>${contributor.organization}</p>
                    <a href="${contributor.linkedin}" target="_blank" class="linkedin-link">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                        </svg>
                        LinkedIn
                    </a>
                </div>
            </div>
            <div class="contributor-actions">
                <button class="edit-button" onclick="openContributionModal('${contributor.id}')">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34"></path>
                        <polygon points="18 2 22 6 12 16 8 16 8 12 18 2"></polygon>
                    </svg>
                    Edit Contributions
                </button>
                <button class="edit-button" onclick="openContributorModal('${contributor.id}')">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                    </svg>
                    Edit Info
                </button>
                <button class="delete-button" onclick="deleteContributor('${contributor.id}')">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M3 6h18"></path>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                    Delete
                </button>
            </div>
        </div>
    `).join('');

    contributorsGrid.innerHTML = contributorCards + `
        <div class="contributor-card add-contributor" onclick="openContributorModal()">
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
}

// Function to filter documents based on search input
function filterDocuments() {
    const searchInput = document.getElementById('documentSearch');
    const modalSearchInput = document.getElementById('modalDocumentSearch');
    const searchTerm = (searchInput?.value || modalSearchInput?.value || '').toLowerCase();
    
    const filteredDocs = allDocuments.filter(doc => 
        doc.title.toLowerCase().includes(searchTerm) || 
        doc.path.toLowerCase().includes(searchTerm)
    );
    
    displayDocuments(filteredDocs);
}

// Function to handle refresh button click
async function handleRefresh() {
    console.log('Refresh button clicked');
    const documents = await fetchDocuments();
    if (documents) {
        displayDocuments(documents);
    }
}

// Function to open the contributor modal for editing or creating a contributor
function openContributorModal(contributorId = null) {
    const modal = document.getElementById('contributorModal');
    const form = document.getElementById('contributorForm');
    
    if (contributorId) {
        currentContributor = contributorsData.find(c => c.id === contributorId);
        if (currentContributor) {
            form.name.value = currentContributor.name;
            form.organization.value = currentContributor.organization;
            form.linkedin.value = currentContributor.linkedin;
            form.image.value = currentContributor.image;
        }
    } else {
        currentContributor = null;
        form.reset();
    }
    
    modal.style.display = 'block';
}

// Function to open the contribution modal for editing a contributor's contributions
function openContributionModal(contributorId) {
    const modal = document.getElementById('contributionModal');
    currentContributor = contributorsData.find(c => c.id === contributorId);
    
    if (currentContributor) {
        selectedDocuments = new Set(currentContributor.contributions || []);
        displayDocuments(allDocuments);
    }
    
    modal.style.display = 'block';
}

// Function to handle document checkbox changes
function handleDocumentSelection(event) {
    const checkbox = event.target;
    if (checkbox.type === 'checkbox') {
        if (checkbox.checked) {
            selectedDocuments.add(checkbox.value);
        } else {
            selectedDocuments.delete(checkbox.value);
        }
    }
}

// Add event listeners for document selection
document.addEventListener('change', handleDocumentSelection);

// Initialize the admin dashboard when the page loads
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM Content Loaded - Initializing admin dashboard...');
    
    // Add click event listener to refresh button
    const refreshButton = document.querySelector('.refresh-button');
    if (refreshButton) {
        console.log('Found refresh button, adding click listener');
        refreshButton.addEventListener('click', handleRefresh);
    } else {
        console.error('Refresh button not found');
    }
    
    try {
        await Promise.all([
            fetchDocuments(),
            fetchContributors()
        ]);
        console.log('Initialization complete');
    } catch (error) {
        console.error('Error during initialization:', error);
    }
}); 