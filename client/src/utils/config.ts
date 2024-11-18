// Get the API URL from environment variable, fallback to window.location.origin
const apiBaseUrl = process.env.REACT_APP_API_URL || `${window.location.protocol}//${window.location.hostname}:8000`;

export const config = {
    apiUrl: apiBaseUrl
}; 