# Contributor Management

<div class="contributors-grid">
  <!-- Contributors will be loaded dynamically -->
</div>

<script>
// Function to fetch and display contributors
async function loadContributors() {
    try {
        const response = await fetch('../../data/contributors.json');
        if (!response.ok) {
            throw new Error('Failed to fetch contributors data');
        }
        const data = await response.json();
        displayContributors(data.contributors);
    } catch (error) {
        console.error('Error loading contributors:', error);
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
                    <ul></ul>
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
    const contributionsEl = document.querySelector(`[data-contributor-id="${contributorId}"] .contributions ul`);
    if (!contributionsEl) return;

    const contributionsList = contributions.map(doc => {
        let formattedPath = doc.path;
        if (formattedPath.endsWith('.md')) {
            formattedPath = formattedPath.substring(0, formattedPath.length - 3);
        }
        if (!formattedPath.endsWith('/')) {
            formattedPath = formattedPath + '/';
        }
        
        return `<li><a href="../../${formattedPath}">${doc.title}</a></li>`;
    }).join('');
    
    contributionsEl.innerHTML = contributionsList || '<li>No contributions yet</li>';
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

// Function to save contributions
async function saveContributions() {
    const modal = document.getElementById('contributionModal');
    const contributorId = modal.dataset.contributorId;
    const selectedDocs = Array.from(document.querySelectorAll('#contributionModal .document-list input[type="checkbox"]:checked'))
        .map(checkbox => {
            const [path, title] = checkbox.value.split('|');
            return {
                path: path,
                title: title
            };
        });

    try {
        // First, update the API
        const apiResponse = await fetch(`http://34.82.192.6:8000/api/contributors/${contributorId}/contributions`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ contributions: selectedDocs })
        });

        if (!apiResponse.ok) {
            throw new Error('Failed to save contributions to API');
        }

        // Then, update the local JSON file
        const jsonResponse = await fetch('../../data/contributors.json');
        if (!jsonResponse.ok) {
            throw new Error('Failed to fetch contributors.json');
        }
        
        const data = await jsonResponse.json();
        const contributorIndex = data.contributors.findIndex(c => c.id === contributorId);
        
        if (contributorIndex === -1) {
            throw new Error('Contributor not found in JSON file');
        }

        // Update the contributions in the JSON data
        data.contributors[contributorIndex].contributions = selectedDocs;

        // Save the updated JSON file
        const saveResponse = await fetch('../../data/contributors.json', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data, null, 2)
        });

        if (!saveResponse.ok) {
            throw new Error('Failed to save contributors.json');
        }

        // Close modal and refresh contributions
        closeModal('contributionModal');
        loadContributorContributions(contributorId);
        
        // Show success message
        alert('Contributions updated successfully!');
    } catch (error) {
        console.error('Error saving contributions:', error);
        alert('Failed to save contributions: ' + error.message);
    }
}

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', loadContributors);
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
                <input type="text" id="modalDocumentSearch" placeholder="Search documents..." onkeyup="filterDocuments()">
            </div>
            <div class="document-list"></div>
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