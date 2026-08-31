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
  /** 用服务器返回的最新用户信息替换当前用户（如头像上传后） */
  updateUser: (user: User) => void;
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
      await apiClient.post('/auth/register', data);
      return true;
    } catch (err: any) {
      console.error('Register error:', err?.response?.data || err?.message || err);
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    setUser(null);
  }, []);

  const updateUser = useCallback((u: User) => setUser(u), []);

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated: !!user, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
