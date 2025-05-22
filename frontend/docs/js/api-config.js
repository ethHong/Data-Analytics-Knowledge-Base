/**
 * API Configuration
 * Determines the base URL for API calls based on the current environment
 */

// Determine environment and set base URL
const isProd = location.protocol === "https:" && location.hostname.includes("zelkova.dev");
const isStaging = location.hostname.includes("34.82.192.6");
const API_BASE_URL = isProd 
              ? "https://34.82.192.6:8000" // HTTPS FastAPI server for domain access
              : isStaging 
                ? "http://34.82.192.6:8000" // HTTP FastAPI server for IP access
                : "http://localhost:8000";  // Local development FastAPI

// For debugging
console.log(`API Base URL: ${API_BASE_URL}, Environment: ${isProd ? 'Production' : isStaging ? 'Staging' : 'Development'}`);
console.log(`Current location: ${location.protocol}//${location.hostname}:${location.port}`); 