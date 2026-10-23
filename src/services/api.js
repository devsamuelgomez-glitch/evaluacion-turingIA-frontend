const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
export const API_ORIGIN = new URL(API_URL).origin;

let authToken = null;
let onUnauthorized = null;

/** Set by AuthContext: the token sent with every request. */
export function setAuthToken(token) {
  authToken = token;
}

/** Set by AuthContext: called when an authenticated request gets a 401 (expired/invalid token). */
export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler;
}

async function request(path, { body, ...options } = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(authToken && { Authorization: `Bearer ${authToken}` }),
      ...options.headers,
    },
    ...(body !== undefined && { body: JSON.stringify(body) }),
  });

  if (response.status === 204) return null;

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401 && authToken) onUnauthorized?.();
    const error = new Error(data.error || `Error ${response.status}`);
    error.status = response.status;
    error.details = data.details;
    throw error;
  }
  return data;
}

function toQuery(params) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') query.set(key, value);
  }
  return query.toString();
}

// Auth
export const login = (credentials) => request('/auth/login', { method: 'POST', body: credentials });
export const register = (data) => request('/auth/register', { method: 'POST', body: data });
export const getMe = () => request('/auth/me');

// Catalog
export function getProducts({ category, search, sort, page = 1, limit = 6, signal } = {}) {
  return request(`/products?${toQuery({ category, search, sort, page, limit })}`, { signal });
}
export const getCategories = ({ signal } = {}) => request('/categories', { signal });
export const getBrands = ({ signal } = {}) => request('/brands', { signal });

// Admin
export const createProduct = (data) => request('/products', { method: 'POST', body: data });
export const updateProduct = (id, data) => request(`/products/${id}`, { method: 'PUT', body: data });
export const deleteProduct = (id) => request(`/products/${id}`, { method: 'DELETE' });
export const getProductImages = () => request('/images');

// Reviews
export const getReviews = ({ limit = 3, signal } = {}) => request(`/reviews?${toQuery({ limit })}`, { signal });
export const createReview = (productId, data) => request(`/products/${productId}/reviews`, { method: 'POST', body: data });
