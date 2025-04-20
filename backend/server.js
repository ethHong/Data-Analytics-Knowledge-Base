const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());

// Path to contributors.json
const CONTRIBUTORS_FILE = path.join(__dirname, '../frontend/docs/data/contributors.json');

// Helper function to read contributors data
async function readContributors() {
    const data = await fs.readFile(CONTRIBUTORS_FILE, 'utf8');
    return JSON.parse(data);
}

// Helper function to write contributors data
async function writeContributors(data) {
    await fs.writeFile(CONTRIBUTORS_FILE, JSON.stringify(data, null, 4));
}

// Get all contributors
app.get('/api/contributors', async (req, res) => {
    try {
        const data = await readContributors();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to read contributors' });
    }
});

// Get single contributor
app.get('/api/contributors/:id', async (req, res) => {
    try {
        const data = await readContributors();
        const contributor = data.contributors.find(c => c.id === req.params.id);
        
        if (!contributor) {
            return res.status(404).json({ error: 'Contributor not found' });
        }
        
        res.json(contributor);
    } catch (error) {
        res.status(500).json({ error: 'Failed to read contributor' });
    }
});

// Create new contributor
app.post('/api/contributors', async (req, res) => {
    try {
        const data = await readContributors();
        const newContributor = {
            ...req.body,
            contributions: []
        };
        
        // Check if ID already exists
        if (data.contributors.some(c => c.id === newContributor.id)) {
            return res.status(400).json({ error: 'Contributor ID already exists' });
        }
        
        data.contributors.push(newContributor);
        await writeContributors(data);
        
        res.status(201).json(newContributor);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create contributor' });
    }
});

// Update contributor
app.put('/api/contributors/:id', async (req, res) => {
    try {
        const data = await readContributors();
        const index = data.contributors.findIndex(c => c.id === req.params.id);
        
        if (index === -1) {
            return res.status(404).json({ error: 'Contributor not found' });
        }
        
        // Preserve contributions when updating
        const contributions = data.contributors[index].contributions;
        data.contributors[index] = {
            ...req.body,
            id: req.params.id, // Ensure ID doesn't change
            contributions
        };
        
        await writeContributors(data);
        res.json(data.contributors[index]);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update contributor' });
    }
});

// Delete contributor
app.delete('/api/contributors/:id', async (req, res) => {
    try {
        const data = await readContributors();
        const index = data.contributors.findIndex(c => c.id === req.params.id);
        
        if (index === -1) {
            return res.status(404).json({ error: 'Contributor not found' });
        }
        
        data.contributors.splice(index, 1);
        await writeContributors(data);
        
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete contributor' });
    }
});

// Update contributor contributions
app.put('/api/contributors/:id/contributions', async (req, res) => {
    try {
        const data = await readContributors();
        const index = data.contributors.findIndex(c => c.id === req.params.id);
        
        if (index === -1) {
            return res.status(404).json({ error: 'Contributor not found' });
        }
        
        data.contributors[index].contributions = req.body.contributions;
        await writeContributors(data);
        
        res.json(data.contributors[index]);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update contributions' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 