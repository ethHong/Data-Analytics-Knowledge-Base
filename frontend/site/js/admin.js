// Store all available documents
let allDocuments = [];

// Store contributors data
let contributorsData = [];

// Store current contributor being edited
let currentContributor = null;
let selectedDocuments = new Set();

// API configuration
const API_BASE_URL = 'http://34.82.192.6:8000';

// Function to fetch documents from the API endpoint
async function fetchDocuments() {
    console.log('Fetching documents...');
    try {
        const response = await fetch(`${API_BASE_URL}/api/documents`);
        if (!response.ok) {
            throw new Error('Failed to fetch documents');
        }
        const data = await response.json();
        console.log('Fetched documents:', data);
        allDocuments = data;
        displayDocuments(data);
        return data;
    } catch (error) {
        console.error('Error fetching documents:', error);
        return null;
    }
}

// Function to fetch contributors data from JSON
async function fetchContributorsData() {
    console.log('Fetching contributors...');
    try {
        const response = await fetch('../data/contributors.json');
        if (!response.ok) {
            throw new Error('Failed to fetch contributors data');
        }
        const data = await response.json();
        console.log('Fetched contributors:', data);
        contributorsData = data.contributors;
        displayContributors(data.contributors);
        return data.contributors;
    } catch (error) {
        console.error('Error fetching contributors data:', error);
        return [];
    }
}

// Function to fetch contributor contributions
async function fetchContributorData(contributorId) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/contributors/${contributorId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch contributor data');
        }
        const data = await response.json();
        return data.contributions || [];
    } catch (error) {
        console.error('Error fetching contributor data:', error);
        return [];
    }
}

// Function to update contributor data
async function updateContributorData(contributorId, contributions) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/contributors/${contributorId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ contributions }),
        });
        if (!response.ok) {
            throw new Error('Failed to update contributor data');
        }
        return true;
    } catch (error) {
        console.error('Error updating contributor data:', error);
        return false;
    }
}

