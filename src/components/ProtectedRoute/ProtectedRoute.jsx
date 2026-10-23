import { Link, Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import './ProtectedRoute.css';

/**
 * Requires a session (and optionally a role). Wraps a single page via `children`,
 * or a group of nested routes as a layout route (renders the <Outlet />).
 */
export default function ProtectedRoute({ role, children }) {
  const { user, status, logoutReason } = useAuth();
  const location = useLocation();

  if (status === 'checking') {
    return (
      <main className="guard">
        <span className="guard__spinner" aria-hidden="true" />
        <p>Verificando sesión…</p>
      </main>
    );
  }

  if (!user) {
    // After a manual logout the next person starts fresh; otherwise come back here after signing in
    const state = logoutReason === 'manual'
      ? undefined
      : { from: location.pathname + location.search + location.hash };
    return <Navigate to="/login" replace state={state} />;
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

  return children ?? <Outlet />;
}
