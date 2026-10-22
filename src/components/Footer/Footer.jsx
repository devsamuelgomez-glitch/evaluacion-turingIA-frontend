import './Footer.css';

const columns = [
  { title: 'Tienda', links: ['Laptops', 'Smartphones', 'Audio', 'Accesorios'] },
  { title: 'Ayuda', links: ['Envíos', 'Devoluciones', 'Garantías', 'Preguntas frecuentes'] },
  { title: 'Empresa', links: ['Nosotros', 'Contacto', 'Aviso de privacidad', 'Términos'] },
];

export default function Footer() {
  return (
    <footer id="contacto" className="footer">
      <div className="container footer__inner">
        <div className="footer__brand">
          <a href="#" className="footer__logo">Tech<span className="footer__logo-accent">Store</span></a>
          <p className="footer__tagline">Tecnología de calidad, entregada a tu puerta.</p>
        </div>

        {columns.map((column) => (
          <nav key={column.title} className="footer__column" aria-label={column.title}>
            <h2 className="footer__title">{column.title}</h2>
            <ul className="footer__links">
              {column.links.map((link) => (
                <li key={link}><a href="#" className="footer__link">{link}</a></li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <p className="footer__copy">© {new Date().getFullYear()} TechStore · Proyecto de prueba para Turing IA</p>
    </footer>
  );
}
