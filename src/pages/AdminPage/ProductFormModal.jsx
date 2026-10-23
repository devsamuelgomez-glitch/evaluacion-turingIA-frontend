import { useEffect, useState } from 'react';
import Modal from '../../components/Modal/Modal.jsx';
import { createProduct, getProductImages, updateProduct } from '../../services/api.js';
import { fieldErrors, validateProduct } from '../../utils/validation.js';
import { toImagePath, toImageSrc } from '../../utils/images.js';

function initialForm(product) {
  if (!product) {
    return { name: '', description: '', price: '', stock: '', category_id: '', brand_id: '', image_url: '' };
  }
  return {
    name: product.name,
    description: product.description,
    price: String(product.price),
    stock: String(product.stock),
    category_id: String(product.category.id),
    brand_id: String(product.brand.id),
    image_url: toImagePath(product.image_url),
  };
}

export default function ProductFormModal({ product, categories, brands, onClose, onSaved }) {
  const isNew = !product;
  const [form, setForm] = useState(() => initialForm(product));
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [images, setImages] = useState([]);
  // Local library by default; external URL if the product already uses one
  const [imageMode, setImageMode] = useState(() => (form.image_url && !form.image_url.startsWith('/') ? 'url' : 'library'));

  useEffect(() => {
    getProductImages().then(setImages).catch(() => setImages([]));
  }, []);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  }

  const bind = (field) => ({
    id: `product-${field}`,
    value: form[field],
    onChange: (e) => set(field, e.target.value),
    className: `field__input ${errors[field] ? 'field__input--invalid' : ''}`,
    'aria-invalid': !!errors[field],
    'aria-describedby': errors[field] ? `product-${field}-error` : undefined,
  });

  const error = (field) => errors[field] && <span id={`product-${field}-error`} className="field__error">{errors[field]}</span>;

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError('');
    const clientErrors = validateProduct(form);
    setErrors(clientErrors);
    if (Object.keys(clientErrors).length) return;

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      stock: Number(form.stock),
      category_id: Number(form.category_id),
      brand_id: Number(form.brand_id),
      image_url: form.image_url.trim() || null,
    };

    setSaving(true);
    try {
      const saved = isNew ? await createProduct(payload) : await updateProduct(product.id, payload);
      onSaved(saved, isNew);
    } catch (err) {
      setErrors(fieldErrors(err));
      setFormError(err.details ? 'Revisa los campos marcados.' : err.message);
      setSaving(false);
    }
  }

  const previewSrc = toImageSrc(form.image_url);

  return (
    <Modal
      title={isNew ? 'Nuevo producto' : `Editar: ${product.name}`}
      onClose={onClose}
      size="lg"
      footer={
        <>
          <button type="button" className="button button--ghost" onClick={onClose}>Cancelar</button>
          <button type="submit" form="product-form" className="button button--primary" disabled={saving}>
            {saving ? 'Guardando…' : isNew ? 'Crear producto' : 'Guardar cambios'}
          </button>
        </>
      }
    >
      <form id="product-form" className="product-form" onSubmit={handleSubmit} noValidate>
        {formError && <p className="alert alert--error product-form__full" role="alert">{formError}</p>}

        <div className="field product-form__full">
          <label className="field__label" htmlFor="product-name">Nombre *</label>
          <input {...bind('name')} autoFocus maxLength={120} />
          {error('name')}
        </div>

        <div className="field product-form__full">
          <label className="field__label" htmlFor="product-description">Descripción</label>
          <textarea {...bind('description')} maxLength={1000} rows={3} />
          {error('description')}
        </div>

        <div className="field">
          <label className="field__label" htmlFor="product-price">Precio (MXN) *</label>
          <input {...bind('price')} type="number" min="0" step="0.01" inputMode="decimal" />
          {error('price')}
        </div>

        <div className="field">
          <label className="field__label" htmlFor="product-stock">Stock *</label>
          <input {...bind('stock')} type="number" min="0" step="1" inputMode="numeric" />
          {error('stock')}
        </div>

        <div className="field">
          <label className="field__label" htmlFor="product-category_id">Categoría *</label>
          <select {...bind('category_id')}>
            <option value="">Selecciona…</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          {error('category_id')}
        </div>

        <div className="field">
          <label className="field__label" htmlFor="product-brand_id">Marca *</label>
          <select {...bind('brand_id')}>
            <option value="">Selecciona…</option>
            {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          {error('brand_id')}
        </div>

        <fieldset className="product-form__image product-form__full">
          <legend className="field__label">Imagen</legend>
          <div className="product-form__image-layout">
            <div className="product-form__preview">
              {previewSrc ? <img src={previewSrc} alt="Vista previa" /> : <span>Sin imagen</span>}
            </div>

            <div className="product-form__image-picker">
              <div className="product-form__modes" role="tablist" aria-label="Origen de la imagen">
                <button type="button" role="tab" aria-selected={imageMode === 'library'} className={`product-form__mode ${imageMode === 'library' ? 'product-form__mode--active' : ''}`} onClick={() => setImageMode('library')}>Biblioteca</button>
                <button type="button" role="tab" aria-selected={imageMode === 'url'} className={`product-form__mode ${imageMode === 'url' ? 'product-form__mode--active' : ''}`} onClick={() => setImageMode('url')}>URL externa</button>
              </div>

              {imageMode === 'library' ? (
                <ul className="product-form__library" aria-label="Imágenes disponibles">
                  {images.map((img) => (
                    <li key={img.path}>
                      <button
                        type="button"
                        className={`product-form__thumb ${form.image_url === img.path ? 'product-form__thumb--selected' : ''}`}
                        onClick={() => set('image_url', img.path)}
                        aria-pressed={form.image_url === img.path}
                        title={img.name}
                      >
                        <img src={img.url} alt={img.name} loading="lazy" />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="field">
                  <label className="visually-hidden" htmlFor="product-image_url">URL de la imagen</label>
                  <input {...bind('image_url')} type="url" placeholder="https://…" />
                  {error('image_url')}
                </div>
              )}
              {form.image_url && (
                <button type="button" className="button button--ghost button--small" onClick={() => set('image_url', '')}>Quitar imagen</button>
              )}
            </div>
          </div>
        </fieldset>
      </form>
    </Modal>
  );
}
