import { checkAuthState, signOutUser, getCurrentUser } from '../config/auth.js';

// Check authentication state on page load
checkAuthState((user) => {
  if (!user) {
    // No user is signed in, redirect to login
    const sessionUser = sessionStorage.getItem('user');
    if (!sessionUser) {
      console.log('No authenticated user, redirecting to login...');
      window.location.href = '../login/login.html';
    }
  } else {
    // User is signed in
    console.log('User is authenticated:', user);
    displayUserInfo(user);
  }
});

// Display user information in the UI
function displayUserInfo(user) {
  const userProfileContainer = document.getElementById('user-profile');
  if (userProfileContainer) {
    userProfileContainer.innerHTML = `
      <div class="user-profile">
        <img src="${user.photoURL || 'https://via.placeholder.com/40'}" alt="${user.displayName}" />
        <div class="user-profile-info">
          <h4>${user.displayName || 'User'}</h4>
          <p>${user.email}</p>
        </div>
        <button class="signout-btn" onclick="handleSignOut()">Sign Out</button>
      </div>
    `;
  }
}

// Handle Sign Out
window.handleSignOut = async function() {
  const result = await signOutUser();
  if (result.success) {
    sessionStorage.removeItem('user');
    console.log('User signed out successfully');
    window.location.href = '../login/login.html';
  } else {
    console.error('Sign out failed:', result.error);
    alert('Failed to sign out. Please try again.');
  }
};
