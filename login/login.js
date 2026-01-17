const API_URL = '/api';

async function login() {
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  const username = usernameInput.value;
  const password = passwordInput.value;

  if (!username || !password) {
    showToast('Please enter both username and password', 'error');
    return;
  }

  showLoading(true);

  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      // Store authentication in multiple places for maximum browser compatibility
      try {
        // Primary storage
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('auth_username', username);
        localStorage.setItem('auth_email', data.email || ''); // Store email
        localStorage.setItem('auth_provider', 'traditional');

        // Session backup
        sessionStorage.setItem('auth_token', data.token);
        sessionStorage.setItem('auth_username', username);
        sessionStorage.setItem('auth_email', data.email || '');

        // Legacy keys for backward compatibility
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', username);

        console.log('✅ Login successful, credentials stored in localStorage and sessionStorage');
      } catch (storageError) {
        console.error('❌ Storage error:', storageError);
        showToast('Failed to store login data. Please enable cookies and local storage.', 'error');
        return;
      }

      showToast('Login successful! Redirecting...', 'success');
      setTimeout(() => {
        window.location.href = '../homepage/index.html';
      }, 1500);
    } else {
      showToast(data.error || 'Invalid credentials', 'error');
    }
  } catch (error) {
    console.error('Login error:', error);
    showToast('An error occurred. Please try again.', 'error');
  } finally {
    showLoading(false);
  }
}

function gotoSignup() {
  window.location.href = '../signup/signup.html';
}

// Toast notification function
function showToast(message, type = 'success') {
  const container = document.querySelector('.toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  // Trigger reflow
  toast.offsetHeight;

  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      container.removeChild(toast);
    }, 300);
  }, 3000);
}

function showLoading(show) {
  const loader = document.querySelector('.loader-overlay');
  if (loader) {
    if (show) {
      loader.classList.add('active');
    } else {
      loader.classList.remove('active');
    }
  }
}

// Add event listener for Enter key
document.addEventListener('DOMContentLoaded', () => {
  const passwordField = document.getElementById('password');
  if (passwordField) {
    passwordField.addEventListener('keypress', function (e) {
      if (e.key === 'Enter') {
        login();
      }
    });
  }
});
