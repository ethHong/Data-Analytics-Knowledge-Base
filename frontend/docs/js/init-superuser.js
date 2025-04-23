// Initialize superuser if not exists
async function initializeSuperuser() {
    try {
        const response = await fetch('http://34.82.192.6:8000/api/auth/init-superuser', {
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