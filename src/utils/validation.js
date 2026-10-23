// Client-side checks that mirror the API's Zod schemas, so users get instant feedback.
// The API still validates everything; its 400 errors are mapped back with fieldErrors().

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateLogin({ email, password }) {
  const errors = {};
  if (!EMAIL.test(email.trim())) errors.email = 'Ingresa un correo válido';
  if (!password) errors.password = 'Ingresa tu contraseña';
  return errors;
}

export function validateRegister({ name, email, password }) {
  const errors = {};
  if (name.trim().length < 2) errors.name = 'El nombre debe tener al menos 2 caracteres';
  if (!EMAIL.test(email.trim())) errors.email = 'Ingresa un correo válido';
  if (password.length < 8) errors.password = 'Mínimo 8 caracteres';
  else if (!/[A-Z]/.test(password)) errors.password = 'Incluye al menos una mayúscula';
  else if (!/[0-9]/.test(password)) errors.password = 'Incluye al menos un número';
  return errors;
}

export function validateProduct(form) {
  const errors = {};
  if (form.name.trim().length < 2) errors.name = 'El nombre debe tener al menos 2 caracteres';
  if (form.price === '' || Number(form.price) < 0 || Number.isNaN(Number(form.price))) errors.price = 'Ingresa un precio válido (0 o más)';
  if (form.stock === '' || !Number.isInteger(Number(form.stock)) || Number(form.stock) < 0) errors.stock = 'El stock debe ser un entero (0 o más)';
  if (!form.category_id) errors.category_id = 'Elige una categoría';
  if (!form.brand_id) errors.brand_id = 'Elige una marca';
  return errors;
}

export function validateReview({ productId, rating, comment }) {
  const errors = {};
  if (!productId) errors.productId = 'Elige un producto';
  if (!rating) errors.rating = 'Elige una calificación';
  if (comment.trim().length < 3) errors.comment = 'Escribe al menos 3 caracteres';
  return errors;
}

/** Maps the API's `details: [{ field, message }]` to `{ field: message }`. */
export function fieldErrors(error) {
  return Object.fromEntries((error.details ?? []).map((d) => [d.field, d.message]));
}
