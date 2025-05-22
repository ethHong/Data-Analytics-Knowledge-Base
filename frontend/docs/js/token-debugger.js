// JWT Token Debugger
(function() {
    function showTokenDebugger() {
        // Create a debug panel
        const debugPanel = document.createElement('div');
        debugPanel.id = 'jwt-token-debugger';
        debugPanel.style.position = 'fixed';
        debugPanel.style.top = '10px';
        debugPanel.style.right = '10px';
        debugPanel.style.padding = '20px';
        debugPanel.style.background = 'rgba(0,0,0,0.8)';
        debugPanel.style.color = 'white';
        debugPanel.style.zIndex = '9999';
        debugPanel.style.maxWidth = '500px';
        debugPanel.style.maxHeight = '80vh';
        debugPanel.style.overflow = 'auto';
        debugPanel.style.borderRadius = '5px';
        debugPanel.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';
        
        // Add title
        const title = document.createElement('h3');
        title.textContent = 'JWT Token Debugger';
        debugPanel.appendChild(title);
        
        const token = localStorage.getItem('token');
        
        if (!token) {
            const noTokenMsg = document.createElement('p');
            noTokenMsg.textContent = 'No token found in localStorage';
            noTokenMsg.style.color = 'yellow';
            debugPanel.appendChild(noTokenMsg);
        } else {
            try {
                // Parse JWT payload
                const parts = token.split('.');
                
                if (parts.length !== 3) {
                    const invalidTokenMsg = document.createElement('p');
                    invalidTokenMsg.textContent = 'Invalid token format (not a JWT)';
                    invalidTokenMsg.style.color = 'red';
                    debugPanel.appendChild(invalidTokenMsg);
                } else {
                    // Header
                    const headerBase64 = parts[0];
                    const header = JSON.parse(atob(headerBase64));
                    
                    const headerTitle = document.createElement('h4');
                    headerTitle.textContent = 'Token Header:';
                    debugPanel.appendChild(headerTitle);
                    
                    const headerCode = document.createElement('pre');
                    headerCode.textContent = JSON.stringify(header, null, 2);
                    debugPanel.appendChild(headerCode);
                    
                    // Payload
                    const payloadBase64 = parts[1];
                    const base64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
                    
                    // Add padding if needed
                    let padding = '';
                    if (base64.length % 4 !== 0) {
                        padding = '='.repeat(4 - (base64.length % 4));
                    }
                    
                    const payload = JSON.parse(atob(base64 + padding));
                    
                    // Expiration info
                    const expiry = payload.exp * 1000; // Convert to milliseconds
                    const now = Date.now();
                    const isExpired = now >= expiry;
                    
                    const expiryInfo = document.createElement('p');
                    expiryInfo.innerHTML = `<strong>Expires:</strong> ${new Date(expiry).toLocaleString()}`;
                    if (isExpired) {
                        expiryInfo.style.color = 'red';
                        expiryInfo.innerHTML += ' <strong>(EXPIRED)</strong>';
                    } else {
                        const remainingTime = Math.floor((expiry - now) / 1000 / 60);
                        expiryInfo.innerHTML += ` (${remainingTime} minutes remaining)`;
                    }
                    debugPanel.appendChild(expiryInfo);
                    
                    // Subject info
                    if (payload.sub) {
                        const subjectInfo = document.createElement('p');
                        subjectInfo.innerHTML = `<strong>Subject:</strong> ${payload.sub}`;
                        debugPanel.appendChild(subjectInfo);
                    }
                    
                    // Extract & show email
                    const email = payload.sub || payload.email || (payload.user && payload.user.email);
                    if (email) {
                        const emailInfo = document.createElement('p');
                        emailInfo.innerHTML = `<strong>Email:</strong> ${email}`;
                        debugPanel.appendChild(emailInfo);
                    }
                    
                    // Role info - check various places
                    const roleInfo = document.createElement('div');
                    roleInfo.style.marginBottom = '10px';
                    roleInfo.innerHTML = '<strong>Role Checks:</strong>';
                    
                    const roleChecks = document.createElement('ul');
                    roleChecks.style.margin = '5px 0';
                    roleChecks.style.paddingLeft = '20px';
                    
                    const roleCheckPayload = document.createElement('li');
                    roleCheckPayload.textContent = `payload.role: ${payload.role || 'not found'}`;
                    if (payload.role === 'admin') roleCheckPayload.style.color = 'lightgreen';
                    roleChecks.appendChild(roleCheckPayload);
                    
                    const roleCheckUser = document.createElement('li');
                    roleCheckUser.textContent = `payload.user.role: ${payload.user && payload.user.role ? payload.user.role : 'not found'}`;
                    if (payload.user && payload.user.role === 'admin') roleCheckUser.style.color = 'lightgreen';
                    roleChecks.appendChild(roleCheckUser);
                    
                    roleInfo.appendChild(roleChecks);
                    debugPanel.appendChild(roleInfo);
                    
                    // Add full payload
                    const payloadTitle = document.createElement('h4');
                    payloadTitle.textContent = 'Full Payload:';
                    debugPanel.appendChild(payloadTitle);
                    
                    const payloadCode = document.createElement('pre');
                    payloadCode.textContent = JSON.stringify(payload, null, 2);
                    debugPanel.appendChild(payloadCode);
                }
            } catch (e) {
                const errorMsg = document.createElement('p');
                errorMsg.textContent = `Error parsing token: ${e.message}`;
                errorMsg.style.color = 'red';
                debugPanel.appendChild(errorMsg);
            }
        }
        
        // Add close button
        const btnContainer = document.createElement('div');
        btnContainer.style.marginTop = '10px';
        
        const closeBtn = document.createElement('button');
        closeBtn.textContent = 'Close';
        closeBtn.style.marginRight = '10px';
        closeBtn.onclick = function() { debugPanel.remove(); };
        btnContainer.appendChild(closeBtn);
        
        const refreshBtn = document.createElement('button');
        refreshBtn.textContent = 'Refresh';
        refreshBtn.onclick = function() { 
            debugPanel.remove();
            showTokenDebugger();
        };
        btnContainer.appendChild(refreshBtn);
        
        debugPanel.appendChild(btnContainer);
        
        document.body.appendChild(debugPanel);
    }
    
    // Wait for DOMContentLoaded to add button
    window.addEventListener('DOMContentLoaded', function() {
        // Add a small button to show the debugger
        const debugBtn = document.createElement('button');
        debugBtn.textContent = 'Debug Token';
        debugBtn.style.position = 'fixed';
        debugBtn.style.bottom = '10px';
        debugBtn.style.right = '10px';
        debugBtn.style.zIndex = '9998';
        debugBtn.style.backgroundColor = '#333';
        debugBtn.style.color = 'white';
        debugBtn.style.border = 'none';
        debugBtn.style.borderRadius = '4px';
        debugBtn.style.padding = '5px 10px';
        debugBtn.style.cursor = 'pointer';
        debugBtn.onclick = showTokenDebugger;
        
        document.body.appendChild(debugBtn);
    });
})(); 