import { useEffect, useRef } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import './ProtectedRoute.css';

/** Requires a session (and optionally a role). Unauthenticated users go to /login and come back after. */
export default function ProtectedRoute({ role, children }) {
  const { user, status, logoutReason } = useAuth();
  const location = useLocation();
  // Whether this page showed a signed-in user at its last commit (updated in an effect, not during render)
  const hadUser = useRef(Boolean(user));
  const loggedOutHere = hadUser.current && !user && logoutReason === 'manual';
  useEffect(() => { hadUser.current = Boolean(user); }, [user]);

  if (status === 'checking') {
    return (
      <main className="guard">
        <span className="guard__spinner" aria-hidden="true" />
        <p>Verificando sesión…</p>
      </main>
    );
  }

  if (!user) {
    // Logging out from this page goes back to the store; anything else asks to sign in and returns here after
    if (loggedOutHere) return <Navigate to="/" replace />;
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (role && user.role !== role) {
    return (
      <main className="guard">
        <p className="guard__code">403</p>
        <h1 className="guard__title">No tienes permiso para ver esta página</h1>
        <p className="guard__text">Esta sección es solo para administradores.</p>
        <Link to="/" className="button button--primary">Volver a la tienda</Link>
      </main>
    );
  }

  return children;
}
