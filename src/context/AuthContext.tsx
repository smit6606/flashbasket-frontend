'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

interface User {
  id: number;
  user_name: string;
  email: string;
  role: 'user' | 'seller' | 'admin' | 'delivery';
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (data: { token: string; user: User }) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initAuth = () => {
      try {
        const savedToken = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');

        if (savedToken && savedUser) {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
        }
      } catch (err) {
        console.error("Auth hydration error", err);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  useEffect(() => {
    const handleUnauthorized = (event: any) => {
      setToken(null);
      setUser(null);
      localStorage.clear();
      sessionStorage.clear();
      const message = event.detail?.message || 'Session expired or Access Denied. Please login again.';
      toast.error(message, { toastId: 'session-expired' });
      
      if (window.location.pathname !== '/login') {
          window.location.href = '/login'; // Hard redirect to wipe memory state
      }
    };

    window.addEventListener('unauthorized-redirect', handleUnauthorized);
    return () => window.removeEventListener('unauthorized-redirect', handleUnauthorized);
  }, [router]);

  const login = (data: { token: string; user: User }) => {
    // 1. Wipe previous leftovers just in case
    localStorage.clear();
    sessionStorage.clear();
    
    // 2. Set new session
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    // 3. Force hard navigation to clear any cached queries/React states in the background
    let targetPath = '/';
    if (data.user.role === 'admin') targetPath = '/admin';
    else if (data.user.role === 'seller') targetPath = '/seller';
    else if (data.user.role === 'delivery') targetPath = '/delivery';
    
    window.location.href = targetPath;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    // Explicitly wipe all storages to prevent data leakage
    localStorage.clear();
    sessionStorage.clear();
    
    toast.info('Logged Out successfully');
    window.location.href = '/login'; // Hard redirect to wipe memory state
  };

  const refreshUser = async () => {
    try {
      const res = await api.get('/auth/profile');
      const updatedUser = res.data;
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (err) {
      console.error("Failed to refresh user", err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, refreshUser }}>
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
