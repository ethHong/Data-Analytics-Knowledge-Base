/**
 * markdown-viewer.js - Handles loading and rendering markdown content
 * This script fetches markdown content from the server and renders it as HTML
 */

document.addEventListener('DOMContentLoaded', function() {
    // Parse URL parameters to get the markdown file path
    const urlParams = new URLSearchParams(window.location.search);
    const markdownPath = urlParams.get('path');
    
    if (markdownPath) {
        loadMarkdownContent(markdownPath);
    } else {
        document.getElementById('markdown-content').innerHTML = '<div class="alert alert-danger">No markdown file specified. Please use ?path=your/file/path.md in the URL.</div>';
    }
});

/**
 * Loads markdown content from the server
 * @param {string} path - Path to the markdown file
 */
function loadMarkdownContent(path) {
    const contentElement = document.getElementById('markdown-content');
    
    // Display loading spinner
    contentElement.innerHTML = `
        <div class="text-center">
            <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>
    `;
    
    // Fetch the markdown content
    fetchMarkdownContent(path)
        .then(markdown => {
            if (markdown) {
                // Convert markdown to HTML and display it
                const html = convertMarkdownToHtml(markdown);
                contentElement.innerHTML = html;
                
                // Apply syntax highlighting to code blocks
                if (window.hljs) {
                    document.querySelectorAll('pre code').forEach((block) => {
                        hljs.highlightBlock(block);
                    });
                }
                
                // Update page title based on first heading
                const firstHeading = contentElement.querySelector('h1, h2, h3');
                if (firstHeading) {
                    document.title = firstHeading.textContent + ' - Data Analytics Knowledge Base';
                }
            }
        })
        .catch(error => {
            contentElement.innerHTML = `<div class="alert alert-danger">${error.message}</div>`;
        });
}

/**
 * Fetches markdown content from the server with authentication
 * @param {string} path - Path to the markdown file
 * @returns {Promise<string>} - Markdown content
 */
async function fetchMarkdownContent(path) {
    // Check if the user is authenticated
    const token = localStorage.getItem('token');
    
    // Calculate base URL for proper redirects
    const BASE_URL = window.location.pathname.includes('/admin/') ? '../' : '';
    
    if (!token) {
        // Redirect to login if not authenticated
        window.location.replace(`${BASE_URL}auth/login.html?redirect=${encodeURIComponent(window.location.href)}`);
        return null;
    }
    
    try {
        const response = await fetch(`/api/markdown?path=${encodeURIComponent(path)}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.status === 401) {
            // Token expired or invalid, redirect to login
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            localStorage.removeItem('user_id');
            window.location.replace(`${BASE_URL}auth/login.html?redirect=${encodeURIComponent(window.location.href)}`);
            return null;
        }
        
        if (response.status === 403) {
            // User doesn't have permission
            throw new Error('You do not have permission to view this document.');
        }
        
        if (response.status === 404) {
            throw new Error('Markdown file not found.');
        }
        
        if (!response.ok) {
            throw new Error('Failed to load markdown content.');
        }
        
        return await response.text();
    } catch (error) {
        console.error('Error fetching markdown:', error);
        throw error;
    }
}

/**
 * Converts markdown text to HTML
 * @param {string} markdown - Markdown text
 * @returns {string} - HTML content
 */
function convertMarkdownToHtml(markdown) {
    if (!markdown) return '';
    
    let html = markdown;
    
    // Convert code blocks (```code```)
    html = html.replace(/```([a-z]*)\n([\s\S]*?)\n```/g, function(match, language, code) {
        const langClass = language ? ` class="language-${language}"` : '';
        return `<pre><code${langClass}>${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`;
    });
    
    // Convert inline code (`code`)
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // Convert headers
    html = html.replace(/^# (.*$)/gm, '<h1>$1</h1>');
    html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>');
    html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>');
    html = html.replace(/^#### (.*$)/gm, '<h4>$1</h4>');
    html = html.replace(/^##### (.*$)/gm, '<h5>$1</h5>');
    
    // Convert bold and italic
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    html = html.replace(/_([^_]+)_/g, '<em>$1</em>');
    
    // Convert links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
    
    // Convert unordered lists
    html = html.replace(/^\s*[-*+]\s+(.*)/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
    
    // Convert ordered lists
    html = html.replace(/^\s*\d+\.\s+(.*)/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/s, '<ol>$1</ol>');
    
    // Convert paragraphs (lines that are not headers, code, or lists)
    html = html.replace(/^(?!<h|<ul|<ol|<pre|<li)(.+)$/gm, '<p>$1</p>');
    
    // Fix empty lines between paragraphs
    html = html.replace(/<\/p>\n<p>/g, '</p><p>');
    
    return html;
} 