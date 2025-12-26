import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Admin, AuthContextType, LoginCredentials, ChangePasswordData } from '@/types/auth';
import { authService } from '@/services/authService';
import { toast } from 'sonner';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!admin && !!token;

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = authService.getStoredToken();
        const storedAdmin = authService.getStoredAdmin();

        if (storedToken && storedAdmin) {
          // Verify token is still valid by fetching profile
          const profileResponse = await authService.getProfile();
          
          if (profileResponse.success && profileResponse.data?.admin) {
            setToken(storedToken);
            setAdmin(profileResponse.data.admin);
          } else {
            // Token is invalid, clear storage
            authService.clearStorage();
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        authService.clearStorage();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const response = await authService.login(credentials);
      
      if (response.success && response.data) {
        setAdmin(response.data.admin);
        setToken(response.data.token);
        toast.success('Login successful!');
      } else {
        toast.error(response.error?.message || 'Login failed');
      }
      
      return response;
    } catch (error) {
      console.error('Login error:', error);
      const errorResponse = {
        success: false,
        error: {
          code: 'UNKNOWN_ERROR',
          message: 'An unexpected error occurred',
        },
      };
      toast.error('Login failed');
      return errorResponse;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      setAdmin(null);
      setToken(null);
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      // Clear state even if request fails
      setAdmin(null);
      setToken(null);
      authService.clearStorage();
    } finally {
      setIsLoading(false);
    }
  };

  const changePassword = async (data: ChangePasswordData) => {
    try {
      const response = await authService.changePassword(data);
      
      if (response.success) {
        toast.success('Password changed successfully');
      } else {
        toast.error(response.error?.message || 'Failed to change password');
      }
      
      return response;
    } catch (error) {
      console.error('Change password error:', error);
      const errorResponse = {
        success: false,
        error: {
          code: 'UNKNOWN_ERROR',
          message: 'An unexpected error occurred',
        },
      };
      toast.error('Failed to change password');
      return errorResponse;
    }
  };

  const value: AuthContextType = {
    admin,
    token,
    isAuthenticated,
    isLoading,
    login,
    logout,
    changePassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};