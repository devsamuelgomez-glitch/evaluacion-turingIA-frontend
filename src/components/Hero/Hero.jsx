import './Hero.css';

const features = [
  { icon: '🚚', title: 'Envío gratis', text: 'En compras mayores a $999 a todo México.' },
  { icon: '🛡️', title: 'Garantía oficial', text: 'Todos los productos con garantía de marca.' },
  { icon: '💬', title: 'Soporte 24/7', text: 'Expertos listos para ayudarte a elegir.' },
];

export default function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="container hero__content">
        <h1 id="hero-title" className="hero__title">
          La mejor tecnología, <span className="hero__title-accent">al mejor precio</span>
        </h1>
        <p className="hero__text">
          Laptops, smartphones, audio y accesorios de las marcas que amas. Encuentra tu próximo equipo en TechStore.
        </p>
        <a href="#productos" className="button button--primary">Ver productos</a>
      </div>

      <ul className="container hero__features">
        {features.map((feature) => (
          <li key={feature.title} className="hero__feature">
            <span className="hero__feature-icon" aria-hidden="true">{feature.icon}</span>
            <h2 className="hero__feature-title">{feature.title}</h2>
            <p className="hero__feature-text">{feature.text}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
