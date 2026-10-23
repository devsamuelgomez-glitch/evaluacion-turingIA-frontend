import { useState } from 'react';
import Modal from '../../components/Modal/Modal.jsx';
import { deleteProduct } from '../../services/api.js';

export default function DeleteProductModal({ product, onClose, onDeleted }) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  async function handleDelete() {
    setDeleting(true);
    setError('');
    try {
      await deleteProduct(product.id);
      onDeleted(product);
    } catch (err) {
      setError(err.message);
      setDeleting(false);
    }
  }

  return (
    <Modal
      title="Eliminar producto"
      onClose={onClose}
      size="sm"
      footer={
        <>
          <button type="button" className="button button--ghost" onClick={onClose} autoFocus>Cancelar</button>
          <button type="button" className="button button--danger" onClick={handleDelete} disabled={deleting}>
            {deleting ? 'Eliminando…' : 'Sí, eliminar'}
          </button>
        </>
      }
    >
      <div className="delete-confirm">
        <img className="delete-confirm__image" src={product.image_url} alt="" />
        <p>
          ¿Seguro que quieres eliminar <strong>{product.name}</strong>?
          {product.review_count > 0 && ` También se borrarán sus ${product.review_count} reseña(s).`} Esta acción no se puede deshacer.
        </p>
      </div>
      {error && <p className="alert alert--error" role="alert">{error}</p>}
    </Modal>
  );
}
