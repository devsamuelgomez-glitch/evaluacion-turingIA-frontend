import { describe, expect, it } from 'vitest';
import { fieldErrors, validateLogin, validateProduct, validateRegister, validateReview } from './validation.js';
import { formatPrice, initials } from './format.js';
import { safeRedirect } from './redirect.js';
import { isExpired, tokenExpiry } from './jwt.js';
import { toImagePath, toImageSrc } from './images.js';
import { fakeToken } from '../test/jwt.js';

const admin = { role: 'admin' };
const user = { role: 'user' };

describe('validateLogin / validateRegister', () => {
  it('sin errores con datos válidos (ignora espacios en el correo)', () => {
    expect(validateLogin({ email: ' admin@techstore.com ', password: 'x' })).toEqual({});
    expect(validateRegister({ name: 'Ana', email: 'ana@mail.com', password: 'Password1' })).toEqual({});
  });

  it('marca correo inválido y contraseña vacía', () => {
    expect(validateLogin({ email: 'no-es-correo', password: '' })).toEqual({
      email: 'Ingresa un correo válido',
      password: 'Ingresa tu contraseña',
    });
  });

  it('aplica las mismas reglas de contraseña que la API, una a la vez', () => {
    const base = { name: 'Ana', email: 'ana@mail.com' };
    expect(validateRegister({ ...base, password: 'corta' }).password).toBe('Mínimo 8 caracteres');
    expect(validateRegister({ ...base, password: 'sinmayuscula1' }).password).toBe('Incluye al menos una mayúscula');
    expect(validateRegister({ ...base, password: 'SinNumeros' }).password).toBe('Incluye al menos un número');
  });
});

describe('validateProduct', () => {
  const valid = { name: 'Laptop', price: '100', stock: '3', category_id: '1', brand_id: '2' };

  it('acepta un formulario válido (los inputs llegan como texto)', () => {
    expect(validateProduct(valid)).toEqual({});
  });

  it('rechaza precio negativo o vacío, stock decimal y selects vacíos', () => {
    const errors = validateProduct({ name: 'L', price: '-1', stock: '1.5', category_id: '', brand_id: '' });
    expect(Object.keys(errors).sort()).toEqual(['brand_id', 'category_id', 'name', 'price', 'stock']);
    expect(validateProduct({ ...valid, price: '' }).price).toBeDefined();
  });
});

describe('validateReview / fieldErrors', () => {
  it('pide producto, calificación y comentario de 3+ caracteres', () => {
    expect(Object.keys(validateReview({ productId: '', rating: 0, comment: ' a ' }))).toEqual(['productId', 'rating', 'comment']);
  });

  it('convierte los detalles de la API en { campo: mensaje }', () => {
    const error = { details: [{ field: 'price', message: 'El precio no puede ser negativo' }] };
    expect(fieldErrors(error)).toEqual({ price: 'El precio no puede ser negativo' });
    expect(fieldErrors(new Error('x'))).toEqual({});
  });
});

describe('format', () => {
  it('precio en pesos mexicanos sin decimales', () => {
    expect(formatPrice(42999)).toMatch(/^\$42,999$/);
  });

  it('iniciales de hasta dos palabras', () => {
    expect(initials('ana maría torres')).toBe('AM');
    expect(initials('Luis')).toBe('L');
  });
});

describe('safeRedirect', () => {
  it('sin destino: admin al panel, user a la tienda', () => {
    expect(safeRedirect(undefined, admin)).toBe('/admin');
    expect(safeRedirect(undefined, user)).toBe('/');
  });

  it('respeta rutas internas con query y hash', () => {
    expect(safeRedirect('/admin?tab=x', admin)).toBe('/admin?tab=x');
    expect(safeRedirect('/#opiniones', user)).toBe('/#opiniones');
  });

  it('bloquea redirecciones abiertas a otros sitios', () => {
    for (const from of ['//evil.example', '/\\evil.example', 'https://evil.example', 'javascript:alert(1)']) {
      expect(safeRedirect(from, user)).toBe('/');
    }
  });

  it('un user que venía de /admin va a la tienda', () => {
    expect(safeRedirect('/admin', user)).toBe('/');
  });
});

describe('jwt', () => {
  it('lee exp en milisegundos', () => {
    expect(tokenExpiry(fakeToken({ exp: 1700000000 }))).toBe(1700000000000);
  });

  it('token vencido, sin exp o malformado se considera expirado', () => {
    const now = 1700000000000;
    expect(isExpired(fakeToken({ exp: 1700000001 }), now)).toBe(false);
    expect(isExpired(fakeToken({ exp: 1699999999 }), now)).toBe(true);
    expect(isExpired(fakeToken({ sub: 1 }), now)).toBe(true);
    expect(isExpired('basura', now)).toBe(true);
  });
});

describe('images', () => {
  it('URL local de la API ⇄ ruta /images guardada en la BD', () => {
    const src = toImageSrc('/images/products/a.webp');
    expect(src).toBe('http://localhost:4000/images/products/a.webp');
    expect(toImagePath(src)).toBe('/images/products/a.webp');
  });

  it('deja intactas las URLs externas', () => {
    expect(toImagePath('https://cdn.example.com/a.png')).toBe('https://cdn.example.com/a.png');
    expect(toImageSrc('https://cdn.example.com/a.png')).toBe('https://cdn.example.com/a.png');
  });
});
