const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

async function request(path, { token, ...options } = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  if (response.status === 204) return null;

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(body.error || `Error ${response.status}`);
    error.status = response.status;
    error.details = body.details;
    throw error;
  }
  return body;
}

export function getProducts({ category, page = 1, limit = 6, signal } = {}) {
  const params = new URLSearchParams({ page, limit });
  if (category) params.set('category', category);
  return request(`/products?${params}`, { signal });
}

export function getCategories({ signal } = {}) {
  return request('/categories', { signal });
}
