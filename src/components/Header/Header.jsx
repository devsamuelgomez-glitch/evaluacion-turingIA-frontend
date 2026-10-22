import { useState } from 'react';
import './Header.css';

const links = [
  { href: '#productos', label: 'Productos' },
  { href: '#categorias', label: 'Categorías' },
  { href: '#opiniones', label: 'Opiniones' },
  { href: '#contacto', label: 'Contacto' },
];

export default function Header() {
  const [open, setOpen] = useState(false);

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
        <a href="#" className="header__logo">
          Tech<span className="header__logo-accent">Store</span>
        </a>

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

        <ul id="main-menu" className={`header__menu ${open ? 'header__menu--open' : ''}`}>
          {links.map((link) => (
            <li key={link.href}>
              <a href={link.href} className="header__link" onClick={() => setOpen(false)}>
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
