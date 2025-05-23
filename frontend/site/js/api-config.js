/**
 * API Configuration
 * Determines the base URL for API calls based on the current environment
 */

// Determine environment and set base URL
const currentDomain = window.location.hostname;
const currentProtocol = window.location.protocol;
const isHttps = currentProtocol === "https:";
const isZelkovaDomain = currentDomain.includes("zelkova.dev") || currentDomain === "zelkova.dev";
const isIPAccess = currentDomain.includes("34.82.192.6");

// Set API base URL based on access method
let API_BASE_URL;

if (isHttps && isZelkovaDomain) {
    // Accessing via HTTPS domain - use relative URLs
    API_BASE_URL = "";
    console.log("🌐 Using domain access - relative URLs");
} else if (isIPAccess) {
    // Accessing via IP - use absolute URL with port 8000
    API_BASE_URL = "http://34.82.192.6:8000";
    console.log("🔗 Using IP access - absolute URLs to port 8000");
} else {
    // Local development fallback
    API_BASE_URL = "http://localhost:8000";
    console.log("💻 Using local development - localhost URLs");
}

// Comprehensive debugging
console.log(`🔍 API Configuration Debug:
  Current Domain: ${currentDomain}
  Current Protocol: ${currentProtocol}
  Is HTTPS: ${isHttps}
  Is Zelkova Domain: ${isZelkovaDomain}
  Is IP Access: ${isIPAccess}
  Final API_BASE_URL: "${API_BASE_URL}"
  Full URL Example: "${API_BASE_URL}/api/documents"
`); 