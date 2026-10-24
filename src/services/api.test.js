import { afterEach, describe, expect, it, vi } from 'vitest';
import * as api from './api.js';

const respond = (status, body) =>
  vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(body === undefined ? null : JSON.stringify(body), { status }));

afterEach(() => {
  api.setAuthToken(null);
  api.setUnauthorizedHandler(null);
});

describe('cliente de la API', () => {
  it('envía el token como Bearer y arma los query params sin valores vacíos', async () => {
    const fetchMock = respond(200, { data: [], pagination: {} });
    api.setAuthToken('abc');
    await api.getProducts({ category: 'audio', search: '', page: 2 });

    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe('http://localhost:4000/api/products?category=audio&page=2&limit=6');
    expect(options.headers.Authorization).toBe('Bearer abc');
  });

  it('serializa el body como JSON', async () => {
    const fetchMock = respond(201, { id: 1 });
    await api.createReview(5, { rating: 4, comment: 'Bien' });
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe('http://localhost:4000/api/products/5/reviews');
    expect(options.method).toBe('POST');
    expect(JSON.parse(options.body)).toEqual({ rating: 4, comment: 'Bien' });
  });

  it('204 devuelve null', async () => {
    respond(204);
    await expect(api.deleteProduct(1)).resolves.toBeNull();
  });

  it('los errores incluyen status y detalles por campo', async () => {
    respond(400, { error: 'Datos inválidos', details: [{ field: 'price', message: 'Negativo' }] });
    await expect(api.createProduct({})).rejects.toMatchObject({
      message: 'Datos inválidos',
      status: 400,
      details: [{ field: 'price', message: 'Negativo' }],
    });
  });

  it('un 401 con sesión llama al handler (cierra la sesión)', async () => {
    const handler = vi.fn();
    api.setUnauthorizedHandler(handler);
    api.setAuthToken('vencido');
    respond(401, { error: 'Token inválido o expirado' });
    await expect(api.getMe()).rejects.toMatchObject({ status: 401 });
    expect(handler).toHaveBeenCalledOnce();
  });

  it('un 401 sin sesión (credenciales incorrectas) no llama al handler', async () => {
    const handler = vi.fn();
    api.setUnauthorizedHandler(handler);
    respond(401, { error: 'Credenciales incorrectas' });
    await expect(api.login({ email: 'a@b.com', password: 'x' })).rejects.toThrow('Credenciales incorrectas');
    expect(handler).not.toHaveBeenCalled();
  });
});
