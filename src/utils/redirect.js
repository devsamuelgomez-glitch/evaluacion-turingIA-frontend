export const homeFor = (user) => (user.role === 'admin' ? '/admin' : '/');

/**
 * Where to go after signing in. Only same-app paths are accepted ("//host" or "/\host" would leave
 * the site), and /admin is only a valid destination for admins.
 */
export function safeRedirect(from, user) {
  if (typeof from !== 'string' || !from.startsWith('/') || from.startsWith('//') || from.startsWith('/\\')) {
    return homeFor(user);
  }
  if (from.startsWith('/admin') && user.role !== 'admin') return '/';
  return from;
}
