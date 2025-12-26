export interface Admin {
  id: string;
  username: string;
  email: string;
  role: 'ADMIN' | 'SUPER_ADMIN';
}

export interface AuthResponse {
  success: boolean;
  data?: {
    admin: Admin;
    token: string;
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  message?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface CreateAdminData {
  username: string;
  email: string;
  password: string;
  role?: 'ADMIN' | 'SUPER_ADMIN';
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface AuthContextType {
  admin: Admin | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  logout: () => void;
  changePassword: (data: ChangePasswordData) => Promise<{ success: boolean; error?: any }>;
}