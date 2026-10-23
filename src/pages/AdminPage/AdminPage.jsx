import { useCallback, useEffect, useState } from 'react';
import { getBrands, getCategories, getProducts } from '../../services/api.js';
import { useDebouncedValue } from '../../hooks/useDebouncedValue.js';
import { useToast } from '../../context/ToastContext.jsx';
import { formatPrice } from '../../utils/format.js';
import ProductFormModal from './ProductFormModal.jsx';
import DeleteProductModal from './DeleteProductModal.jsx';
import './AdminPage.css';

const PAGE_SIZE = 8;
const LOW_STOCK = 5;

function StockBadge({ stock }) {
  if (stock === 0) return <span className="admin-badge admin-badge--danger">Agotado</span>;
  if (stock < LOW_STOCK) return <span className="admin-badge admin-badge--warning">{stock} · bajo</span>;
  return <span className="admin-badge">{stock}</span>;
}

export default function AdminPage() {
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search.trim());

  const [result, setResult] = useState({ data: [], pagination: { total: 0, totalPages: 0 } });
  const [status, setStatus] = useState('loading');
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  // Bumped after every create/update/delete to refetch the table and the stats
  const [version, setVersion] = useState(0);
  const [editing, setEditing] = useState(null); // null | 'new' | product
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    Promise.all([getCategories(), getBrands()])
      .then(([cats, brs]) => { setCategories(cats); setBrands(brs); })
      .catch(() => toast.error('No se pudieron cargar categorías y marcas'));
  }, [version, toast]);

  useEffect(() => {
    const controller = new AbortController();
    setStatus('loading');
    getProducts({ search: debouncedSearch, category, sort, page, limit: PAGE_SIZE, signal: controller.signal })
      .then((data) => { setResult(data); setStatus('success'); })
      .catch((err) => { if (err.name !== 'AbortError') setStatus('error'); });
    return () => controller.abort();
  }, [debouncedSearch, category, sort, page, version]);

  // Any filter change goes back to the first page
  useEffect(() => { setPage(1); }, [debouncedSearch, category, sort]);

  const refresh = useCallback(() => setVersion((v) => v + 1), []);

  function handleSaved(product, isNew) {
    setEditing(null);
    toast.success(isNew ? `"${product.name}" creado` : `"${product.name}" actualizado`);
    refresh();
  }

  function handleDeleted(product) {
    setDeleting(null);
    toast.success(`"${product.name}" eliminado`);
    // If we deleted the last row of the last page, step back a page
    if (result.data.length === 1 && page > 1) setPage((p) => p - 1);
    refresh();
  }

  const { data: products, pagination } = result;
  const totalProducts = categories.reduce((sum, c) => sum + c.product_count, 0);
  const hasFilters = Boolean(debouncedSearch || category);

  return (
    <main className="admin">
      <div className="container">
        <header className="admin__header">
          <div>
            <p className="admin__eyebrow">Panel de administración</p>
            <h1 className="admin__title">Productos</h1>
          </div>
          <button type="button" className="button button--primary" onClick={() => setEditing('new')}>
            + Nuevo producto
          </button>
        </header>

        <section className="admin__stats" aria-label="Resumen del catálogo">
          <div className="admin-stat"><span className="admin-stat__value">{totalProducts}</span><span className="admin-stat__label">Productos</span></div>
          <div className="admin-stat"><span className="admin-stat__value">{categories.length}</span><span className="admin-stat__label">Categorías</span></div>
          <div className="admin-stat"><span className="admin-stat__value">{brands.length}</span><span className="admin-stat__label">Marcas</span></div>
        </section>

        <section className="admin__panel" aria-label="Listado de productos">
          <div className="admin__filters">
            <div className="field admin__search">
              <label className="visually-hidden" htmlFor="admin-search">Buscar producto</label>
              <input id="admin-search" type="search" className="field__input" placeholder="Buscar por nombre o descripción…" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className="field">
              <label className="visually-hidden" htmlFor="admin-category">Categoría</label>
              <select id="admin-category" className="field__input" value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="">Todas las categorías</option>
                {categories.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
              </select>
            </div>
            <div className="field">
              <label className="visually-hidden" htmlFor="admin-sort">Ordenar</label>
              <select id="admin-sort" className="field__input" value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="newest">Más recientes</option>
                <option value="name">Nombre (A-Z)</option>
                <option value="price_asc">Precio: menor a mayor</option>
                <option value="price_desc">Precio: mayor a menor</option>
              </select>
            </div>
          </div>

          {status === 'error' && (
            <div className="admin__empty" role="alert">
              <p>No pudimos cargar los productos.</p>
              <button type="button" className="button button--outline button--small" onClick={refresh}>Reintentar</button>
            </div>
          )}

          {status !== 'error' && (
            <div className={`admin-table__wrapper ${status === 'loading' ? 'admin-table__wrapper--loading' : ''}`} aria-busy={status === 'loading'}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th scope="col">Producto</th>
                    <th scope="col">Categoría</th>
                    <th scope="col">Marca</th>
                    <th scope="col" className="admin-table__num">Precio</th>
                    <th scope="col" className="admin-table__num">Stock</th>
                    <th scope="col"><span className="visually-hidden">Acciones</span></th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td data-label="Producto">
                        <div className="admin-table__product">
                          <img className="admin-table__thumb" src={product.image_url} alt="" loading="lazy" />
                          <div>
                            <p className="admin-table__name">{product.name}</p>
                            <p className="admin-table__id">ID {product.id}{product.rating ? ` · ★ ${product.rating} (${product.review_count})` : ''}</p>
                          </div>
                        </div>
                      </td>
                      <td data-label="Categoría">{product.category.name}</td>
                      <td data-label="Marca">{product.brand.name}</td>
                      <td data-label="Precio" className="admin-table__num">{formatPrice(product.price)}</td>
                      <td data-label="Stock" className="admin-table__num"><StockBadge stock={product.stock} /></td>
                      <td className="admin-table__actions">
                        <button type="button" className="button button--ghost button--small" onClick={() => setEditing(product)} aria-label={`Editar ${product.name}`}>Editar</button>
                        <button type="button" className="button button--ghost button--small admin-table__delete" onClick={() => setDeleting(product)} aria-label={`Eliminar ${product.name}`}>Eliminar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {status === 'success' && products.length === 0 && (
                <div className="admin__empty">
                  <p>{hasFilters ? 'Ningún producto coincide con los filtros.' : 'Aún no hay productos.'}</p>
                  {hasFilters && (
                    <button type="button" className="button button--outline button--small" onClick={() => { setSearch(''); setCategory(''); }}>Limpiar filtros</button>
                  )}
                </div>
              )}
            </div>
          )}

          {pagination.totalPages > 1 && (
            <nav className="admin__pagination" aria-label="Paginación">
              <button type="button" className="button button--outline button--small" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>← Anterior</button>
              <span className="admin__page-info">Página {page} de {pagination.totalPages} · {pagination.total} productos</span>
              <button type="button" className="button button--outline button--small" disabled={page >= pagination.totalPages} onClick={() => setPage((p) => p + 1)}>Siguiente →</button>
            </nav>
          )}
        </section>
      </div>

      {editing && (
        <ProductFormModal
          product={editing === 'new' ? null : editing}
          categories={categories}
          brands={brands}
          onClose={() => setEditing(null)}
          onSaved={handleSaved}
        />
      )}

      {deleting && (
        <DeleteProductModal product={deleting} onClose={() => setDeleting(null)} onDeleted={handleDeleted} />
      )}
    </main>
  );
}
