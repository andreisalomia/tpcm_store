import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_AUTH_API_URL || 'http://localhost:3001/api/auth';

const authUtils = {
  api: axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
  }),

  setAuthToken(token) {
    if (token) {
      this.api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('tpcm_token', token);
    } else {
      delete this.api.defaults.headers.common['Authorization'];
      localStorage.removeItem('tpcm_token');
    }
  },

  getToken() {
    return localStorage.getItem('tpcm_token');
  },

  initializeAuth() {
    const token = this.getToken();
    if (token) {
      this.setAuthToken(token);
    }
  },

  async register(msisdn, password, email) {
    try {
      const response = await this.api.post('/register', {
        msisdn,
        password,
        email
      });

      if (response.data.success) {
        this.setAuthToken(response.data.token);
        const userData = {
          ...response.data.user,
          loginTime: new Date().toISOString(),
          authenticated: true
        };
        localStorage.setItem('tpcm_user', JSON.stringify(userData));
        return { success: true, userData };
      }

      throw new Error(response.data.error || 'Registration failed');
    } catch (error) {
      throw new Error(error.response?.data?.error || error.message || 'Registration failed');
    }
  },

  async login(msisdn, password) {
    try {
      const response = await this.api.post('/login', {
        msisdn,
        password
      });

      if (response.data.success) {
        this.setAuthToken(response.data.token);
        const userData = {
          ...response.data.user,
          loginTime: new Date().toISOString(),
          authenticated: true
        };
        localStorage.setItem('tpcm_user', JSON.stringify(userData));
        return { success: true, userData };
      }

      throw new Error(response.data.error || 'Login failed');
    } catch (error) {
      throw new Error(error.response?.data?.error || error.message || 'Login failed');
    }
  },

  async resetPassword(email, newPassword) {
    try {
      const response = await this.api.post('/reset-password', {
        email,
        newPassword
      });

      if (response.data.success) {
        return response.data;
      }

      throw new Error(response.data.error || 'Password reset failed');
    } catch (error) {
      throw new Error(error.response?.data?.error || error.message || 'Password reset failed');
    }
  },

  async verifyToken() {
    try {
      const response = await this.api.get('/verify');
      if (response.data.valid) {
        const userData = {
          ...response.data.user,
          loginTime: new Date().toISOString(),
          authenticated: true
        };
        localStorage.setItem('tpcm_user', JSON.stringify(userData));
        return userData;
      }
      throw new Error('Token invalid');
    } catch (error) {
      this.logout();
      throw error;
    }
  },

  isAuthenticated() {
    const user = localStorage.getItem('tpcm_user');
    const token = this.getToken();
    return !!(user && token && JSON.parse(user).authenticated);
  },

  getCurrentUser() {
    const userData = localStorage.getItem('tpcm_user');
    return userData ? JSON.parse(userData) : null;
  },

  logout() {
    this.setAuthToken(null);
    localStorage.removeItem('tpcm_user');
  }
};

authUtils.initializeAuth();

export default authUtils;