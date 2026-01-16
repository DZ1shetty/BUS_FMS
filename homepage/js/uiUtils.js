/**
 * UI Utilities for Toast, Loader, and Theme management
 */

export const uiUtils = {
  showToast(message, type = 'info') {
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
      }
    });

    Toast.fire({
      icon: type === 'info' ? 'info' : type === 'success' ? 'success' : 'error',
      title: message
    });
  },

  showLoading() {
    let overlay = document.querySelector('.loader-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'loader-overlay';
      overlay.innerHTML = '<div class="loader"></div>';
      document.body.appendChild(overlay);
    }
    overlay.classList.add('active');
  },

  hideLoading() {
    const overlay = document.querySelector('.loader-overlay');
    if (overlay) overlay.classList.remove('active');
  },

  toggleTheme() {
    document.body.classList.toggle("dark-mode");
    const isDark = document.body.classList.contains("dark-mode");
    localStorage.setItem("theme", isDark ? "dark" : "light");
    
    const btn = document.getElementById("theme-toggle");
    if (btn) btn.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
  },

  initTheme() {
    if (localStorage.getItem("theme") === "dark") {
      document.body.classList.add("dark-mode");
      const themeToggle = document.getElementById("theme-toggle");
      if (themeToggle) themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
  }
};
