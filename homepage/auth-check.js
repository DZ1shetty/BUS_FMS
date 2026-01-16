import { checkAuthState, signOutUser, getCurrentUser } from '../config/auth.js';

// Optimistic UI: Render immediately if data exists in session
const cachedUser = sessionStorage.getItem('user');
if (cachedUser) {
  try {
    const user = JSON.parse(cachedUser);
    displayUserInfo(user);
  } catch (e) {
    console.warn('Session user parse failed', e);
  }
}

// Function to refresh and store token
async function refreshToken(user) {
  if (!user) return;
  try {
    const token = await user.getIdToken(true); // force refresh
    localStorage.setItem('token', token);
    console.log('Firebase token refreshed for API authentication');
    return token;
  } catch (err) {
    console.error('Failed to refresh Firebase token:', err);
    return null;
  }
}

// Subscribe to auth state changes (Verify with Firebase)
checkAuthState(async (user) => {
  if (!user) {
    // Not logged in
    console.log('No authenticated user found.');
    sessionStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = '../login/login.html';
  } else {
    // User verified - get Firebase ID token for API calls
    await refreshToken(user);

    // User data for UI
    const userData = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      provider: 'google'
    };
    // Update cache
    sessionStorage.setItem('user', JSON.stringify(userData));
    // Update UI
    displayUserInfo(userData);

    // Refresh token every 50 minutes (Firebase tokens last 60 minutes)
    setInterval(() => {
      refreshToken(user);
    }, 50 * 60 * 1000);
  }
});

// Display user information in the UI
function displayUserInfo(user) {
  const userProfileContainer = document.getElementById('user-profile');
  if (!userProfileContainer) return;

  const name = user.displayName || user.email.split('@')[0] || 'User';
  const photo = user.photoURL || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(name) + '&background=random';

  // Updated Profile Layout
  userProfileContainer.innerHTML = `
      <div class="user-info">
        <span id="logged-in-as">${name}</span>
        <span class="user-role">Admin</span>
      </div>
      <div class="profile-icon">
        <img src="${photo}" alt="${name}">
      </div>
  `;
}

// Handle Sign Out
window.handleSignOut = async function() {
  const result = await signOutUser();
  if (result.success) {
    sessionStorage.removeItem('user');
    localStorage.removeItem('token');
    try { localStorage.removeItem('username'); } catch(e) {}
    console.log('User signed out successfully');
    window.location.href = '../login/login.html';
  } else {
    console.error('Sign out failed:', result.error);
    alert('Failed to sign out. Please try again.');
  }
};
