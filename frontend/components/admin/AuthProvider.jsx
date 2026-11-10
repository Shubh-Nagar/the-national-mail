'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api, tokenStore } from '@/lib/adminApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState('loading'); // loading | authed | anon

  useEffect(() => {
    if (!tokenStore.get()) {
      setStatus('anon');
      return;
    }
    api('/auth/me')
      .then((d) => {
        setUser(d.user);
        setStatus('authed');
      })
      .catch(() => {
        tokenStore.clear();
        setStatus('anon');
      });
  }, []);

  const login = useCallback(async (email, password) => {
    const d = await api('/auth/login', { method: 'POST', body: { email, password } });
    tokenStore.set(d.token);
    setUser(d.user);
    setStatus('authed');
    return d.user;
  }, []);

  const logout = useCallback(() => {
    tokenStore.clear();
    setUser(null);
    setStatus('anon');
    window.location.href = '/admin/login';
  }, []);

  return <AuthContext.Provider value={{ user, status, login, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
