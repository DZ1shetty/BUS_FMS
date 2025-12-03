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
      localStorage.setItem('username', username);
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

// Toast and Loader functions (copied/adapted for standalone usage if needed, 
// but ideally we should import them or have them in a shared file. 
// For now, I'll implement them here to ensure they work without module complexity)

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
    document.getElementById('password').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            login();
        }
    });
});

