const API_URL = '/api';

async function signup() {
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  const confirmPasswordInput = document.getElementById('confirm-password');
  
  const username = usernameInput.value;
  const password = passwordInput.value;
  const confirmPassword = confirmPasswordInput.value;

  if (!username || !password || !confirmPassword) {
    showToast('Please fill in all fields', 'error');
    return;
  }

  if (password !== confirmPassword) {
    showToast('Passwords do not match', 'error');
    return;
  }

  showLoading(true);

  try {
    const response = await fetch(`${API_URL}/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password, confirmPassword }),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      showToast('Signup successful! Redirecting to login...', 'success');
      setTimeout(() => {
        window.location.href = '../login/login.html';
      }, 1500);
    } else {
      showToast(data.error || 'Signup failed', 'error');
    }
  } catch (error) {
    console.error('Signup error:', error);
    showToast('An error occurred. Please try again.', 'error');
  } finally {
    showLoading(false);
  }
}

function gotoLogin() {
  window.location.href = '../login/login.html';
}

// Toast and Loader functions
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
