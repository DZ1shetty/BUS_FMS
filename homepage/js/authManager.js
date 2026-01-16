/**
 * Unified Authentication Manager
 * Works across all browsers including Brave with strict privacy settings
 */

export const authManager = {
    // Storage keys
    KEYS: {
        TOKEN: 'auth_token',
        USER: 'auth_user',
        USERNAME: 'auth_username',
        PROVIDER: 'auth_provider'
    },

    /**
     * Store authentication data using multiple storage methods for reliability
     */
    setAuth(token, username, provider = 'traditional') {
        try {
            // Store in localStorage
            localStorage.setItem(this.KEYS.TOKEN, token);
            localStorage.setItem(this.KEYS.USERNAME, username);
            localStorage.setItem(this.KEYS.PROVIDER, provider);

            // Also store in sessionStorage as backup
            sessionStorage.setItem(this.KEYS.TOKEN, token);
            sessionStorage.setItem(this.KEYS.USERNAME, username);
            sessionStorage.setItem(this.KEYS.PROVIDER, provider);

            // Store user object
            const userData = {
                displayName: username,
                email: username,
                provider: provider,
                timestamp: Date.now()
            };

            localStorage.setItem(this.KEYS.USER, JSON.stringify(userData));
            sessionStorage.setItem(this.KEYS.USER, JSON.stringify(userData));

            console.log('✅ Auth data stored successfully:', { username, provider });
            return true;
        } catch (error) {
            console.error('❌ Failed to store auth data:', error);
            return false;
        }
    },

    /**
     * Get authentication token from any available storage
     */
    getToken() {
        try {
            // Try localStorage first
            let token = localStorage.getItem(this.KEYS.TOKEN);
            if (token) return token;

            // Fallback to sessionStorage
            token = sessionStorage.getItem(this.KEYS.TOKEN);
            if (token) {
                // Restore to localStorage if found in session
                localStorage.setItem(this.KEYS.TOKEN, token);
                return token;
            }

            // Try legacy keys for backward compatibility
            token = localStorage.getItem('token');
            if (token) {
                // Migrate to new key
                this.setAuth(token, localStorage.getItem('username') || 'user');
                return token;
            }

            return null;
        } catch (error) {
            console.error('Error getting token:', error);
            return null;
        }
    },

    /**
     * Get username from storage
     */
    getUsername() {
        try {
            return localStorage.getItem(this.KEYS.USERNAME) ||
                sessionStorage.getItem(this.KEYS.USERNAME) ||
                localStorage.getItem('username') ||
                'User';
        } catch (error) {
            return 'User';
        }
    },

    /**
     * Get user data object
     */
    getUser() {
        try {
            let userData = localStorage.getItem(this.KEYS.USER) ||
                sessionStorage.getItem(this.KEYS.USER);

            if (userData) {
                return JSON.parse(userData);
            }

            // Fallback: create user object from available data
            const username = this.getUsername();
            if (username && this.getToken()) {
                return {
                    displayName: username,
                    email: username,
                    provider: localStorage.getItem(this.KEYS.PROVIDER) || 'traditional'
                };
            }

            return null;
        } catch (error) {
            console.error('Error getting user:', error);
            return null;
        }
    },

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        const token = this.getToken();
        const hasAuth = !!token;
        console.log('🔐 Auth check:', hasAuth ? '✅ Authenticated' : '❌ Not authenticated');
        return hasAuth;
    },

    /**
     * Clear all authentication data
     */
    clearAuth() {
        try {
            // Clear new keys
            Object.values(this.KEYS).forEach(key => {
                localStorage.removeItem(key);
                sessionStorage.removeItem(key);
            });

            // Clear legacy keys
            localStorage.removeItem('token');
            localStorage.removeItem('username');
            sessionStorage.removeItem('user');

            console.log('🔓 Auth data cleared');
            return true;
        } catch (error) {
            console.error('Error clearing auth:', error);
            return false;
        }
    },

    /**
     * Get authorization header for API requests
     */
    getAuthHeader() {
        const token = this.getToken();
        if (!token) {
            console.warn('⚠️ No token available for auth header');
            return {};
        }
        return {
            'Authorization': `Bearer ${token}`
        };
    },

    /**
     * Verify token is still valid (basic check)
     */
    isTokenValid() {
        const token = this.getToken();
        if (!token) return false;

        try {
            // Basic JWT validation - check if it has 3 parts
            const parts = token.split('.');
            if (parts.length !== 3) {
                console.warn('⚠️ Invalid token format');
                return false;
            }

            // Decode payload to check expiration
            const payload = JSON.parse(atob(parts[1]));
            if (payload.exp) {
                const isExpired = Date.now() >= payload.exp * 1000;
                if (isExpired) {
                    console.warn('⚠️ Token has expired');
                    return false;
                }
            }

            return true;
        } catch (error) {
            console.error('Error validating token:', error);
            return false;
        }
    }
};
