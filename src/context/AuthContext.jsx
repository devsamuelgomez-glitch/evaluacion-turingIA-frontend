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

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => {
    const saved = readSession();
    if (saved?.token) api.setAuthToken(saved.token);
    return saved;
  });
  // 'checking' while a saved token is validated against the API on load
  const [status, setStatus] = useState(() => (session?.token ? 'checking' : 'ready'));
  // Why the session ended: 'manual' (user clicked logout) or 'expired' (API answered 401).
  // ProtectedRoute uses it to send manual logouts home instead of to /login.
  const [logoutReason, setLogoutReason] = useState(null);

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
