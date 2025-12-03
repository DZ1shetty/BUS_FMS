// Firebase Configuration
// This file fetches configuration from the backend to keep keys secure

let firebaseConfig = {};

try {
  // When running in browser, fetch from API
  if (typeof window !== 'undefined') {
    const response = await fetch('/api/config/firebase');
    if (response.ok) {
      firebaseConfig = await response.json();
    } else {
      console.error('Failed to fetch Firebase config');
    }
  }
} catch (error) {
  console.error('Error loading Firebase config:', error);
}

export default firebaseConfig;
