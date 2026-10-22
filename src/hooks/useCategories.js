import { useEffect, useState } from 'react';
import { getCategories } from '../services/api.js';

/** Loads the category list once. Shared by the product tabs and the gallery. */
export function useCategories() {
  const [categories, setCategories] = useState([]);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    const controller = new AbortController();
    getCategories({ signal: controller.signal })
      .then((data) => {
        setCategories(data);
        setStatus('success');
      })
      .catch((err) => {
        if (err.name !== 'AbortError') setStatus('error');
      });
    return () => controller.abort();
  }, []);

  return { categories, status };
}
