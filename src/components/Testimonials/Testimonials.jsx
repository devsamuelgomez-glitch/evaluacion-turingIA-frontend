import './Testimonials.css';

// Static for now; will be loaded from the reviews table on day 2
const testimonials = [
  { name: 'Ana Torres', product: 'Samsung Galaxy S10', quote: 'Excelente cámara, aunque la batería podría durar más.', initials: 'AT' },
  { name: 'Usuario Demo', product: 'MacBook Pro 14"', quote: 'Silenciosa, rápida y la batería dura todo el día.', initials: 'UD', featured: true },
  { name: 'Luis Pérez', product: 'iPhone 13 Pro', quote: 'Muy fluido y las fotos nocturnas son geniales.', initials: 'LP' },
];

export default function Testimonials() {
  return (
    <section id="opiniones" className="section testimonials" aria-labelledby="opiniones-title">
      <div className="container">
        <h2 id="opiniones-title" className="section__title">Lo que dicen nuestros clientes</h2>
        <p className="section__subtitle">Opiniones reales de compras verificadas</p>

        <ul className="testimonials__list">
          {testimonials.map((t) => (
            <li key={t.name} className={`testimonials__item ${t.featured ? 'testimonials__item--featured' : ''}`}>
              <figure className="testimonials__figure">
                <div className="testimonials__avatar" aria-hidden="true">{t.initials}</div>
                <blockquote className="testimonials__quote">“{t.quote}”</blockquote>
                <figcaption className="testimonials__author">
                  {t.name}
                  <span className="testimonials__product">{t.product}</span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
