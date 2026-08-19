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
      if (!res.data || typeof res.data !== 'object') {
        console.error('Login: invalid response', res.data);
        return false;
      }
      const { access_token, user: userData } = res.data;
      if (typeof access_token === 'string') {
        localStorage.setItem('access_token', access_token);
      }
      if (userData && typeof userData === 'object') {
        setUser(userData as User);
      }
      return true;
    } catch (err: any) {
      console.error('Login error:', err?.message || err);
      return false;
    }
  }, []);

  const register = useCallback(async (data: UserCreate) => {
    try {
      const res = await apiClient.post('/auth/register', data);
      console.log('Register response:', res?.data);
      return true;
    } catch (err: any) {
      console.error('Register error:', err?.message || err);
      console.error('Register error response:', err?.response?.data);
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
