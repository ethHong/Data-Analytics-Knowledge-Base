// Initialize superuser if not exists
async function initializeSuperuser() {
    try {
        // Use relative URL for domain compatibility
        const apiUrl = window.location.protocol === 'https:' && window.location.hostname.includes('zelkova.dev') 
            ? '/api/auth/init-superuser' // Use relative URL for HTTPS domain
            : 'http://34.82.192.6:8000/api/auth/init-superuser'; // Use absolute URL for development/staging
            
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'admin@anderson.ucla.edu',
                password: 'msba2024!',  // This will be changed on first login
                role: 'admin'
            })
        });
        
        if (response.ok) {
            console.log('Superuser initialized successfully');
            return true;
        } else {
            console.error('Failed to initialize superuser');
            return false;
        }
    } catch (error) {
        console.error('Error initializing superuser:', error);
        return false;
    }
}

// Run initialization when the script loads
document.addEventListener('DOMContentLoaded', initializeSuperuser); 