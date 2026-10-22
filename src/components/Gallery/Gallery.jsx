import './Gallery.css';

const TILE_COUNT = 4;
// Wireframe A: two solid tiles followed by two patterned ones
const VARIANTS = ['solid', 'solid', 'pattern', 'pattern'];

const taglines = {
  laptops: 'Potencia para trabajar y crear',
  smartphones: 'Lo último en movilidad',
  tablets: 'Tu pantalla para todo',
  audio: 'Sonido sin distracciones',
  accesorios: 'Completa tu setup',
};

export default function Gallery({ categories, status, onSelect }) {
  // The categories with the most products fill the wireframe's four tiles
  const featured = [...categories]
    .sort((a, b) => b.product_count - a.product_count)
    .slice(0, TILE_COUNT);

  return (
    <section id="categorias" className="section gallery" aria-labelledby="categorias-title">
      <div className="container">
        <h2 id="categorias-title" className="section__title">Explora por categoría</h2>
        <p className="section__subtitle">Todo lo que necesitas en un solo lugar</p>

        {status === 'error' ? (
          <p className="gallery__message">No pudimos cargar las categorías.</p>
        ) : (
          <ul className="gallery__grid" aria-busy={status === 'loading'}>
            {status === 'loading'
              ? VARIANTS.map((variant, i) => (
                  <li key={i} className="gallery__tile gallery__tile--loading" aria-hidden="true" />
                ))
              : featured.map((category, i) => (
                  <li key={category.slug} className={`gallery__tile gallery__tile--${VARIANTS[i]}`}>
                    <button
                      type="button"
                      className="gallery__button"
                      onClick={() => onSelect(category.slug)}
                      aria-label={`Ver ${category.name} (${category.product_count} productos)`}
                    >
                      {category.cover_image && (
                        <img className="gallery__image" src={category.cover_image} alt="" loading="lazy" />
                      )}
                      <span className="gallery__info">
                        <span className="gallery__title">{category.name}</span>
                        <span className="gallery__text">{taglines[category.slug] ?? `${category.product_count} productos`}</span>
                        <span className="gallery__count">{category.product_count} productos →</span>
                      </span>
                    </button>
                  </li>
                ))}
          </ul>
        )}
      </div>
    </section>
  );
}
