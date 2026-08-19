import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { apiClient } from '@/api/client';
import type { User, LoginRequest, UserCreate } from '@stylan/shared-types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginRequest) => Promise<boolean>;
  register: (data: UserCreate) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      apiClient.get('/auth/me')
        .then((res) => setUser(res.data))
        .catch(() => {
          localStorage.removeItem('access_token');
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (data: LoginRequest) => {
    try {
      const res = await apiClient.post('/auth/login', data);
      const { access_token, user: userData } = res.data;
      localStorage.setItem('access_token', access_token);
      setUser(userData);
      return true;
    } catch {
      return false;
    }
  }, []);

  const register = useCallback(async (data: UserCreate) => {
    try {
      await apiClient.post('/auth/register', data);
      return true;
    } catch {
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated: !!user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
