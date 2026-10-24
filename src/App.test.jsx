import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router-dom';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import * as api from './services/api.js';
import { tokenExpiringIn } from './test/jwt.js';

vi.mock('./services/api.js', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    login: vi.fn(),
    register: vi.fn(),
    getMe: vi.fn(),
    getProducts: vi.fn(),
    getCategories: vi.fn(),
    getBrands: vi.fn(),
    getReviews: vi.fn(),
  };
});

const ADMIN = { id: 1, name: 'Administrador', email: 'admin@techstore.com', role: 'admin' };
const USER = { id: 2, name: 'Usuario Demo', email: 'user@techstore.com', role: 'user' };

function Location() {
  const location = useLocation();
  return <output data-testid="location">{location.pathname + location.search}</output>;
}

function renderApp(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AuthProvider>
        <ToastProvider>
          <App />
          <Location />
        </ToastProvider>
      </AuthProvider>
    </MemoryRouter>
  );
}

const currentPath = () => screen.getByTestId('location').textContent;
const saveSession = (user, token = tokenExpiringIn(3600, { role: user.role })) =>
  localStorage.setItem('techstore.session', JSON.stringify({ user, token }));

beforeEach(() => {
  api.getProducts.mockResolvedValue({ data: [], pagination: { page: 1, limit: 6, total: 0, totalPages: 0 } });
  api.getCategories.mockResolvedValue([]);
  api.getBrands.mockResolvedValue([]);
  api.getReviews.mockResolvedValue([]);
  globalThis.IntersectionObserver ??= class { observe() {} unobserve() {} disconnect() {} };
  Element.prototype.scrollIntoView ??= () => {};
});

describe('login obligatorio', () => {
  it.each(['/', '/admin', '/admin?tab=x', '/no-existe'])('sin sesión, %s muestra la pantalla de login', async (path) => {
    renderApp(path);
    expect(await screen.findByRole('heading', { name: 'Inicia sesión' })).toBeInTheDocument();
    expect(currentPath()).toBe('/login');
    expect(screen.queryByRole('banner')).not.toBeInTheDocument();
  });

  it('los botones de cuentas de prueba llenan el formulario', async () => {
    renderApp('/login');
    await userEvent.click(screen.getByRole('button', { name: /cuenta de prueba Admin/ }));
    expect(screen.getByLabelText('Correo electrónico')).toHaveValue('admin@techstore.com');
    expect(screen.getByLabelText('Contraseña')).toHaveValue('Admin123!');
  });

  it('valida en el cliente antes de llamar a la API', async () => {
    renderApp('/login');
    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }));
    expect(screen.getByText('Ingresa un correo válido')).toBeInTheDocument();
    expect(screen.getByText('Ingresa tu contraseña')).toBeInTheDocument();
    expect(api.login).not.toHaveBeenCalled();
  });

  it('muestra el error de la API con credenciales incorrectas', async () => {
    api.login.mockRejectedValue(Object.assign(new Error('Credenciales incorrectas'), { status: 401 }));
    renderApp('/login');
    await userEvent.type(screen.getByLabelText('Correo electrónico'), 'admin@techstore.com');
    await userEvent.type(screen.getByLabelText('Contraseña'), 'mala');
    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Credenciales incorrectas');
  });

  it('después del login regresa a la página pedida', async () => {
    api.login.mockResolvedValue({ user: ADMIN, token: tokenExpiringIn(3600, { role: 'admin' }) });
    renderApp('/admin?tab=x');
    await screen.findByRole('heading', { name: 'Inicia sesión' });
    await userEvent.click(screen.getByRole('button', { name: /cuenta de prueba Admin/ }));
    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }));
    await waitFor(() => expect(currentPath()).toBe('/admin?tab=x'));
    expect(JSON.parse(localStorage.getItem('techstore.session')).user.email).toBe('admin@techstore.com');
  });

  it('si el servidor tarda (arranque en frío), avisa que se está despertando', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    try {
      api.login.mockReturnValue(new Promise(() => {}));
      renderApp('/login');
      await userEvent.click(screen.getByRole('button', { name: /cuenta de prueba Usuario/ }));
      await userEvent.click(screen.getByRole('button', { name: 'Entrar' }));
      expect(screen.getByRole('button', { name: 'Un momento…' })).toBeDisabled();
      expect(screen.queryByText(/Despertando el servidor/)).not.toBeInTheDocument();
      await vi.advanceTimersByTimeAsync(4500);
      expect(await screen.findByText(/Despertando el servidor/)).toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it('un user que pidió /admin termina en la tienda', async () => {
    api.login.mockResolvedValue({ user: USER, token: tokenExpiringIn(3600) });
    renderApp('/admin');
    await screen.findByRole('heading', { name: 'Inicia sesión' });
    await userEvent.click(screen.getByRole('button', { name: /cuenta de prueba Usuario/ }));
    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }));
    await waitFor(() => expect(currentPath()).toBe('/'));
  });
});

describe('con sesión', () => {
  it('una sesión guardada válida entra directo a la tienda con el header', async () => {
    saveSession(USER);
    api.getMe.mockResolvedValue(USER);
    renderApp('/');
    const header = await screen.findByRole('banner');
    expect(within(header).getByText('Usuario')).toBeInTheDocument();
    expect(within(header).queryByText('Panel admin')).not.toBeInTheDocument();
    expect(currentPath()).toBe('/');
  });

  it('un user en /admin ve el aviso 403', async () => {
    saveSession(USER);
    api.getMe.mockResolvedValue(USER);
    renderApp('/admin');
    expect(await screen.findByText('No tienes permiso para ver esta página')).toBeInTheDocument();
  });

  it('cerrar sesión lleva al login y borra la sesión', async () => {
    saveSession(USER);
    api.getMe.mockResolvedValue(USER);
    renderApp('/');
    await userEvent.click(await screen.findByRole('button', { name: 'Cerrar sesión' }));
    await waitFor(() => expect(currentPath()).toBe('/login'));
    expect(localStorage.getItem('techstore.session')).toBeNull();
    expect(screen.queryByText(/Tu sesión expiró/)).not.toBeInTheDocument();
  });

  it('un token vencido guardado se descarta sin llamar a la API y avisa', async () => {
    saveSession(ADMIN, tokenExpiringIn(-60, { role: 'admin' }));
    renderApp('/admin');
    expect(await screen.findByText(/Tu sesión expiró/)).toBeInTheDocument();
    expect(api.getMe).not.toHaveBeenCalled();
    expect(localStorage.getItem('techstore.session')).toBeNull();
  });

  it('si la API rechaza el token guardado (401) se cierra la sesión', async () => {
    saveSession(ADMIN);
    api.getMe.mockRejectedValue(Object.assign(new Error('Token inválido o expirado'), { status: 401 }));
    renderApp('/admin');
    expect(await screen.findByText(/Tu sesión expiró/)).toBeInTheDocument();
    expect(currentPath()).toBe('/login');
  });

  it('la sesión se cierra sola cuando el token expira', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    try {
      saveSession(USER, tokenExpiringIn(5));
      api.getMe.mockResolvedValue(USER);
      renderApp('/');
      await screen.findByRole('banner');
      await vi.advanceTimersByTimeAsync(6000);
      await waitFor(() => expect(currentPath()).toBe('/login'));
      expect(screen.getByText(/Tu sesión expiró/)).toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });
});
