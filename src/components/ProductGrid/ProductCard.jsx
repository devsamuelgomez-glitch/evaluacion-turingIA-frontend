import { formatPrice } from '../../utils/format.js';
import './ProductCard.css';

export default function ProductCard({ product }) {
  const { name, description, price, stock, image_url, rating, review_count, category, brand } = product;

  return (
    <article className="product-card">
      <div className="product-card__media">
        <img className="product-card__image" src={image_url} alt={name} loading="lazy" width="600" height="400" />
      </div>

      <div className="product-card__body">
        <div className="product-card__meta">
          <span className="product-card__category">{category.name}</span>
          <span className="product-card__brand">{brand.name}</span>
        </div>
        <h3 className="product-card__name">{name}</h3>
        <p className="product-card__description">{description}</p>
      </div>

      <footer className="product-card__footer">
        <span className="product-card__price">{formatPrice(price)}</span>
        <span className="product-card__info">
          {rating ? `★ ${rating} (${review_count})` : stock > 0 ? `${stock} disponibles` : 'Agotado'}
        </span>
      </footer>
    </article>
  );
}
