import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getReviews } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { initials } from '../../utils/format.js';
import { StarRating } from '../StarRating/StarRating.jsx';
import ReviewModal from './ReviewModal.jsx';
import './Testimonials.css';

const COUNT = 3;

// Wireframe A highlights the middle circle, so the newest review goes in the center
const toWireframeOrder = (reviews) =>
  reviews.length === COUNT ? [reviews[1], reviews[0], reviews[2]] : reviews;

export default function Testimonials() {
  const { user } = useAuth();
  const toast = useToast();
  const [reviews, setReviews] = useState([]);
  const [status, setStatus] = useState('loading');
  const [writing, setWriting] = useState(false);

  const load = useCallback((signal) => {
    getReviews({ limit: COUNT, signal })
      .then((data) => { setReviews(data); setStatus('success'); })
      .catch((err) => { if (err.name !== 'AbortError') setStatus('error'); });
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load]);

  function handleCreated(review) {
    setWriting(false);
    toast.success(`¡Gracias por tu reseña de ${review.product.name}!`);
    load();
  }

  // Nothing useful to show if reviews can't be loaded
  if (status === 'error') return null;

  const newestId = reviews[0]?.id;

  return (
    <section id="opiniones" className="section testimonials" aria-labelledby="opiniones-title">
      <div className="container">
        <h2 id="opiniones-title" className="section__title">Lo que dicen nuestros clientes</h2>
        <p className="section__subtitle">Reseñas reales de nuestra comunidad</p>

        <ul className="testimonials__list" aria-busy={status === 'loading'}>
          {status === 'loading'
            ? Array.from({ length: COUNT }, (_, i) => (
                <li key={i} className={`testimonials__item testimonials__item--loading ${i === 1 ? 'testimonials__item--featured' : ''}`} aria-hidden="true">
                  <span className="testimonials__avatar" />
                  <span className="testimonials__line" />
                  <span className="testimonials__line testimonials__line--short" />
                </li>
              ))
            : toWireframeOrder(reviews).map((review, i) => (
                <li
                  key={review.id}
                  className={`testimonials__item ${review.id === newestId ? 'testimonials__item--featured' : ''}`}
                  style={{ '--stagger': i }}
                >
                  <figure className="testimonials__figure">
                    <div className="testimonials__avatar" aria-hidden="true">
                      {initials(review.user.name)}
                      <img className="testimonials__product-thumb" src={review.product.image_url} alt="" loading="lazy" />
                    </div>
                    <StarRating value={review.rating} size="sm" />
                    <blockquote className="testimonials__quote">“{review.comment}”</blockquote>
                    <figcaption className="testimonials__author">
                      {review.user.name}
                      <span className="testimonials__product">{review.product.name}</span>
                    </figcaption>
                  </figure>
                </li>
              ))}
        </ul>

        {status === 'success' && reviews.length === 0 && (
          <p className="testimonials__empty">Aún no hay reseñas. ¡Sé el primero en opinar!</p>
        )}

        <div className="testimonials__cta">
          {user ? (
            <button type="button" className="button button--primary" onClick={() => setWriting(true)}>Deja tu reseña</button>
          ) : (
            <p className="testimonials__login">
              <Link to="/login" state={{ from: '/' }} className="testimonials__login-link">Inicia sesión</Link> para dejar tu reseña.
            </p>
          )}
        </div>
      </div>

      {writing && <ReviewModal onClose={() => setWriting(false)} onCreated={handleCreated} />}
    </section>
  );
}
