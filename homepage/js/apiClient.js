/**
 * API Client for handling all server communications
 * Enhanced with proper error handling and retry logic
 */

export const apiClient = {
  getHeaders() {
    // Check new keys first, fallback to legacy
    const token = localStorage.getItem('auth_token') ||
      sessionStorage.getItem('auth_token') ||
      localStorage.getItem('token');

    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  },

  async waitForToken(maxWaitTime = 5000) {
    const startTime = Date.now();
    const checkToken = () => localStorage.getItem('auth_token') ||
      sessionStorage.getItem('auth_token') ||
      localStorage.getItem('token');

    while (!checkToken() && Date.now() - startTime < maxWaitTime) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const token = checkToken();
    if (!token) {
      console.warn('⚠️ Token not available after waiting');
      return false;
    }

    console.log('✅ Token available for API call');
    return true;
  },

  async handleResponse(response) {
    const contentType = response.headers.get("content-type");
    let errorData = null;

    // Try to parse as JSON if available
    if (contentType && contentType.includes("application/json")) {
      try {
        errorData = await response.json();
      } catch (e) {
        console.warn("Failed to parse JSON response:", e);
      }
    }

    // Check status code
    if (!response.ok) {
      const errorMessage = errorData?.error || errorData?.message || `HTTP ${response.status} ${response.statusText}`;
      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = errorData;
      throw error;
    }

    return errorData;
  },

  async fetch(endpoint) {
    try {
      // Wait for token to be available
      await this.waitForToken();

      const response = await fetch(`/api/${endpoint}`, {
        headers: this.getHeaders()
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error(`[API] GET ${endpoint} failed:`, error.message || error);
      throw error;
    }
  },

  async post(endpoint, data) {
    try {
      await this.waitForToken();

      const response = await fetch(`/api/${endpoint}`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(data)
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error(`[API] POST ${endpoint} failed:`, error.message || error);
      throw error;
    }
  },

  async put(endpoint, data) {
    try {
      await this.waitForToken();

      const response = await fetch(`/api/${endpoint}`, {
        method: "PUT",
        headers: this.getHeaders(),
        body: JSON.stringify(data)
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error(`[API] PUT ${endpoint} failed:`, error.message || error);
      throw error;
    }
  },

  async delete(endpoint) {
    try {
      await this.waitForToken();

      const response = await fetch(`/api/${endpoint}`, {
        method: "DELETE",
        headers: this.getHeaders()
      });

      if (!response.ok) {
        return await this.handleResponse(response);
      }
      return true;
    } catch (error) {
      console.error(`[API] DELETE ${endpoint} failed:`, error.message || error);
      throw error;
    }
  }
};
