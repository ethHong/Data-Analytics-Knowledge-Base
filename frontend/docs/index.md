---
hide:
  - toc
---

# Welcome to the MSBA Knowledge Base


<div style="margin-bottom: 10px;">
    <iframe id="graph-frame" src="graph.html" width="100%" height="400px" frameborder="0"></iframe>
</div>

<!-- ✅ Graph Panel -->
<div id="graph-panel" 
    style="position: fixed; 
           left: 0;
           top: 0; 
           width: 40%;  
           height: 100%;  
           background: white; 
           box-shadow: 5px 0 10px rgba(0, 0, 0, 0.2); 
           transition: left 0.3s ease-in-out;
           display: flex;
           flex-direction: column;
           visibility: hidden;
           z-index: 9999;
           overflow: hidden;">
    <iframe id="graph-frame" src="graph.html" width="100%" height="100%" frameborder="0"></iframe>
</div>

<!-- ✅ Document Panel -->
<div id="document-panel" 
    style="display: none; 
           position: fixed; 
           right: 0; 
           top: 0; 
           width: 60%;  
           height: 100%;  
           background: white; 
           box-shadow: -5px 0 10px rgba(0, 0, 0, 0.2); 
           transition: right 0.3s ease-in-out;
           display: flex;
           flex-direction: column;">
    <!-- ✅ Fixed Close Button with Hover Effect -->
    <button id="close-panel" 
        style="position: fixed; 
               top: 10px; 
               right: 10px; 
               width: 32px;
               height: 32px;
               background: rgba(0, 0, 0, 0.7); 
               color: white;
               border: none; 
               border-radius: 50%;
               font-size: 18px; 
               cursor: pointer; 
               display: flex;
               align-items: center;
               justify-content: center;
               z-index: 1000;
               transition: transform 0.2s ease-in-out, background 0.2s ease-in-out;">
        &times;
    </button>
    <!-- ✅ Scrollable Content -->
    <div id="document-content" 
        style="flex-grow: 1; 
               overflow-y: auto;  
               padding: 20px; 
               margin-top: 40px; 
               width: 100%;
               max-width: none;">  
        Select a document to view.
    </div>
</div>

