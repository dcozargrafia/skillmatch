/**
 * Tests para ResetPasswordPage (SMAPP-auth).
 *
 * Criterios de aceptación:
 * - Muestra campos de nueva contraseña y confirmación
 * - Llama a useResetPassword.handleSubmit con token y passwords
 * - Muestra error si las contraseñas no coinciden
 * - Tras éxito redirige al login
 * - Token inválido/expirado muestra error con opción de solicitar uno nuevo
 */

import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

const mockHandleSubmit = vi.fn();

vi.mock('../../hooks/useResetPassword.jsx', () => ({
  default: vi.fn(),
}));

const { default: useResetPassword } = await import('../../hooks/useResetPassword.jsx');
const { default: ResetPasswordPage } = await import('./ResetPasswordPage.jsx');

function renderPage(overrides = {}, token = 'valid-token') {
  const state = {
    password: '',
    setPassword: vi.fn(),
    confirmPassword: '',
    setConfirmPassword: vi.fn(),
    errors: {},
    isLoading: false,
    isSuccess: false,
    error: null,
    handleSubmit: mockHandleSubmit,
    ...overrides,
  };

  useResetPassword.mockReturnValue(state);

  return render(
    <MemoryRouter initialEntries={[`/reset-password?token=${token}`]}>
      <Routes>
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/login" element={<div>LoginPage</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  mockHandleSubmit.mockResolvedValue(undefined);
});

describe('ResetPasswordPage', () => {
  it('AC1: muestra campos de nueva contraseña y confirmación', () => {
    renderPage();
    expect(screen.getByLabelText(/nueva contraseña/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirmar contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /restablecer/i })).toBeInTheDocument();
  });

  it('AC2: llama a handleSubmit con passwords al enviar', async () => {
    renderPage();

    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/nueva contraseña/i), 'NuevaPass123');
    await user.type(screen.getByLabelText(/confirmar contraseña/i), 'NuevaPass123');
    await user.click(screen.getByRole('button', { name: /restablecer/i }));

    await waitFor(() => expect(mockHandleSubmit).toHaveBeenCalled());
  });

  it('AC3: muestra error de validación cuando las contraseñas no coinciden', () => {
    renderPage({ errors: { confirmPassword: 'Las contraseñas no coinciden' } });

    expect(screen.getByText(/no coinciden/i)).toBeInTheDocument();
    expect(mockHandleSubmit).not.toHaveBeenCalled();
  });

  it('AC4: tras éxito muestra pantalla de confirmación con enlace al login', () => {
    renderPage({ isSuccess: true });

    expect(screen.getByText(/contraseña restablecida/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /volver al inicio de sesión/i })).toBeInTheDocument();
  });

});
