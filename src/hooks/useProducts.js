import { useCallback, useEffect, useState } from 'react';
import { getProducts } from '../services/api.js';

export const PAGE_SIZE = 6;
const PRELOAD_TIMEOUT_MS = 1500;

/** Resolves once every image is decoded (or failed), or after the timeout. */
function preloadImages(urls) {
  const loads = urls.filter(Boolean).map((src) => {
    const img = new Image();
    img.src = src;
    return img.decode().catch(() => {});
  });
  const timeout = new Promise((resolve) => setTimeout(resolve, PRELOAD_TIMEOUT_MS));
  return Promise.race([Promise.all(loads), timeout]);
}

/**
 * Loads products for a category, accumulating pages when loadMore is called.
 * When the category changes, the previous products stay on screen until the
 * new ones (and their images) are ready, so the grid never collapses.
 */
export function useProducts(category) {
  const [query, setQuery] = useState({ category, page: 1 });
  const [products, setProducts] = useState([]);
  // Category of the products currently on screen (lags behind while switching)
  const [shownCategory, setShownCategory] = useState(category);
  const [totalPages, setTotalPages] = useState(0);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);

  // Reset during render when the category changes, so we never fetch
  // the new category with the previous page number.
  if (query.category !== category) {
    setQuery({ category, page: 1 });
  }

  useEffect(() => {
    const controller = new AbortController();
    setStatus('loading');
    setError(null);

    getProducts({ category: query.category, page: query.page, limit: PAGE_SIZE, signal: controller.signal })
      .then(async ({ data, pagination }) => {
        await preloadImages(data.map((p) => p.image_url));
        if (controller.signal.aborted) return;
        setProducts((prev) => (query.page === 1 ? data : [...prev, ...data]));
        setShownCategory(query.category);
        setTotalPages(pagination.totalPages);
        setStatus('success');
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        if (query.page === 1) setProducts([]);
        setError(err.message);
        setStatus('error');
      });

    return () => controller.abort();
  }, [query]);

  const loadMore = useCallback(() => setQuery((q) => ({ ...q, page: q.page + 1 })), []);
  const retry = useCallback(() => setQuery((q) => ({ ...q })), []);

  const loading = status === 'loading';

  return {
    products,
    shownCategory,
    status,
    error,
    isInitialLoading: loading && products.length === 0,
    isSwitching: loading && query.page === 1 && products.length > 0,
    isLoadingMore: loading && query.page > 1,
    hasMore: query.page < totalPages,
    loadMore,
    retry,
  };
}
