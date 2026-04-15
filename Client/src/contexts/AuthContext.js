import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const getRoleHomeRoute = (role) => {
  switch (role) {
    case 'ADMIN':
      return '/admin/dashboard';
    case 'TECHNICIAN':
      return '/tickets';
    case 'USER':
    default:
      return '/dashboard';
  }
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const extractApiMessage = (error, fallbackMessage) => {
    const payload = error?.response?.data;

    if (typeof payload?.message === 'string' && payload.message.trim()) {
      return payload.message;
    }

    if (payload?.data && typeof payload.data === 'object') {
      const firstFieldError = Object.values(payload.data).find(
        (value) => typeof value === 'string' && value.trim()
      );
      if (firstFieldError) {
        return firstFieldError;
      }
    }

    if (!error?.response) {
      return 'Cannot reach server. Please ensure backend is running on port 8080.';
    }

    return fallbackMessage;
  };

  useEffect(() => {
    const bootstrapAuth = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await authAPI.getCurrentUser();
        if (response.success && response.user) {
          setUser(response.user);
          localStorage.setItem('user', JSON.stringify(response.user));
        } else {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    bootstrapAuth();
  }, []);

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      
      if (response.success) {
        setUser(response.user);
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        toast.success('Login successful!');
        return { success: true, user: response.user, redirectTo: getRoleHomeRoute(response.user?.role) };
      } else {
        toast.error(response.message || 'Login failed');
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Login error:', error);
      const message = extractApiMessage(error, 'Login failed. Please try again.');
      toast.error(message);
      return { success: false, message };
    }
  };

  const loginWithGoogle = async (idToken) => {
    try {
      const response = await authAPI.googleLogin(idToken);

      if (response.success) {
        setUser(response.user);
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        toast.success('Login successful!');
        return { success: true, user: response.user, redirectTo: getRoleHomeRoute(response.user?.role) };
      }

      toast.error(response.message || 'Google sign-in failed');
      return { success: false, message: response.message };
    } catch (error) {
      console.error('Google login error:', error);
      const message = extractApiMessage(error, 'Google sign-in failed. Please try again.');
      toast.error(message);
      return { success: false, message };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      
      if (response.success) {
        toast.success('Registration successful! Please login.');
        return { success: true };
      } else {
        toast.error(response.message || 'Registration failed');
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Registration error:', error);
      const message = extractApiMessage(error, 'Registration failed. Please try again.');
      toast.error(message);
      return { success: false, message };
    }
  };

  const hasRole = (role) => {
    return user && user.role === role;
  };

  const hasAnyRole = (roles) => {
    return user && roles.includes(user.role);
  };

  const value = {
    user,
    login,
    loginWithGoogle,
    logout,
    register,
    loading,
    hasRole,
    hasAnyRole,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Mock API functions - replace with actual API calls
const mockLogin = async (credentials) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock user data
  const users = [
    { id: 1, email: 'admin@campus.edu', password: 'admin123', name: 'Admin User', role: 'ADMIN' },
    { id: 2, email: 'user@campus.edu', password: 'user123', name: 'Regular User', role: 'USER' },
    { id: 3, email: 'tech@campus.edu', password: 'tech123', name: 'Technician', role: 'TECHNICIAN' },
  ];
  
  const user = users.find(u => u.email === credentials.email && u.password === credentials.password);
  
  if (user) {
    return {
      success: true,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      token: 'mock-jwt-token'
    };
  }
  
  return {
    success: false,
    message: 'Invalid email or password'
  };
};

const mockRegister = async (userData) => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    success: true
  };
};
