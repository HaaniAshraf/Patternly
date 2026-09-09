import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { authService } from '@/services/auth.service';
import { ApiRequestError } from '@/services/api';
import type { User } from '@/types';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (input: { name: string; email: string; password: string; confirmPassword: string }) => Promise<User>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  setUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const { user } = await authService.me();
      setUser(user);
    } catch (err) {
      if (!(err instanceof ApiRequestError && err.status === 401)) {
        console.error(err);
      }
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback(async (email: string, password: string) => {
    const { user } = await authService.login({ email, password });
    setUser(user);
    return user;
  }, []);

  const register = useCallback(
    async (input: { name: string; email: string; password: string; confirmPassword: string }) => {
      const { user } = await authService.register(input);
      setUser(user);
      return user;
    },
    [],
  );

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, refresh, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
