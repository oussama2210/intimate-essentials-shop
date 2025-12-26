import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AdminLoginForm } from '@/components/auth/AdminLoginForm';
import { useAuth } from '@/context/AuthContext';

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  // Get the intended destination from location state, default to admin dashboard
  const from = (location.state as any)?.from?.pathname || '/admin';

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleLoginSuccess = () => {
    navigate(from, { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Algeria E-commerce
          </h1>
          <p className="text-gray-600">
            Admin Panel Access
          </p>
        </div>
        
        <AdminLoginForm onSuccess={handleLoginSuccess} />
        
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Secure admin access for Algeria E-commerce system
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;