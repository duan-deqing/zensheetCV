import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { User } from '@stylan/shared-types';

/**
 * 本地访客认证：纯前端版本无账号体系，
 * 用户资料（昵称/头像）持久化在 localStorage `stylan.profile`，恒为已登录态。
 */

const PROFILE_KEY = 'stylan.profile';

const DEFAULT_USER: User = {
  id: 'local',
  email: '',
  name: 'ZENSHEET',
  avatar: '',
  created_at: '',
};

function loadProfile(): User {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (raw) {
      const saved = JSON.parse(raw) as Partial<User>;
      const next = { ...DEFAULT_USER, ...saved, id: 'local' };
      // 旧版默认名「用户」自动升级为 ZENSHEET（仍可随时在设置中自定义）
      if (next.name === '用户') next.name = DEFAULT_USER.name;
      return next;
    }
  } catch {
    // 数据损坏时回退默认访客
  }
  return DEFAULT_USER;
}

interface AuthContextType {
  user: User;
  isLoading: boolean;
  isAuthenticated: true;
  /** 更新本地资料（昵称/头像），同步写入 localStorage */
  updateUser: (patch: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(loadProfile);

  const updateUser = useCallback((patch: Partial<User>) => {
    setUser((prev) => {
      const next = { ...prev, ...patch, id: 'local' };
      try {
        localStorage.setItem(PROFILE_KEY, JSON.stringify(next));
      } catch {
        // 存储失败（隐私模式等）时仅保留在内存
      }
      return next;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading: false, isAuthenticated: true, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
