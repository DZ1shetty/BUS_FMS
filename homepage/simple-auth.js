// ============================================
// SIMPLE AUTHENTICATION CHECK - NO MODULES
// ============================================

(function () {
    'use strict';

    console.log('🔐 Starting authentication check...');

    // Check if user is logged in
    function checkAuth() {
        const token = localStorage.getItem('auth_token') ||
            sessionStorage.getItem('auth_token') ||
            localStorage.getItem('token');

        const username = localStorage.getItem('auth_username') ||
            sessionStorage.getItem('auth_username') ||
            localStorage.getItem('username');

        if (!token || !username) {
            console.log('❌ No authentication found - redirecting to login');
            window.location.href = '../login/login.html';
            return false;
        }

        console.log('✅ User authenticated:', username);
        return true;
    }

    // Display user info
    function displayUser() {
        const username = localStorage.getItem('auth_username') ||
            sessionStorage.getItem('auth_username') ||
            localStorage.getItem('username') ||
            'User';

        const userElement = document.getElementById('logged-in-as');
        if (userElement) {
            userElement.textContent = username;
        }

        console.log('👤 Displaying user:', username);
    }

    // Run authentication check
    if (checkAuth()) {
        displayUser();
    }

    // Make logout function globally available
    window.handleSignOut = function () {
        console.log('🔓 Logging out...');
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '../login/login.html';
    };

})();
