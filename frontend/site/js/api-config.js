/**
 * API Configuration for Zelkova
 * This file provides a centralized configuration for API endpoints.
 */

// Determine the API base URL based on the current hostname
const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:8000'
  : window.location.hostname === '34.82.192.6' || window.location.hostname.includes('34.82.192.6')
    ? 'http://34.82.192.6:8000' 
    : `${window.location.protocol}//${window.location.hostname}:8000`;

// Helper function to get authentication headers
function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

// Helper function for making authenticated API calls
async function fetchWithAuth(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers
  });
  
  return response;
} 