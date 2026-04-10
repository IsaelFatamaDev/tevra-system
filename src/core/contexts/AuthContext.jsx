import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('tevra_user');
    const token = localStorage.getItem('tevra_token');
    if (stored && token) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem('tevra_user');
        localStorage.removeItem('tevra_token');
      }
    }
    setLoading(false);
  }, []);

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

  const logout = useCallback(() => {
    localStorage.removeItem('tevra_token');
    localStorage.removeItem('tevra_refresh');
    localStorage.removeItem('tevra_user');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAuthenticated: !!user }}>
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
