/**
 * Tests para LoginPage (SMAPP-13 / HU2).
 *
 * Criterios de aceptación:
 * - Renderiza campo email, contraseña y botón submit
 * - Si ya está autenticado, redirige al dashboard sin mostrar el form
 * - No llama a login si email o contraseña están vacíos
 * - Submit exitoso redirige al dashboard del rol correspondiente
 * - Error 401 muestra mensaje de credenciales inválidas
 * - Botón deshabilitado mientras isLoading es true
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import useAuthStore from '../../hooks/useAuthStore';

vi.mock('../../../domain/user/User.js', () => ({
  isNetworkError: vi.fn(),
}));

import { isNetworkError } from '../../../domain/user/User.js';

vi.mock('../../hooks/useAuthStore');

const mockLogin = vi.fn();

/**
 * Configura el mock de useAuthStore para que soporte selectores (s) => s.x
 * y también llamadas directas que retornen todo el estado.
 */
function mockStore({ user = null, isLoading = false } = {}) {
  const state = { user, isLoading, login: mockLogin };
  useAuthStore.mockImplementation((selector) =>
    typeof selector === 'function' ? selector(state) : state,
  );
  useAuthStore.getState = () => state;
}

/** Renderiza LoginPage dentro de un router con rutas stub para dashboards */
async function renderLogin({ user = null, isLoading = false } = {}) {
  mockStore({ user, isLoading });

  const { default: LoginPage } = await import('./LoginPage');

  render(
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/student" element={<div>StudentDashboard</div>} />
        <Route path="/ngo" element={<div>NgoDashboard</div>} />
        <Route path="/admin" element={<div>AdminDashboard</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  isNetworkError.mockReturnValue(false);
});

describe('estructura del formulario', () => {
  it('renderiza campo email, contraseña y botón submit', async () => {
    await renderLogin();

    expect(screen.getByLabelText(/email/i)).toBeTruthy();
    expect(screen.getByLabelText(/contraseña/i)).toBeTruthy();
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeTruthy();
  });

  it('redirige al dashboard si el usuario ya está autenticado', async () => {
    await renderLogin({ user: { role: 'student' } });

    expect(screen.getByText('StudentDashboard')).toBeTruthy();
  });
});

describe('validación en cliente', () => {
  it('no llama a login si el email está vacío', async () => {
    await renderLogin();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/contraseña/i), '123456');
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }));

    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('no llama a login si la contraseña está vacía', async () => {
    await renderLogin();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/email/i), 'ana@test.com');
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }));

    expect(mockLogin).not.toHaveBeenCalled();
  });
});

describe('submit exitoso', () => {
  it('redirige a /student tras login con rol student', async () => {
    mockLogin.mockImplementation(() => mockStore({ user: { role: 'student' } }));
    await renderLogin();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/email/i), 'ana@test.com');
    await user.type(screen.getByLabelText(/contraseña/i), '123456');
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }));

    await waitFor(() => {
      expect(screen.getByText('StudentDashboard')).toBeTruthy();
    });
  });

  it('redirige a /ngo tras login con rol ngo', async () => {
    mockLogin.mockImplementation(() => mockStore({ user: { role: 'ngo' } }));
    await renderLogin();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/email/i), 'ong@test.com');
    await user.type(screen.getByLabelText(/contraseña/i), '123456');
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }));

    await waitFor(() => {
      expect(screen.getByText('NgoDashboard')).toBeTruthy();
    });
  });

  it('redirige a /admin tras login con rol admin', async () => {
    mockLogin.mockImplementation(() => mockStore({ user: { role: 'admin' } }));
    await renderLogin();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/email/i), 'admin@test.com');
    await user.type(screen.getByLabelText(/contraseña/i), '123456');
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }));

    await waitFor(() => {
      expect(screen.getByText('AdminDashboard')).toBeTruthy();
    });
  });
});

describe('errores de API', () => {
  it('muestra mensaje de error visible si login falla con 401', async () => {
    mockLogin.mockRejectedValue(
      Object.assign(new Error('Credenciales inválidas'), { response: { status: 401 } }),
    );
    await renderLogin();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/email/i), 'mal@test.com');
    await user.type(screen.getByLabelText(/contraseña/i), 'wrong');
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }));

    expect(await screen.findByRole('alert')).toBeTruthy();
  });

  it('deshabilita el botón mientras isLoading es true', async () => {
    await renderLogin({ isLoading: true });

    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeDisabled();
  });

  it('muestra banner de sin conexión y cambia el botón a Reintentar cuando el backend no responde (error de red)', async () => {
    isNetworkError.mockReturnValue(true);
    mockLogin.mockRejectedValue(new Error('Network Error'));
    await renderLogin();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/email/i), 'ana@test.com');
    await user.type(screen.getByLabelText(/contraseña/i), '123456');
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }));

    await screen.findByRole('status');
    expect(screen.getByRole('status')).toHaveTextContent(/sin conexión/i);
    expect(screen.getByRole('button', { name: /reintentar/i })).toBeInTheDocument();
  });

  it('oculta el banner de sin conexión al recuperar la conexión (submit exitoso tras error de red)', async () => {
    isNetworkError.mockReturnValue(true);
    mockLogin
      .mockRejectedValueOnce(new Error('Network Error'))
      .mockImplementationOnce(() => mockStore({ user: { role: 'student' } }));
    await renderLogin();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/email/i), 'ana@test.com');
    await user.type(screen.getByLabelText(/contraseña/i), '123456');
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }));

    await screen.findByRole('status');

    await user.click(screen.getByRole('button', { name: /reintentar/i }));

    await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());
  });
});
