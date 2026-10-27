import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { API_URL } from '../hooks/useApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('ids_auth_token') || null;
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Validate existing token on mount
  useEffect(() => {
    async function validateToken() {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_URL}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          setError(null);
        } else {
          // Token expired or invalid
          localStorage.removeItem('ids_auth_token');
          setToken(null);
          setUser(null);
        }
      } catch (err) {
        console.warn('Backend offline or auth check failed. Using cached session if available.');
        // If server is unreachable but we have a token, decode payload for offline resilience
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          if (payload && payload.exp * 1000 > Date.now()) {
            setUser({
              id: payload.id || 'USR-CACHED',
              username: payload.username || 'admin',
              name: payload.name || payload.username || 'Security Officer',
              role: payload.role || 'admin'
            });
          } else {
            localStorage.removeItem('ids_auth_token');
            setToken(null);
            setUser(null);
          }
        } catch (e) {
          localStorage.removeItem('ids_auth_token');
          setToken(null);
          setUser(null);
        }
      } finally {
        setIsLoading(false);
      }
    }

    validateToken();
  }, [token]);

  const login = useCallback(async (username, password) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      localStorage.setItem('ids_auth_token', data.token);
      setToken(data.token);
      setUser(data.user);
      setError(null);
      return { success: true, user: data.user };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (username, password, name = '') => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, name })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      localStorage.setItem('ids_auth_token', data.token);
      setToken(data.token);
      setUser(data.user);
      setError(null);
      return { success: true, user: data.user };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('ids_auth_token');
    setToken(null);
    setUser(null);
    setError(null);
    // Optional backend notify
    fetch(`${API_URL}/auth/logout`, { method: 'POST' }).catch(() => {});
  }, []);

  const value = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isLoading,
    error,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
