// Builds an unsigned JWT-shaped token for tests (the client never verifies signatures)
const base64url = (obj) => btoa(JSON.stringify(obj)).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');

export const fakeToken = (payload) => `${base64url({ alg: 'HS256', typ: 'JWT' })}.${base64url(payload)}.firma`;

export const tokenExpiringIn = (seconds, payload = {}) =>
  fakeToken({ sub: 1, role: 'user', ...payload, exp: Math.floor(Date.now() / 1000) + seconds });
