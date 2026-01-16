// Firebase Configuration
// This file fetches configuration from the backend to keep keys secure

let firebaseConfig = {};

try {
  // When running in browser, fetch from API
  if (typeof window !== 'undefined') {
    const response = await fetch('/api/config/firebase');
    if (response.ok) {
      const text = await response.text();
      try {
        firebaseConfig = JSON.parse(text);
        console.log('Firebase Config Loaded:', firebaseConfig); // Debugging
        if (!firebaseConfig.apiKey) {
          console.error('CRITICAL: Firebase apiKey is missing in the response from the server.');
        }
      } catch (e) {
        console.error('Expected JSON, got HTML/Text:', text.substring(0, 100) + '...');
        console.warn('This usually means the server backend crashed or returned an error page.');
      }
    } else {
      console.error('Failed to fetch Firebase config. Status:', response.status);
    }
  }
} catch (error) {
  console.error('Error loading Firebase config:', error);
}

export default firebaseConfig;
