import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authApi } from '../api/client';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAdmin: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('beta_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('beta_token'));
  const [isLoading, setIsLoading] = useState(true);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('beta_token', newToken);
    localStorage.setItem('beta_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('beta_token');
    localStorage.removeItem('beta_user');
    setToken(null);
    setUser(null);
  };

  const refreshProfile = async () => {
    if (!token) return;
    try {
      const res = await authApi.getMe();
      setUser(res.data);
      localStorage.setItem('beta_user', JSON.stringify(res.data));
    } catch {
      logout();
    }
  };

  useEffect(() => {
    if (token) {
      refreshProfile().finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const isAdmin = Boolean(user?.roles?.includes('ROLE_ADMIN'));
  const isAuthenticated = Boolean(user && token);

  return (
    <AuthContext.Provider value={{ user, token, isAdmin, isAuthenticated, isLoading, login, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
