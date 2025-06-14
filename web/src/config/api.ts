// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT as string) || 10000;

// Create axios instance with default configuration
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Export configuration for use in components
export const config = {
  API_BASE_URL,
  API_TIMEOUT,
  // Add more config values as needed
};

console.log('🔧 API Configuration:', config);
