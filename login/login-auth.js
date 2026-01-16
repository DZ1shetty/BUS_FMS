import { signInWithGoogle, checkAuthState } from '../config/auth.js';

// Handle Google Sign-In
window.handleGoogleSignIn = async function() {
  const loaderOverlay = document.querySelector('.loader-overlay');
  loaderOverlay.style.display = 'flex';

  const result = await signInWithGoogle();
  
  loaderOverlay.style.display = 'none';

  if (result.success) {
    const user = result.user;
    console.log('Google Sign-In successful:', user);
    
    // Store user info in sessionStorage
    sessionStorage.setItem('user', JSON.stringify({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      provider: 'google'
    }));

    // Get and store the ID token for API calls
    const token = await user.getIdToken();
    localStorage.setItem('token', token);

    // Also keep a simple username in localStorage as a friendly fallback for non-Firebase pages
    try {
      if (user.displayName) localStorage.setItem('username', user.displayName);
      else if (user.email) localStorage.setItem('username', user.email);
    } catch (e) { console.warn('Could not set local username', e); } 

    // Show success toast
    showToast('Login successful! Redirecting...', 'success');
    
    // Redirect to homepage
    setTimeout(() => {
      window.location.href = '../homepage/index.html';
    }, 1500);
  } else {
    let errorMessage = result.error;
    if (errorMessage.includes("auth/unauthorized-domain")) {
      errorMessage = "Domain not authorized. Add this domain to Firebase Console > Auth > Settings.";
    }
    showToast('Google Sign-In failed: ' + errorMessage, 'error');
  }
};

// Check if user is already logged in
checkAuthState((user) => {
  if (user) {
    console.log('User is already logged in:', user);
    // Optionally redirect to homepage if already logged in
    // window.location.href = '../homepage/homepage.html';
  }
});

// Toast notification function
function showToast(message, type = 'info') {
  const toastContainer = document.querySelector('.toast-container');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  
  toastContainer.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add('show');
  }, 100);
  
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
