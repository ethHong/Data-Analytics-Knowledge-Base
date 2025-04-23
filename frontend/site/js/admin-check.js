// Simple admin access diagnostics 
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on an admin page
    if (window.location.pathname.includes('/admin/')) {
        console.log('ADMIN PAGE DETECTED:', window.location.pathname);
        
        const token = localStorage.getItem('token');
        console.log('TOKEN EXISTS:', !!token);
        
        if (token) {
            try {
                // Try to parse the token
                const parts = token.split('.');
                if (parts.length === 3) {
                    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
                    let payload;
                    try {
                        payload = JSON.parse(atob(base64));
                        console.log('TOKEN PAYLOAD:', payload);
                        
                        // Check for role in common locations
                        if (payload.role) {
                            console.log('ROLE (direct):', payload.role);
                        }
                        if (payload.user && payload.user.role) {
                            console.log('ROLE (in user):', payload.user.role);
                        }
                    } catch(e) {
                        console.error('ERROR PARSING TOKEN:', e);
                    }
                } else {
                    console.error('INVALID TOKEN FORMAT');
                }
            } catch(e) {
                console.error('TOKEN PARSE ERROR:', e);
            }
        }
        
        // Add a debug button to the page
        const debugBtn = document.createElement('button');
        debugBtn.textContent = 'Debug Admin Access';
        debugBtn.style.position = 'fixed';
        debugBtn.style.bottom = '10px';
        debugBtn.style.right = '10px';
        debugBtn.style.zIndex = '9999';
        debugBtn.style.padding = '10px';
        debugBtn.style.backgroundColor = '#007bff';
        debugBtn.style.color = 'white';
        debugBtn.style.border = 'none';
        debugBtn.style.borderRadius = '4px';
        debugBtn.style.cursor = 'pointer';
        
        debugBtn.onclick = function() {
            // Check current user info
            fetch('/api/auth/me', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            .then(response => response.json())
            .then(data => {
                alert(`Current user: ${JSON.stringify(data, null, 2)}`);
            })
            .catch(error => {
                alert(`Error fetching user info: ${error.message}`);
            });
        };
        
        document.body.appendChild(debugBtn);
    }
}); 