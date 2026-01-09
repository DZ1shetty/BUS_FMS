// Firebase Configuration
// This file fetches configuration from the backend to keep keys secure

let firebaseConfig = {};
const CACHE_KEY = 'firebase_config_cache';

async function loadConfig() {
  if (typeof window === 'undefined') return;

  // Try cache first
  const cached = localStorage.getItem(CACHE_KEY);
  if (cached) {
    try {
      firebaseConfig = JSON.parse(cached);
      // Fetch in background to update cache for next time
      fetchConfig().catch(console.error);
      return;
    } catch (e) {
      console.warn("Invalid cached config, clearing...");
      localStorage.removeItem(CACHE_KEY);
    }
  }

  // If no cache, fetch and wait
  await fetchConfig();
}

async function fetchConfig() {
  try {
    const response = await fetch('/api/config/firebase');
    if (response.ok) {
      const config = await response.json();
      // Only update and cache if we got a valid config
      if (config && config.apiKey) {
          firebaseConfig = config;
          localStorage.setItem(CACHE_KEY, JSON.stringify(config));
      }
    } else {
      console.error('Failed to fetch Firebase config');
    }
  } catch (error) {
    console.error('Error fetching Firebase config:', error);
  }
}

// Start loading
await loadConfig();

export default firebaseConfig;
