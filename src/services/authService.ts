import { AuthResponse, LoginCredentials, CreateAdminData, ChangePasswordData } from '@/types/auth';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

class AuthApiService {
  private getAuthHeaders(token?: string) {
    const authToken = token || localStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      ...(authToken && { Authorization: `Bearer ${authToken}` }),
    };
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(credentials),
      });

      const data = await response.json();
      
      if (data.success && data.data?.token) {
        localStorage.setItem('auth_token', data.data.token);
        localStorage.setItem('admin_data', JSON.stringify(data.data.admin));
      }

      return data;
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Failed to connect to server',
        },
      };
    }
  }

  async logout(): Promise<{ success: boolean }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
      });

      // Clear local storage regardless of response
      localStorage.removeItem('auth_token');
      localStorage.removeItem('admin_data');

      return { success: true };
    } catch (error) {
      // Clear local storage even if request fails
      localStorage.removeItem('auth_token');
      localStorage.removeItem('admin_data');
      return { success: true };
    }
  }

  async getProfile(): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      return await response.json();
    } catch (error) {
      console.error('Get profile error:', error);
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Failed to fetch profile',
        },
      };
    }
  }

  async changePassword(data: ChangePasswordData): Promise<{ success: boolean; error?: any }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      });

      return await response.json();
    } catch (error) {
      console.error('Change password error:', error);
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Failed to change password',
        },
      };
    }
  }

  async createAdmin(data: CreateAdminData): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/create-admin`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      });

      return await response.json();
    } catch (error) {
      console.error('Create admin error:', error);
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Failed to create admin',
        },
      };
    }
  }

  getStoredToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  getStoredAdmin(): any | null {
    const adminData = localStorage.getItem('admin_data');
    return adminData ? JSON.parse(adminData) : null;
  }

  clearStorage(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('admin_data');
  }
}

export const authService = new AuthApiService();