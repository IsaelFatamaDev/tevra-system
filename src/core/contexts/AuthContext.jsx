import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const clearSession = useCallback(() => {
    localStorage.removeItem('tevra_token');
    localStorage.removeItem('tevra_refresh');
    localStorage.removeItem('tevra_user');
    setUser(null);
  }, []);

  // Validate token on mount by calling /users/me
  useEffect(() => {
    const token = localStorage.getItem('tevra_token');
    if (!token) {
      setLoading(false);
      return;
    }
    api.get('/users/me')
      .then((data) => {
        const validated = {
          id: data.id,
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          role: data.role,
          avatarUrl: data.avatarUrl,
          tenantId: data.tenantId,
        };
        localStorage.setItem('tevra_user', JSON.stringify(validated));
        setUser(validated);
      })
      .catch(() => {
        clearSession();
      })
      .finally(() => setLoading(false));
  }, [clearSession]);

  const login = useCallback(async (email, password) => {
    const data = await api.post('/auth/login', {
      email,
      password,
    });
    localStorage.setItem('tevra_token', data.accessToken);
    localStorage.setItem('tevra_refresh', data.refreshToken);
    localStorage.setItem('tevra_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async ({ email, password, firstName, lastName, phone, whatsapp }) => {
    const data = await api.post('/auth/register', {
      email,
      password,
      firstName,
      lastName,
      phone,
      whatsapp,
    });
    localStorage.setItem('tevra_token', data.accessToken);
    localStorage.setItem('tevra_refresh', data.refreshToken);
    localStorage.setItem('tevra_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const data = await api.get('/users/me');
      const updated = {
        id: data.id,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        avatarUrl: data.avatarUrl,
        tenantId: data.tenantId,
      };
      localStorage.setItem('tevra_user', JSON.stringify(updated));
      setUser(updated);
    } catch { /* ignore */ }
  }, []);

  const logout = useCallback(() => {
    clearSession();
  }, [clearSession]);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export default AuthContext;
