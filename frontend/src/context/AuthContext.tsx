import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

import { login as apiLogin, register as apiRegister, getMe, setToken, removeToken } from '../api';

const TOKEN_KEY = 'inventrack_token';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      getMe().then(setUser).catch(() => {
        removeToken();
        setUser(null);
      });
    }
  }, []);

  const login = async (email: string, password: string) => {
    const data = await apiLogin(email, password);
    setToken(data.access_token);
    const me = await getMe();
    setUser(me);
  };

  const register = async (email: string, password: string, name?: string) => {
    await apiRegister(email, password, name);
  };

  const logout = () => {
    removeToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
