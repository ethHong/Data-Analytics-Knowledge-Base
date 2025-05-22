// MathJax Configuration
window.MathJax = {
  tex: {
    inlineMath: [['$', '$'], ['\\(', '\\)']],
    displayMath: [['$$', '$$'], ['\\[', '\\]']],
    processEscapes: true,
    processEnvironments: true
  },
  options: {
    ignoreHtmlClass: 'no-mathjax',
    processHtmlClass: 'mathjax',
    renderActions: {
      find: [10, function (doc) {
        for (const node of document.querySelectorAll('math, .math')) {
          const display = node.nodeName !== 'MATH' || 
                          node.getAttribute('display') === 'block';
          node.setAttribute('display', display ? 'block' : 'inline');
          node.innerHTML = node.innerHTML;
        }
      }, {}]
    }
  },
  startup: {
    pageReady: function() {
      // Force typesetting when page is ready
      return MathJax.startup.defaultPageReady().then(function() {
        console.log('MathJax is ready!');
        // Process math again just to be sure
        MathJax.typesetPromise();
      });
    }
  }
};

// Track when document content changes (for dynamic loading)
document.addEventListener('DOMContentLoaded', function() {
  // Try to process math as soon as possible
  if (typeof MathJax !== 'undefined') {
    MathJax.typesetPromise().catch(err => console.error('MathJax initial error:', err));
  }
  
  // Also set up a mutation observer to watch for content changes
  const observer = new MutationObserver(function(mutations) {
    // Check if any mutations affect our content
    for (const mutation of mutations) {
      if (mutation.type === 'childList' && 
          (mutation.target.id === 'document-content' || 
           mutation.target.className === 'md-content')) {
        // Process math when content changes
        if (typeof MathJax !== 'undefined') {
          setTimeout(function() {
            MathJax.typesetPromise().catch(err => console.error('MathJax observer error:', err));
          }, 100);
        }
        break;
      }
    }
  });
  
  // Start observing the document with configured parameters
  observer.observe(document.body, { 
    childList: true, 
    subtree: true 
  });
}); 