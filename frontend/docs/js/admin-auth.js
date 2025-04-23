// Basic admin access control
// STEP 1: Allow all authenticated users to access admin pages (for testing)
// STEP 2: Once confirmed working, we'll add the admin-only check

(function() {
    // Skip checks on login page
    if (window.location.pathname.includes('/auth/login.html')) {
        return;
    }
    
    // Only check admin pages
    if (window.location.pathname.includes('/admin/')) {
        console.log("ADMIN PAGE DETECTED:", window.location.pathname);
        
        // Hide content until checks complete
        document.write('<style>body { visibility: hidden; }</style>');
        
        // Check if any token exists (basic auth check)
        const token = localStorage.getItem('token');
        if (!token) {
            console.log("NO TOKEN - redirecting to login");
            window.location.replace('/auth/login.html');
            return;
        }
        
        console.log("TOKEN FOUND - allowing access for now");
        
        // Show content - STEP 1: Allow all authenticated users
        window.addEventListener('DOMContentLoaded', function() {
            // Add debug info at top of page
            const debugInfo = document.createElement('div');
            debugInfo.style.backgroundColor = '#ffcc00';
            debugInfo.style.color = 'black';
            debugInfo.style.padding = '5px';
            debugInfo.style.textAlign = 'center';
            debugInfo.innerHTML = 'DEBUG: Admin restriction temporarily disabled';
            document.body.prepend(debugInfo);
            
            // Show the page content
            document.body.style.visibility = 'visible';
            
            // Add Debug Token button
            const tokenBtn = document.createElement('button');
            tokenBtn.textContent = 'Show Token';
            tokenBtn.style.position = 'fixed';
            tokenBtn.style.bottom = '10px';
            tokenBtn.style.right = '10px';
            tokenBtn.style.zIndex = '9999';
            tokenBtn.onclick = function() {
                try {
                    // Basic token parsing
                    const parts = token.split('.');
                    if (parts.length !== 3) {
                        alert('Invalid token format');
                        return;
                    }
                    
                    // Display token info
                    const base64Url = parts[1];
                    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                    }).join(''));
                    
                    const payload = JSON.parse(jsonPayload);
                    
                    // Create and show info panel
                    const infoDiv = document.createElement('div');
                    infoDiv.style.position = 'fixed';
                    infoDiv.style.top = '50%';
                    infoDiv.style.left = '50%';
                    infoDiv.style.transform = 'translate(-50%, -50%)';
                    infoDiv.style.backgroundColor = '#fff';
                    infoDiv.style.border = '1px solid #000';
                    infoDiv.style.padding = '20px';
                    infoDiv.style.zIndex = '10000';
                    infoDiv.style.maxWidth = '80%';
                    infoDiv.style.maxHeight = '80%';
                    infoDiv.style.overflow = 'auto';
                    
                    // Add role info
                    let roleInfo = '<h3>Token Info:</h3>';
                    
                    // Check common role locations
                    if (payload.role) {
                        roleInfo += `<p><strong>Role (direct):</strong> ${payload.role}</p>`;
                    }
                    if (payload.user && payload.user.role) {
                        roleInfo += `<p><strong>Role (in user):</strong> ${payload.user.role}</p>`;
                    }
                    
                    // Add full payload
                    roleInfo += '<h4>Full Payload:</h4>';
                    roleInfo += `<pre>${JSON.stringify(payload, null, 2)}</pre>`;
                    
                    // Add close button
                    roleInfo += '<button onclick="this.parentNode.remove()">Close</button>';
                    
                    infoDiv.innerHTML = roleInfo;
                    document.body.appendChild(infoDiv);
                } catch (e) {
                    alert('Error parsing token: ' + e.message);
                }
            };
            document.body.appendChild(tokenBtn);
        });
        
        // STEP 2: Once we confirm the above works, uncomment this block to add admin-only check
        /*
        try {
            // Parse JWT (basic method)
            const parts = token.split('.');
            const base64 = parts[1];
            const payload = JSON.parse(atob(base64));
            
            // Get role (check common locations)
            let role = payload.role;
            if (!role && payload.user) {
                role = payload.user.role;
            }
            
            // Check if admin
            if (role !== 'admin') {
                console.log("USER ROLE:", role, "- Not admin, redirecting");
                window.location.replace('/');
                return;
            }
            
            console.log("ADMIN ACCESS CONFIRMED");
        } catch (e) {
            console.error("ERROR PARSING TOKEN:", e);
            // If error parsing, still show content
            window.addEventListener('DOMContentLoaded', function() {
                document.body.style.visibility = 'visible';
                
                // Add error message
                const errorDiv = document.createElement('div');
                errorDiv.style.backgroundColor = 'red';
                errorDiv.style.color = 'white';
                errorDiv.style.padding = '5px';
                errorDiv.innerHTML = 'Error checking admin status: ' + e.message;
                document.body.prepend(errorDiv);
            });
        }
        */
    }
})(); 