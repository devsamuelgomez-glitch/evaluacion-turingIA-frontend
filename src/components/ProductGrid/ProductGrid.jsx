import { PAGE_SIZE, useProducts } from '../../hooks/useProducts.js';
import ProductCard from './ProductCard.jsx';
import './ProductGrid.css';

export default function ProductGrid({ categories, category, onCategoryChange }) {
  const {
    products, shownCategory, status, error,
    isInitialLoading, isSwitching, isLoadingMore, hasMore, loadMore, retry,
  } = useProducts(category);

  const total = categories.reduce((sum, c) => sum + c.product_count, 0);
  const tabs = [{ slug: '', name: 'Todos', product_count: total }, ...categories];
  const busy = status === 'loading';

  return (
    <section id="productos" className="section product-grid" aria-labelledby="productos-title">
      <div className="container">
        <h2 id="productos-title" className="section__title">Productos destacados</h2>
        <p className="section__subtitle">Elige una categoría para explorar nuestro catálogo</p>

        {/* Phones: native select (opens the OS picker). Larger screens: tab buttons. Toggled in CSS. */}
        <div className="product-grid__select-wrapper">
          <label htmlFor="category-select" className="visually-hidden">Categoría</label>
          <select
            id="category-select"
            className="product-grid__select"
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
          >
            {tabs.map((tab) => (
              <option key={tab.slug} value={tab.slug}>
                {tab.name}{categories.length > 0 ? ` (${tab.product_count})` : ''}
              </option>
            ))}
          </select>
        </div>

        <div className="product-grid__tabs" role="tablist" aria-label="Categorías">
          {tabs.map((tab) => (
            <button
              key={tab.slug}
              type="button"
              role="tab"
              aria-selected={category === tab.slug}
              className={`product-grid__tab ${category === tab.slug ? 'product-grid__tab--active' : ''}`}
              onClick={() => onCategoryChange(tab.slug)}
            >
              {tab.name}
            </button>
          ))}
        </div>

        <div className={`product-grid__progress ${isSwitching ? 'product-grid__progress--active' : ''}`} aria-hidden="true" />

        {status === 'error' && (
          <div className="product-grid__message product-grid__message--error" role="alert">
            <p>No pudimos cargar los productos: {error}</p>
            <button type="button" className="button button--outline" onClick={retry}>Reintentar</button>
          </div>
        )}

        {isInitialLoading ? (
          <ul className="product-grid__list" aria-busy="true" aria-label="Cargando productos">
            {Array.from({ length: PAGE_SIZE }, (_, i) => (
              <li key={i} className="product-grid__skeleton" aria-hidden="true">
                <span className="product-grid__skeleton-media" />
                <span className="product-grid__skeleton-line product-grid__skeleton-line--short" />
                <span className="product-grid__skeleton-line" />
                <span className="product-grid__skeleton-line" />
              </li>
            ))}
          </ul>
        ) : (
          // Keyed by category: switching remounts the list so every card plays its entrance animation
          <ul
            key={shownCategory}
            className={`product-grid__list ${isSwitching ? 'product-grid__list--stale' : ''}`}
            aria-busy={busy}
          >
            {products.map((product, i) => (
              <li
                key={product.id}
                className="product-grid__item"
                style={{ '--stagger': i % PAGE_SIZE }}
              >
                <ProductCard product={product} />
              </li>
            ))}
          </ul>
        )}

        {status === 'success' && products.length === 0 && (
          <p className="product-grid__message">No hay productos en esta categoría.</p>
        )}

        {hasMore && status !== 'error' && !isInitialLoading && (
          <div className="product-grid__more">
            <button
              type="button"
              className="button button--outline product-grid__more-button"
              onClick={loadMore}
              disabled={busy}
            >
              {isLoadingMore && <span className="product-grid__spinner" aria-hidden="true" />}
              {isLoadingMore ? 'Cargando…' : 'Cargar más'}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
