import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import './Header.css';

// Section anchors live on the store page; "/#..." also works from /login or /admin
const links = [
  { href: '/#productos', label: 'Productos' },
  { href: '/#categorias', label: 'Categorías' },
  { href: '/#opiniones', label: 'Opiniones' },
  { href: '/#contacto', label: 'Contacto' },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const { user, isAdmin, logout } = useAuth();
  const toast = useToast();
  const close = () => setOpen(false);

  function handleLogout() {
    // On protected pages, ProtectedRoute sends a manual logout back to the store
    logout();
    close();
    toast.success('Sesión cerrada');
  }

  return (
    <header className="header">
      <div className="header__topbar">
        <div className="container header__topbar-inner">
          <p className="header__promo">Envío gratis en compras mayores a $999</p>
          <ul className="header__social" aria-label="Redes sociales">
            <li><a href="#" aria-label="Facebook" className="header__social-link">f</a></li>
            <li><a href="#" aria-label="Instagram" className="header__social-link">ig</a></li>
            <li><a href="#" aria-label="X" className="header__social-link">x</a></li>
          </ul>
        </div>
      </div>

      <nav className="container header__nav" aria-label="Principal">
        <Link to="/" className="header__logo" onClick={close}>
          Tech<span className="header__logo-accent">Store</span>
        </Link>

        <button
          type="button"
          className="header__toggle"
          aria-expanded={open}
          aria-controls="main-menu"
          onClick={() => setOpen((o) => !o)}
        >
          <span className="visually-hidden">Abrir menú</span>
          <span className="header__toggle-bar" />
          <span className="header__toggle-bar" />
          <span className="header__toggle-bar" />
        </button>

        <div id="main-menu" className={`header__menu ${open ? 'header__menu--open' : ''}`}>
          <ul className="header__links">
            {links.map((link) => (
              <li key={link.href}>
                <a href={link.href} className="header__link" onClick={close}>{link.label}</a>
              </li>
            ))}
          </ul>

          <div className="header__account">
            {user ? (
              <>
                <span className="header__user" title={user.email}>
                  <span className="header__avatar" aria-hidden="true">{user.name.charAt(0).toUpperCase()}</span>
                  <span className="header__user-name">{user.name.split(' ')[0]}</span>
                  {isAdmin && <span className="header__badge">Admin</span>}
                </span>
                {isAdmin && (
                  <NavLink to="/admin" className="button button--primary button--small" onClick={close}>Panel admin</NavLink>
                )}
                <button type="button" className="button button--outline button--small" onClick={handleLogout}>Cerrar sesión</button>
              </>
            ) : (
              <Link to="/login" className="button button--primary button--small" onClick={close}>Iniciar sesión</Link>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
