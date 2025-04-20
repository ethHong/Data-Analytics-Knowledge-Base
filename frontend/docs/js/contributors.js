// Store all available documents
let allDocuments = [];

// Store current contributor being edited
let currentContributor = null;
let selectedDocuments = new Set();

// API configuration
//const API_BASE_URL = 'http://localhost:8000';
const API_BASE_URL = 'http://34.82.192.6:8000';

// Function to fetch documents from the API endpoint
async function fetchDocuments() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/documents`);
        if (!response.ok) {
            throw new Error('Failed to fetch documents');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching documents:', error);
        return null;
    }
}

// Function to search documents
async function searchDocuments(query) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/documents/search?query=${encodeURIComponent(query)}`);
        if (!response.ok) {
            throw new Error('Failed to search documents');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error searching documents:', error);
        return null;
    }
}

// Function to fetch and refresh documents
async function refreshDocuments() {
    try {
        const documents = await fetchDocuments();
        if (!documents) {
            throw new Error('Failed to fetch documents');
        }
        
        allDocuments = documents;
        populateDocumentList();
        return true;
    } catch (error) {
        console.error('Error refreshing documents:', error);
        return false;
    }
}

// Initialize the modal
document.addEventListener('DOMContentLoaded', async () => {
    const modal = document.getElementById('contributionModal');
    
    // Close modal when clicking outside
    window.onclick = (event) => {
        if (event.target === modal) {
            closeContributionModal();
        }
    };

    // Initial document fetch
    await refreshDocuments();
});

function openContributionModal(contributorId) {
    currentContributor = contributorId;
    const modal = document.getElementById('contributionModal');
    modal.style.display = 'block';
    
    // Get current contributions
    const contributionsEl = document.querySelector(`[onclick="openContributionModal('${contributorId}')"]`)
        .previousElementSibling;
    const currentLinks = Array.from(contributionsEl.querySelectorAll('a'))
        .map(a => a.getAttribute('href'));
    
    // Reset selections
    selectedDocuments = new Set(currentLinks);
    updateDocumentSelection();
}

function closeContributionModal() {
    const modal = document.getElementById('contributionModal');
    modal.style.display = 'none';
    currentContributor = null;
    selectedDocuments.clear();
}

function populateDocumentList() {
    const documentList = document.querySelector('.document-list');
    documentList.innerHTML = '';
    
    if (allDocuments.length === 0) {
        documentList.innerHTML = '<div class="no-documents">No documents found. Try refreshing the list.</div>';
        return;
    }
    
    allDocuments.forEach(doc => {
        const item = document.createElement('div');
        item.className = 'document-item';
        item.setAttribute('data-path', doc.path);
        item.innerHTML = `
            <input type="checkbox" id="${doc.path}" ${selectedDocuments.has(doc.path) ? 'checked' : ''}>
            <label for="${doc.path}">${doc.title}</label>
        `;
        
        item.querySelector('input').addEventListener('change', (e) => {
            if (e.target.checked) {
                selectedDocuments.add(doc.path);
                item.classList.add('selected');
            } else {
                selectedDocuments.delete(doc.path);
                item.classList.remove('selected');
            }
        });
        
        documentList.appendChild(item);
    });
}

async function filterDocuments() {
    const searchTerm = document.getElementById('documentSearch').value;
    if (!searchTerm.trim()) {
        // If search is empty, show all documents
        allDocuments = await fetchDocuments();
    } else {
        // Search using API
        const results = await searchDocuments(searchTerm);
        if (results) {
            allDocuments = results;
        }
    }
    populateDocumentList();
}

function updateDocumentSelection() {
    const items = document.querySelectorAll('.document-item');
    items.forEach(item => {
        const path = item.getAttribute('data-path');
        const checkbox = item.querySelector('input');
        checkbox.checked = selectedDocuments.has(path);
        item.classList.toggle('selected', checkbox.checked);
    });
}

async function handleRefresh() {
    const refreshBtn = document.querySelector('.refresh-btn');
    const originalText = refreshBtn.textContent;
    refreshBtn.textContent = 'Refreshing...';
    refreshBtn.disabled = true;
    
    const success = await refreshDocuments();
    
    refreshBtn.textContent = success ? originalText : 'Refresh Failed';
    refreshBtn.disabled = false;
    
    if (!success) {
        setTimeout(() => {
            refreshBtn.textContent = originalText;
        }, 2000);
    }
}

function saveContributions() {
    if (!currentContributor) return;
    
    const contributionsEl = document.querySelector(`[onclick="openContributionModal('${currentContributor}')"]`)
        .previousElementSibling
        .querySelector('ul');
    
    // Update the contributions list
    contributionsEl.innerHTML = Array.from(selectedDocuments)
        .map(path => {
            const doc = allDocuments.find(d => d.path === path);
            return `<li><a href="${path}">${doc.title}</a></li>`;
        })
        .join('');
    
    closeContributionModal();
} 