// Function to save contributors data to JSON
async function saveContributorsData() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/contributors`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ contributors: contributorsData }),
        });
        if (!response.ok) {
            throw new Error('Failed to save contributors data');
        }
        return true;
    } catch (error) {
        console.error('Error saving contributors data:', error);
        return false;
    }
}

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
    const contributorsGrid = document.querySelector('.admin-section .contributors-grid');
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

    // Load contributions for each contributor
    contributors.forEach(contributor => {
        loadContributorContributions(contributor.id);
    });
}

// Function to load contributor contributions
async function loadContributorContributions(contributorId) {
    const contributions = await fetchContributorData(contributorId);
    updateContributorDisplay(contributorId, contributions);
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

// Function to update contributor display
function updateContributorDisplay(contributorId, contributions) {
    const contributionsEl = document.querySelector(`[data-contributor-id="${contributorId}"] details.contributions ul`);
    if (!contributionsEl) {
        console.error('Could not find contributions element for', contributorId);
        return;
    }

    const contributionsList = contributions.map(doc => {
        let formattedPath = doc.path;
        if (formattedPath.endsWith('.md')) {
            formattedPath = formattedPath.substring(0, formattedPath.length - 3);
        }
        if (!formattedPath.endsWith('/')) {
            formattedPath = formattedPath + '/';
        }
        
        return `<li><a href="../${formattedPath}">${doc.title}</a></li>`;
    }).join('');
    
    contributionsEl.innerHTML = contributionsList;
}

// Function to open contribution modal
function openContributionModal(contributorId) {
    currentContributor = contributorId;
    const modal = document.getElementById('contributionModal');
    modal.style.display = 'block';
    
    // Get current contributions
    const contributionsEl = document.querySelector(`[data-contributor-id="${contributorId}"] details.contributions ul`);
    const currentLinks = Array.from(contributionsEl.querySelectorAll('a'))
        .map(a => {
            let path = a.getAttribute('href').replace('../', '');
            if (path.endsWith('/')) {
                path = path.substring(0, path.length - 1);
            }
            return path + '.md';
        });
    
    // Reset selections
    selectedDocuments = new Set(currentLinks);
    
    // Update the checkboxes to match current selections
    updateDocumentSelection();
}

// Function to close contribution modal
function closeContributionModal() {
    const modal = document.getElementById('contributionModal');
    modal.style.display = 'none';
    currentContributor = null;
    selectedDocuments.clear();
}

// Function to update document selection in modal
function updateDocumentSelection() {
    const documentList = document.querySelector('#contributionModal .document-list');
    if (!documentList) return;

    const documentItems = allDocuments.map(doc => `
        <div class="document-item">
            <label>
                <input type="checkbox" 
                       value="${doc.path}" 
                       ${selectedDocuments.has(doc.path) ? 'checked' : ''}
                       onchange="toggleDocumentSelection('${doc.path}')">
                <span class="document-title">${doc.title}</span>
                <span class="document-path">${doc.path}</span>
            </label>
        </div>
    `).join('');

    documentList.innerHTML = documentItems;
}

// Function to toggle document selection
function toggleDocumentSelection(path) {
    if (selectedDocuments.has(path)) {
        selectedDocuments.delete(path);
    } else {
        selectedDocuments.add(path);
    }
}

// Function to save contributions
async function saveContributions() {
    if (!currentContributor) return;
    
    const selectedDocs = Array.from(selectedDocuments).map(path => {
        const doc = allDocuments.find(d => d.path === path);
        return doc ? { path: doc.path, title: doc.title } : null;
    }).filter(doc => doc !== null);

    const success = await updateContributorData(currentContributor, selectedDocs);
    
    if (success) {
        updateContributorDisplay(currentContributor, selectedDocs);
        closeContributionModal();
    } else {
        alert('Failed to save changes. Please try again.');
    }
}

// Function to open contributor modal for editing or adding
function openContributorModal(contributorId = null) {
    const modal = document.getElementById('contributorModal');
    const modalTitle = document.querySelector('#contributorModal .modal-header h2');
    const form = document.getElementById('contributorForm');
    
    if (contributorId) {
        // Edit existing contributor
        modalTitle.textContent = 'Edit Contributor';
        const contributor = contributorsData.find(c => c.id === contributorId);
        if (contributor) {
            document.getElementById('contributorId').value = contributor.id;
            document.getElementById('contributorName').value = contributor.name;
            document.getElementById('contributorOrg').value = contributor.organization;
            document.getElementById('contributorLinkedin').value = contributor.linkedin;
            document.getElementById('contributorImage').value = contributor.image;
        }
    } else {
        // Add new contributor
        modalTitle.textContent = 'Add New Contributor';
        form.reset();
        document.getElementById('contributorId').value = '';
    }
    
    modal.style.display = 'block';
}

// Function to close contributor modal
function closeContributorModal() {
    const modal = document.getElementById('contributorModal');
    modal.style.display = 'none';
}

// Function to save contributor data
async function saveContributor() {
    const form = document.getElementById('contributorForm');
    const contributorId = document.getElementById('contributorId').value;
    const name = document.getElementById('contributorName').value;
    const organization = document.getElementById('contributorOrg').value;
    const linkedin = document.getElementById('contributorLinkedin').value;
    const image = document.getElementById('contributorImage').value;
    
    if (!name || !organization) {
        alert('Name and organization are required');
        return;
    }
    
    const id = contributorId || name.toLowerCase().replace(/\s+/g, '-');
    
    const contributor = {
        id,
        name,
        organization,
        linkedin,
        image: image || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=200&background=random`,
        contributions: []
    };
    
    if (contributorId) {
        // Update existing contributor
        const index = contributorsData.findIndex(c => c.id === contributorId);
        if (index !== -1) {
            // Preserve existing contributions
            contributor.contributions = contributorsData[index].contributions;
            contributorsData[index] = contributor;
        }
    } else {
        // Add new contributor
        contributorsData.push(contributor);
    }
    
    const success = await saveContributorsData();
    
    if (success) {
        displayContributors(contributorsData);
        closeContributorModal();
    } else {
        alert('Failed to save contributor data. Please try again.');
    }
}

// Function to delete contributor
async function deleteContributor(contributorId) {
    if (!confirm('Are you sure you want to delete this contributor?')) {
        return;
    }
    
    contributorsData = contributorsData.filter(c => c.id !== contributorId);
    
    const success = await saveContributorsData();
    
    if (success) {
        displayContributors(contributorsData);
    } else {
        alert('Failed to delete contributor. Please try again.');
    }
}

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
            fetchContributorsData()
        ]);
        console.log('Initialization complete');
    } catch (error) {
        console.error('Error during initialization:', error);
    }
}); 