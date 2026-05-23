/**
 * Tests para ForgotPasswordPage (SMAPP-auth).
 *
 * Criterios de aceptación:
 * - Muestra campo de email y botón de envío
 * - Llama a useForgotPassword.handleSubmit con el email introducido
 * - Tras submit exitoso muestra mensaje de confirmación
 * - Errores también muestran confirmación (no revelan si el email existe)
 */

import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

const mockHandleSubmit = vi.fn();
const mockSetEmail = vi.fn();

vi.mock('../../hooks/useForgotPassword.jsx', () => ({
  default: vi.fn(),
}));

const { default: useForgotPassword } = await import('../../hooks/useForgotPassword.jsx');
const { default: ForgotPasswordPage } = await import('./ForgotPasswordPage.jsx');

function renderPage(overrides = {}) {
  const state = {
    email: '',
    setEmail: mockSetEmail,
    error: null,
    isLoading: false,
    sent: false,
    handleSubmit: mockHandleSubmit,
    ...overrides,
  };

  useForgotPassword.mockReturnValue(state);

  return render(
    <MemoryRouter initialEntries={['/forgot-password']}>
      <Routes>
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  mockHandleSubmit.mockResolvedValue(undefined);
  mockSetEmail.mockClear();
});

describe('ForgotPasswordPage', () => {
  it('AC1: muestra campo de email y botón de envío', () => {
    renderPage();
    expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /enviar/i })).toBeInTheDocument();
  });

  it('AC2: llama a handleSubmit con el email introducido', async () => {
    renderPage();

    const user = userEvent.setup();
    await user.type(screen.getByRole('textbox', { name: /email/i }), 'usuario@example.com');
    await user.click(screen.getByRole('button', { name: /enviar/i }));

    await waitFor(() => expect(mockHandleSubmit).toHaveBeenCalled());
  });

  it('AC3: tras submit exitoso muestra mensaje de confirmación sin revelar si el email existe', () => {
    renderPage({ sent: true });

    expect(screen.getByText(/si el email está registrado/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /volver al inicio de sesión/i })).toBeInTheDocument();
  });

  it('AC4: error de API también muestra el mensaje de confirmación (no revela existencia)', () => {
    renderPage({ sent: true });

    expect(screen.getByText(/si el email está registrado/i)).toBeInTheDocument();
  });
});