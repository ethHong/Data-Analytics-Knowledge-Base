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

        window.addEventListener("message", (event) => {
            if (event.data.type === "openPanel") {
                openDocumentPanel(event.data.docId);
            }
        });

        const graphPanel = document.getElementById("graph-panel"); // ✅ Define graph panel

        function openDocumentPanel(docId) {
            console.log("Opening document panel for:", docId);

            if (!docId) {
                console.error("Invalid document ID");
                return;
            }

            const encodedDocId = encodeURIComponent(docId.trim());
            const docUrl = `/markdowns/${encodedDocId}/`;

            console.log("Fetching document from:", docUrl);

            fetch(docUrl)
                .then(response => {
                    if (!response.ok) throw new Error("Failed to fetch document");
                    return response.text();
                })
                .then(htmlText => {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(htmlText, "text/html");

                    // 🎯 Extract ONLY the document content, REMOVE Table of Contents & Sidebar
                    const mainContent = doc.querySelector("main");
                    if (mainContent) {
                        mainContent.querySelectorAll("nav, aside, .toc, .md-nav, .md-sidebar").forEach(el => el.remove());
                        mainContent.style.width = "100%";
                        mainContent.style.maxWidth = "none";

                        contentContainer.innerHTML = mainContent.innerHTML;
                        
                        // ✅ Adjust only internal links to match MkDocs structure
                        contentContainer.querySelectorAll("a").forEach(link => {
                            let originalHref = link.getAttribute("href");

                            // ✅ Skip external links and anchor links
                            if (!originalHref || originalHref.startsWith("http") || originalHref.startsWith("#")) {
                                return;
                            }

                            console.log("Fixing internal link:", originalHref);

                            // ✅ Decode to prevent double encoding
                            originalHref = decodeURIComponent(originalHref.trim());

                            // ✅ Remove leading "../" or "./" to prevent incorrect paths
                            originalHref = originalHref.replace(/^(\.\.\/|\.\/)+/, "");

                            // ✅ Ensure correct MkDocs URL format
                            const correctedHref = `/markdowns/${encodeURIComponent(originalHref)}/`;

                            link.setAttribute("href", correctedHref);

                            // ✅ Ensure clicking opens inside the document panel instead of navigating
                            link.addEventListener("click", (event) => {
                                event.preventDefault(); // Stop full-page navigation
                                openDocumentPanel(originalHref, true);  // ✅ Open inside panel
                            });
                        });



                    } else {
                        contentContainer.innerHTML = "<p>Failed to load document content.</p>";
                    }

                    // ✅ Apply visibility and initial transform
                    panel.style.display = "flex";
                    panel.style.visibility = "visible";
                    panel.style.transform = "translateX(100%)";  // Off-screen state

                    if (graphPanel) {
                        graphPanel.style.display = "flex"; // ✅ Show graph panel
                        graphPanel.style.visibility = "visible";
                        graphPanel.style.transform = "translateX(-100%)"; // ✅ Move off-screen first

                        setTimeout(() => {
                            graphPanel.style.transition = "transform 0.15s ease-in-out";
                            graphPanel.style.transform = "translateX(0)"; // ✅ Slide into view
                        }, 50);
                    }

        
                    // ✅ Trigger transition after a slight delay to allow the browser to "see" the change
                    setTimeout(() => {
                        panel.style.transition = "transform 0.15s ease-in-out";  // Ensure the transition is applied
                        panel.style.transform = "translateX(0)";  // Move panel into view
                    }, 50);  // A small delay (milliseconds)

                    document.body.classList.add("panel-open");

                    // ✅ Re-render Math expressions if MathJax exists
                    if (window.MathJax) {
                        MathJax.typesetPromise().catch(err => console.error("MathJax rendering error:", err));
                    }
                })
                .catch(error => {
                    console.error("Error loading document:", error);
                    contentContainer.innerHTML = "<p>Failed to load document.</p>";
                });
        }

                // 🔹 Handle closing the panel with sliding effect
                closeButton.addEventListener("click", () => {
                    console.log("Closing panel...");

                    // Start sliding animation
                    
                    panel.style.transform = "translateX(100%)";
                    if (graphPanel) {
                        graphPanel.style.transform = "translateX(-100%)"; // ✅ Slide graph panel out
                        setTimeout(() => {
                            graphPanel.style.visibility = "hidden";
                            graphPanel.style.display = "none";
                        }, 300); // ✅ Hide after transition
                    }

                    // Wait for transition to complete, then hide panel
                    setTimeout(() => {
                        
                        panel.style.visibility = "hidden";
                        panel.style.display = "none";
                        document.body.classList.remove("panel-open");
                    }, 300); // Match the transition duration
                });

                // ✅ Hover Effect for Close Button
                closeButton.addEventListener("mouseover", () => {
                    closeButton.style.transform = "scale(1.2)";
                    closeButton.style.background = "rgba(0, 0, 0, 0.9)";
                });
                closeButton.addEventListener("mouseout", () => {
                    closeButton.style.transform = "scale(1)";
                    closeButton.style.background = "rgba(0, 0, 0, 0.7)";
                });
            }, 100); // ✅ Delay execution slightly
        });
</script>

<!-- ✅ Load MathJax for rendering mathematical expressions -->
<script type="text/javascript" async
  src="https://polyfill.io/v3/polyfill.min.js?features=es6"></script>
<script type="text/javascript" async
  id="MathJax-script" src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>

## Explore, search knowledges based on their relationship.