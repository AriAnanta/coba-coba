import { authAPI } from './api';

class AuthService {
  constructor() {
    this.token = localStorage.getItem('token') || sessionStorage.getItem('token');
    this.user = this.getStoredUser();
  }

  getStoredUser() {
    try {
      const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  }

  async login(credentials, rememberMe = false) {
    try {
      const response = await authAPI.login(credentials);
      const { token, user } = response.data;

      this.token = token;
      this.user = user;

      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem('token', token);
      storage.setItem('user', JSON.stringify(user));

      return { success: true, user };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  }

  async register(userData) {
    try {
      const response = await authAPI.register(userData);
      return { success: true, message: response.data.message };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  }

  async logout() {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.token = null;
      this.user = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
    }
  }

  async verifyToken() {
    if (!this.token) return false;

    try {
      const response = await authAPI.verify();
      this.user = response.data.user;
      
      const storage = localStorage.getItem('token') ? localStorage : sessionStorage;
      storage.setItem('user', JSON.stringify(this.user));
      
      return true;
    } catch (error) {
      this.logout();
      return false;
    }
  }

  isAuthenticated() {
    return !!this.token;
  }

  getUser() {
    return this.user;
  }

  getToken() {
    return this.token;
  }

  hasRole(role) {
    return this.user?.role === role;
  }

  hasAnyRole(roles) {
    return roles.includes(this.user?.role);
  }
}

export default new AuthService();
