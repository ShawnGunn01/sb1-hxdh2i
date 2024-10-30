import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { getRolePermissions } from '../middleware/rbacMiddleware';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, twoFactorCode?: string) => Promise<{ requiresTwoFactor?: boolean }>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  hasPermission: (permission: string) => boolean;
  userPermissions: string[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userPermissions, setUserPermissions] = useState<string[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUser(token);
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchUser = async (token: string) => {
    try {
      const response = await axios.get('/api/auth/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data);
      setUserPermissions(getRolePermissions(response.data.role));
    } catch (error) {
      console.error('Error fetching user:', error);
      localStorage.removeItem('token');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string, twoFactorCode?: string) => {
    try {
      const response = await axios.post('/api/auth/login', { email, password, twoFactorCode });
      const { token, user, requiresTwoFactor } = response.data;
      if (!requiresTwoFactor) {
        localStorage.setItem('token', token);
        setUser(user);
        setUserPermissions(getRolePermissions(user.role));
      }
      return { requiresTwoFactor };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // ... (existing register and logout functions)

  const hasPermission = (permission: string) => {
    return userPermissions.includes(permission);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading, hasPermission, userPermissions }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};