<script>
document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {  // ✅ Ensure DOM is Ready
        const panel = document.getElementById("document-panel");
        const contentContainer = document.getElementById("document-content");
        const closeButton = document.getElementById("close-panel");

        if (!panel || !contentContainer) {
            console.error("Panel or content container not found!");
            return;
        }

        // Document history management
        let documentHistory = [];
        let currentHistoryIndex = -1;

        // Handle browser back/forward
        window.addEventListener('popstate', (event) => {
            if (event.state && event.state.docId) {
                openDocumentPanel(event.state.docId, false);
            } else {
                closeDocumentPanel();
            }
        });

        window.addEventListener("message", (event) => {
            if (event.data.type === "openPanel") {
                openDocumentPanel(event.data.docId);
            }
        });

        const graphPanel = document.getElementById("graph-panel"); // ✅ Define graph panel

        async function openDocumentPanel(docId, pushState = true) {
            // Check if user is authenticated
            const token = localStorage.getItem('token');
            if (!token) {
                // Store the docId for after login
                sessionStorage.setItem('redirectAfterLogin', `/index.html?doc=${encodeURIComponent(docId)}`);
                // Redirect to login page
                window.location.href = '/auth/login.html';
                return;
            }

            // If authenticated, proceed with loading the document
            const docUrl = `/markdowns/${encodeURIComponent(docId)}/`;
            
            try {
                const response = await fetch(docUrl);
                const html = await response.text();

                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const mainContent = doc.querySelector('article');

                if (mainContent) {
                    mainContent.querySelectorAll("nav, aside, .toc, .md-nav, .md-sidebar").forEach(el => el.remove());
                    mainContent.style.width = "100%";
                    mainContent.style.maxWidth = "none";

                    contentContainer.innerHTML = mainContent.innerHTML;
                    
                    // Handle internal links
                    contentContainer.querySelectorAll("a").forEach(link => {
                        let originalHref = link.getAttribute("href");
                        if (!originalHref || originalHref.startsWith("http") || originalHref.startsWith("#")) {
                            return;
                        }
                        
                        originalHref = decodeURIComponent(originalHref.trim());
                        originalHref = originalHref.replace(/^(\.\.\/|\.\/)+/, "");
                        const correctedHref = `/markdowns/${encodeURIComponent(originalHref)}/`;
                        
                        link.setAttribute("href", correctedHref);
                        link.addEventListener("click", (event) => {
                            event.preventDefault();
                            openDocumentPanel(originalHref, true);
                        });
                    });

                    if (pushState) {
                        const url = new URL(window.location);
                        url.searchParams.set('doc', docId);
                        window.history.pushState({ docId }, '', url);
                    }

                    showPanelsWithAnimation();

                    // Re-render Math expressions if MathJax exists
                    if (window.MathJax) {
                        MathJax.typesetPromise().catch(err => console.error("MathJax rendering error:", err));
                    }
                } else {
                    contentContainer.innerHTML = "<p>Failed to load document content.</p>";
                }
            } catch (error) {
                console.error("Error loading document:", error);
                contentContainer.innerHTML = "<p>Failed to load document.</p>";
            }
        }

        function showPanelsWithAnimation() {
            // Show panels with animation
            panel.style.display = "flex";
            panel.style.visibility = "visible";
            panel.style.transform = "translateX(100%)";

            if (graphPanel) {
                graphPanel.style.display = "flex";
                graphPanel.style.visibility = "visible";
                graphPanel.style.transform = "translateX(-100%)";

                setTimeout(() => {
                    graphPanel.style.transition = "transform 0.15s ease-in-out";
                    graphPanel.style.transform = "translateX(0)";
                }, 50);
            }

            setTimeout(() => {
                panel.style.transition = "transform 0.15s ease-in-out";
                panel.style.transform = "translateX(0)";
            }, 50);

            document.body.classList.add("panel-open");
        }

        function closeDocumentPanel() {
            console.log("Closing panel...");

            // Start sliding animation
            panel.style.transform = "translateX(100%)";
            if (graphPanel) {
                graphPanel.style.transform = "translateX(-100%)";
                setTimeout(() => {
                    graphPanel.style.visibility = "hidden";
                    graphPanel.style.display = "none";
                }, 300);
            }

            // Wait for transition to complete, then hide panel
            setTimeout(() => {
                panel.style.visibility = "hidden";
                panel.style.display = "none";
                document.body.classList.remove("panel-open");
                
                // Update URL to remove document parameter
                const url = new URL(window.location);
                url.searchParams.delete('doc');
                window.history.replaceState(null, '', url);
            }, 300);
        }

        // Handle closing the panel with sliding effect
        closeButton.addEventListener("click", () => {
            closeDocumentPanel();
        });

        // Hover Effect for Close Button
        closeButton.addEventListener("mouseover", () => {
            closeButton.style.transform = "scale(1.2)";
            closeButton.style.background = "rgba(0, 0, 0, 0.9)";
        });
        closeButton.addEventListener("mouseout", () => {
            closeButton.style.transform = "scale(1)";
            closeButton.style.background = "rgba(0, 0, 0, 0.7)";
        });

        // Check for initial document in URL
        const urlParams = new URLSearchParams(window.location.search);
        const initialDoc = urlParams.get('doc');
        if (initialDoc) {
            openDocumentPanel(initialDoc, false);
        }
    }, 100);
});
</script>

<!-- ✅ Load MathJax for rendering mathematical expressions -->
<script type="text/javascript" async
  src="https://polyfill.io/v3/polyfill.min.js?features=es6"></script>
<script type="text/javascript" async
  id="MathJax-script" src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>

## Network based Wiki for Business Analytics, and Data professionals