import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged 
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import firebaseConfig from './firebase-config.js';

// Initialize Firebase
let app;
let auth;
const googleProvider = new GoogleAuthProvider();

try {
  if (firebaseConfig && firebaseConfig.apiKey) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
  } else {
    console.error("Firebase configuration is missing or invalid. Check your environment variables.");
  }
} catch (error) {
  console.error("Error initializing Firebase Auth:", error);
}

// Google Sign-In
export async function signInWithGoogle() {
  if (!auth) {
    console.error("Firebase Auth not initialized");
    return { success: false, error: "Configuration Error: Firebase not initialized." };
  }

  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    console.log('User signed in:', user);
    return { success: true, user };
  } catch (error) {
    console.error('Error signing in with Google:', error);
    return { success: false, error: error.message };
  }
}

// Sign Out
export async function signOutUser() {
  if (!auth) return { success: false, error: "Auth not initialized" };
  try {
    await signOut(auth);
    console.log('User signed out');
    return { success: true };
  } catch (error) {
    console.error('Error signing out:', error);
    return { success: false, error: error.message };
  }
}

// Check Auth State
export function checkAuthState(callback) {
  if (!auth) return;
  return onAuthStateChanged(auth, callback);
}

// Get Current User
export function getCurrentUser() {
  if (!auth) return null;
  return auth.currentUser;
}

export { auth };
