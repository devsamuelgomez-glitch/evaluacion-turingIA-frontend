import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as api from '../services/api.js';

const STORAGE_KEY = 'techstore.session';
const AuthContext = createContext(null);

function readSession() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? null;
  } catch {
    return null;
  }
}

function writeSession(session) {
  try {
    if (session) localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage can be unavailable (private mode); the session just won't persist
  }
}

// Expiry time (ms) from the JWT payload. Only read to schedule the logout: the API verifies the signature.
function tokenExpiry(token) {
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const { exp } = JSON.parse(atob(payload));
    return typeof exp === 'number' ? exp * 1000 : null;
  } catch {
    return null;
  }
}

function isExpired(token) {
  const expiry = tokenExpiry(token);
  return expiry === null || expiry <= Date.now();
}

export function AuthProvider({ children }) {
  const [initial] = useState(() => {
    const saved = readSession();
    if (!saved) return { session: null, dropped: false };
    // A malformed or expired token is dropped right away instead of waiting for the API to reject it
    if (!saved.token || isExpired(saved.token)) {
      writeSession(null);
      return { session: null, dropped: true };
    }
    api.setAuthToken(saved.token);
    return { session: saved, dropped: false };
  });
  const [session, setSession] = useState(initial.session);
  // 'checking' while a saved token is validated against the API on load
  const [status, setStatus] = useState(() => (session?.token ? 'checking' : 'ready'));
  // Why the session ended: 'manual' (user clicked logout) or 'expired' (API answered 401).
  // ProtectedRoute and LoginPage use it to decide where to return and whether to show "session expired".
  const [logoutReason, setLogoutReason] = useState(initial.dropped ? 'expired' : null);

  const saveSession = useCallback((next) => {
    api.setAuthToken(next?.token ?? null);
    writeSession(next);
    setSession(next);
  }, []);

  const logout = useCallback((reason = 'manual') => {
    setLogoutReason(reason);
    saveSession(null);
  }, [saveSession]);

  useEffect(() => {
    api.setUnauthorizedHandler(() => logout('expired'));
    return () => api.setUnauthorizedHandler(null);
  }, [logout]);

  // End the session when the token expires, even if the user makes no further requests
  useEffect(() => {
    const expiry = session?.token && tokenExpiry(session.token);
    if (!expiry) return;
    // setTimeout overflows past ~24.8 days; tokens here last hours
    const timer = setTimeout(() => logout('expired'), Math.min(expiry - Date.now(), 2 ** 31 - 1));
    return () => clearTimeout(timer);
  }, [session, logout]);

  // Validate the saved token once; an expired token clears the session (via the 401 handler)
  useEffect(() => {
    if (status !== 'checking') return;
    api.getMe()
      .then((user) => saveSession({ token: session.token, user }))
      .catch(() => logout('expired'))
      .finally(() => setStatus('ready'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(async (credentials) => {
    const { user, token } = await api.login(credentials);
    setLogoutReason(null);
    saveSession({ user, token });
    return user;
  }, [saveSession]);

  const register = useCallback(async (data) => {
    const { user, token } = await api.register(data);
    setLogoutReason(null);
    saveSession({ user, token });
    return user;
  }, [saveSession]);

  const value = useMemo(() => ({
    user: session?.user ?? null,
    isAdmin: session?.user?.role === 'admin',
    status,
    logoutReason,
    login,
    register,
    logout,
  }), [session, status, logoutReason, login, register, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
