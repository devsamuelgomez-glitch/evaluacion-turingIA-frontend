import { useEffect, useState } from 'react';
import Modal from '../Modal/Modal.jsx';
import { StarInput } from '../StarRating/StarRating.jsx';
import { createReview, getProducts } from '../../services/api.js';
import { fieldErrors, validateReview } from '../../utils/validation.js';

const MAX_COMMENT = 500;

export default function ReviewModal({ onClose, onCreated }) {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ productId: '', rating: 0, comment: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getProducts({ limit: 50, sort: 'name' })
      .then(({ data }) => setProducts(data))
      .catch(() => setFormError('No pudimos cargar los productos.'));
  }, []);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError('');
    const clientErrors = validateReview(form);
    setErrors(clientErrors);
    if (Object.keys(clientErrors).length) return;

    setSaving(true);
    try {
      const review = await createReview(form.productId, { rating: form.rating, comment: form.comment.trim() });
      onCreated(review);
    } catch (err) {
      setErrors(fieldErrors(err));
      setFormError(err.details ? 'Revisa los campos marcados.' : err.message);
      setSaving(false);
    }
  }

  return (
    <Modal
      title="Deja tu reseña"
      onClose={onClose}
      footer={
        <>
          <button type="button" className="button button--ghost" onClick={onClose}>Cancelar</button>
          <button type="submit" form="review-form" className="button button--primary" disabled={saving}>
            {saving ? 'Publicando…' : 'Publicar reseña'}
          </button>
        </>
      }
    >
      <form id="review-form" className="review-form" onSubmit={handleSubmit} noValidate>
        {formError && <p className="alert alert--error" role="alert">{formError}</p>}

        <div className="field">
          <label className="field__label" htmlFor="review-product">Producto</label>
          <select
            id="review-product"
            className={`field__input ${errors.productId ? 'field__input--invalid' : ''}`}
            value={form.productId}
            onChange={(e) => set('productId', e.target.value)}
            autoFocus
          >
            <option value="">Selecciona el producto que compraste…</option>
            {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          {errors.productId && <span className="field__error">{errors.productId}</span>}
        </div>

        <div className="field">
          <span className="field__label">Calificación</span>
          <StarInput value={form.rating} onChange={(n) => set('rating', n)} />
          {errors.rating && <span className="field__error">{errors.rating}</span>}
        </div>

        <div className="field">
          <label className="field__label" htmlFor="review-comment">Comentario</label>
          <textarea
            id="review-comment"
            className={`field__input ${errors.comment ? 'field__input--invalid' : ''}`}
            value={form.comment}
            onChange={(e) => set('comment', e.target.value)}
            maxLength={MAX_COMMENT}
            rows={4}
            placeholder="¿Qué te pareció el producto?"
          />
          <span className="field__hint review-form__counter">{form.comment.length}/{MAX_COMMENT}</span>
          {errors.comment && <span className="field__error">{errors.comment}</span>}
        </div>
      </form>
    </Modal>
  );
}
