// Expiry time (ms) from the JWT payload. Only read to schedule the logout: the API verifies the signature.
export function tokenExpiry(token) {
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const { exp } = JSON.parse(atob(payload));
    return typeof exp === 'number' ? exp * 1000 : null;
  } catch {
    return null;
  }
}

export function isExpired(token, now = Date.now()) {
  const expiry = tokenExpiry(token);
  return expiry === null || expiry <= now;
}
