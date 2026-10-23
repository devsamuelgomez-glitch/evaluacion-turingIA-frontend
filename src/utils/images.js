import { API_ORIGIN } from '../services/api.js';

/**
 * The API returns local images as absolute URLs but stores them as paths (/images/...),
 * so the same database works on any host. Convert back before saving a product.
 */
export function toImagePath(url) {
  if (!url) return '';
  return url.startsWith(`${API_ORIGIN}/images/`) ? url.slice(API_ORIGIN.length) : url;
}

/** URL to display for a stored value (local path or external URL). */
export function toImageSrc(value) {
  if (!value) return '';
  return value.startsWith('/') ? `${API_ORIGIN}${value}` : value;
}
