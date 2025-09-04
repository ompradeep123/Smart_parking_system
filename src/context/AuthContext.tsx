import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  vehicleNumbers?: string[];
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
  setError: (error: string | null) => void;
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
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize axios with base URL
  const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    withCredentials: true
  });

  // Add axios interceptor for auth header
  api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Check if user is logged in
  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          setLoading(false);
          return;
        }
        
        const response = await api.get('/auth/me');
        
        if (response.data.success) {
          setUser(response.data.data);
          setIsAuthenticated(true);
        }
      } catch (err) {
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };
    
    checkLoggedIn();
  }, []);

  // Login user
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await api.post('/auth/login', { email, password });
      
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        setUser(response.data.user);
        setIsAuthenticated(true);
        setError(null);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Register user
  const register = async (name: string, email: string, password: string, phone?: string) => {
    try {
      setLoading(true);
      const response = await api.post('/auth/register', { name, email, password, phone });
      
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        setUser(response.data.user);
        setIsAuthenticated(true);
        setError(null);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = async () => {
    try {
      setLoading(true);
      await api.get('/auth/logout');
      localStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Logout failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        login,
        register,
        logout,
        error,
        setError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};