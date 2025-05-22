# Contributors

<div class="contributors-grid">
  <!-- Contributors will be loaded dynamically -->
</div>

<script src="../js/api-config.js"></script>
<script>
// Function to fetch and display contributors
async function loadContributors() {
    try {
        const response = await fetch('../data/contributors.json');
        if (!response.ok) {
            throw new Error('Failed to fetch contributors data');
        }
        const data = await response.json();
        displayContributors(data.contributors);
    } catch (error) {
        console.error('Error loading contributors:', error);
    }
}

// Function to display contributors
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
            </div>
        </div>
    `).join('');

    grid.innerHTML = contributorCards;

    // Load contributions for each contributor
    contributors.forEach(contributor => {
        loadContributorContributions(contributor.id);
    });
}

// Function to load contributor contributions
async function loadContributorContributions(contributorId) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/contributors/${contributorId}`);
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
        
        return `<li><a href="../${formattedPath}">${doc.title}</a></li>`;
    }).join('');
    
    contributionsEl.innerHTML = contributionsList || '<li>No contributions yet</li>';
}

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', loadContributors);
</script>

<!-- Contribution Modal -->
<div id="contributionModal" class="modal">
  <div class="modal-content">
    <div class="modal-header">
      <h2>Edit Contributions</h2>
      <button class="close-modal" onclick="closeContributionModal()">&times;</button>
    </div>
    <div class="modal-body">
      <div class="search-container">
        <div class="search-row">
          <input type="text" id="documentSearch" placeholder="Search documents..." onkeyup="filterDocuments()">
          <button class="refresh-btn" onclick="handleRefresh()">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M23 4v6h-6"></path>
              <path d="M1 20v-6h6"></path>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10"></path>
              <path d="M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
            </svg>
            Refresh List
          </button>
        </div>
      </div>
      <div class="document-list">
        <!-- Documents will be populated here -->
      </div>
    </div>
    <div class="modal-footer">
      <button onclick="saveContributions()" class="save-btn">Save Changes</button>
      <button onclick="closeContributionModal()" class="cancel-btn">Cancel</button>
    </div>
  </div>
</div>