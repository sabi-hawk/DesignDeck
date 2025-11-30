import axios from 'axios';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from './ToastContext';

// API URL - uses environment variable for production, falls back to localhost for development
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  // Set up axios defaults
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
    }
  }, []);

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const response = await axios.get(`${API_BASE_URL}/api/auth/me`);
          if (response.data.success) {
            setUser(response.data.user);
          } else {
            localStorage.removeItem('token');
            setToken(null);
            delete axios.defaults.headers.common['Authorization'];
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('token');
          setToken(null);
          delete axios.defaults.headers.common['Authorization'];
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, { email, password });
      
      if (response.data.success) {
        const { token: newToken, user: userData } = response.data;
        setToken(newToken);
        setUser(userData);
        localStorage.setItem('token', newToken);
        axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        showToast({
          type: 'success',
          title: 'Welcome back!',
          message: `Hello ${userData.name}, you've successfully signed in.`,
        });
        return { success: true, message: 'Login successful' };
      } else {
        showToast({
          type: 'error',
          title: 'Login Failed',
          message: response.data.message || 'Invalid credentials. Please try again.',
        });
        return { success: false, message: response.data.message || 'Login failed' };
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed';
      showToast({
        type: 'error',
        title: 'Login Failed',
        message: message,
      });
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_BASE_URL}/api/auth/register`, { name, email, password });
      
      if (response.data.success) {
        const { token: newToken, user: userData } = response.data;
        setToken(newToken);
        setUser(userData);
        localStorage.setItem('token', newToken);
        axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        showToast({
          type: 'success',
          title: 'Account Created!',
          message: `Welcome to DesignDeck, ${userData.name}! Your account has been created successfully.`,
        });
        return { success: true, message: 'Registration successful' };
      } else {
        showToast({
          type: 'error',
          title: 'Registration Failed',
          message: response.data.message || 'Unable to create account. Please try again.',
        });
        return { success: false, message: response.data.message || 'Registration failed' };
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registration failed';
      showToast({
        type: 'error',
        title: 'Registration Failed',
        message: message,
      });
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    showToast({
      type: 'info',
      title: 'Signed Out',
      message: 'You have been successfully signed out.',
    });
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
