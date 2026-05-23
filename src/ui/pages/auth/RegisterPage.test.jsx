/**
 * Tests para RegisterPage (SMAPP-13 / HU1).
 *
 * Criterios de aceptación:
 * - Renderiza campos nombre, email, contraseña y selector de rol
 * - Rol ngo muestra campos adicionales: organization_name y area
 * - Rol student NO muestra campos adicionales
 * - Submit exitoso redirige a /login con mensaje de confirmación
 * - No llama a registerUseCase si faltan campos requeridos
 * - No llama si organization_name falta cuando rol es ngo
 * - Error 409 muestra error inline en campo email
 * - Otro error de API muestra mensaje genérico visible
 * - Botón deshabilitado mientras se envía
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

vi.mock('../../../application/auth/registerUseCase.js', () => ({
  registerUseCase: vi.fn(),
}));

const { registerUseCase } = await import('../../../application/auth/registerUseCase.js');

/** Renderiza RegisterPage con router y ruta /login stub */
async function renderRegister() {
  const { default: RegisterPage } = await import('./RegisterPage');

  render(
    <MemoryRouter initialEntries={['/register']}>
      <Routes>
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<div>LoginPage</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('estructura del formulario', () => {
  it('renderiza campos nombre, email, contraseña y selector de rol', async () => {
    await renderRegister();

    expect(screen.getByLabelText(/nombre/i)).toBeTruthy();
    expect(screen.getByLabelText(/email/i)).toBeTruthy();
    expect(screen.getByLabelText(/contraseña/i)).toBeTruthy();
    expect(screen.getByLabelText(/rol/i)).toBeTruthy();
  });

  it('no muestra campos adicionales cuando el rol es student', async () => {
    await renderRegister();
    const user = userEvent.setup();

    await user.selectOptions(screen.getByLabelText(/rol/i), 'student');

    expect(screen.queryByLabelText(/nombre de organización/i)).toBeNull();
    expect(screen.queryByLabelText(/área/i)).toBeNull();
  });

  it('muestra organization_name y area cuando el rol es ngo', async () => {
    await renderRegister();
    const user = userEvent.setup();

    await user.selectOptions(screen.getByLabelText(/rol/i), 'ngo');

    expect(screen.getByLabelText(/nombre de organización/i)).toBeTruthy();
    expect(screen.getByLabelText(/área/i)).toBeTruthy();
  });
});

describe('validación en cliente', () => {
  it('no llama a registerUseCase si el nombre está vacío', async () => {
    await renderRegister();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/email/i), 'test@test.com');
    await user.type(screen.getByLabelText(/contraseña/i), '123456');
    await user.click(screen.getByRole('button', { name: /registrarse/i }));

    expect(registerUseCase).not.toHaveBeenCalled();
  });

  it('no llama si organization_name falta cuando rol es ngo', async () => {
    await renderRegister();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/nombre/i), 'Mi ONG');
    await user.type(screen.getByLabelText(/email/i), 'ong@test.com');
    await user.type(screen.getByLabelText(/contraseña/i), '123456');
    await user.selectOptions(screen.getByLabelText(/rol/i), 'ngo');
    await user.click(screen.getByRole('button', { name: /registrarse/i }));

    expect(registerUseCase).not.toHaveBeenCalled();
  });
});

describe('submit exitoso', () => {
  it('redirige a /login con mensaje de confirmación tras registro exitoso', async () => {
    registerUseCase.mockResolvedValue({ id: 1, name: 'Carlos' });
    await renderRegister();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/nombre/i), 'Carlos');
    await user.type(screen.getByLabelText(/email/i), 'carlos@test.com');
    await user.type(screen.getByLabelText(/contraseña/i), '123456');
    await user.selectOptions(screen.getByLabelText(/rol/i), 'student');
    await user.click(screen.getByRole('button', { name: /registrarse/i }));

    await waitFor(() => {
      expect(screen.getByText('LoginPage')).toBeTruthy();
    });
  });
});

describe('errores de API', () => {
  it('muestra error inline en campo email si la API responde 409', async () => {
    registerUseCase.mockRejectedValue(
      Object.assign(new Error('Email ya registrado'), { response: { status: 409 } }),
    );
    await renderRegister();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/nombre/i), 'Carlos');
    await user.type(screen.getByLabelText(/email/i), 'dup@test.com');
    await user.type(screen.getByLabelText(/contraseña/i), '123456');
    await user.selectOptions(screen.getByLabelText(/rol/i), 'student');
    await user.click(screen.getByRole('button', { name: /registrarse/i }));

    expect(await screen.findByText(/email ya registrado/i)).toBeTruthy();
  });

  it('deshabilita el botón mientras se envía la petición', async () => {
    registerUseCase.mockImplementation(() => new Promise(() => {}));
    await renderRegister();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/nombre/i), 'Carlos');
    await user.type(screen.getByLabelText(/email/i), 'carlos@test.com');
    await user.type(screen.getByLabelText(/contraseña/i), '123456');
    await user.selectOptions(screen.getByLabelText(/rol/i), 'student');
    await user.click(screen.getByRole('button', { name: /registrarse/i }));

    expect(screen.getByRole('button', { name: /registrarse/i })).toBeDisabled();
  });
});
