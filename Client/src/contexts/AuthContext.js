import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

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

  useEffect(() => {
    const bootstrapSession = async () => {
      const cachedUser = localStorage.getItem('user');
      if (cachedUser) {
        try {
          setUser(JSON.parse(cachedUser));
        } catch (error) {
          localStorage.removeItem('user');
        }
      }

      try {
        const response = await authAPI.getCurrentUser();
        if (response?.success && response?.data) {
          setUser(response.data);
          localStorage.setItem('token', 'oauth-session');
          localStorage.setItem('user', JSON.stringify(response.data));
        } else {
          setUser(null);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } catch (error) {
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    bootstrapSession();
  }, []);

  const loginWithGoogle = () => {
    window.location.href = authAPI.getGoogleOAuthUrl();
  };

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      
      if (response.success) {
        setUser(response.user);
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        toast.success('Login successful!');
        return { success: true };
      } else {
        toast.error(response.message || 'Login failed');
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please try again.');
      return { success: false, message: 'Network error' };
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout API error:', error);
    }
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
      toast.error('Registration failed. Please try again.');
      return { success: false, message: 'Network error' };
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
