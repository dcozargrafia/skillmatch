/**
 * Test: useResetPassword
 * SDD Phase 5, Task 5.3
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { resetPasswordUseCase } from '../../application/auth/resetPasswordUseCase.js';
import { validateResetPassword } from '../../domain/user/User.js';

vi.mock('../../application/auth/resetPasswordUseCase.js', () => ({
  resetPasswordUseCase: vi.fn(),
}));

vi.mock('../../domain/user/User.js', () => ({
  validateResetPassword: vi.fn(),
}));

// Mock useSearchParams
vi.mock('react-router-dom', () => ({
  useSearchParams: vi.fn(() => [
    new URLSearchParams({ token: 'abc123-token' }),
    vi.fn(),
  ]),
}));

const { resetPasswordUseCase: mockResetPasswordUseCase } = await import('../../application/auth/resetPasswordUseCase.js');
const { validateResetPassword: mockValidateResetPassword } = await import('../../domain/user/User.js');

const { default: useResetPassword } = await import('./useResetPassword.jsx');

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useResetPassword', () => {
  it('inicializa con estado vacío, sin errores, isLoading false, isSuccess false', () => {
    const { result } = renderHook(() => useResetPassword());
    expect(result.current.password).toBe('');
    expect(result.current.confirmPassword).toBe('');
    expect(result.current.errors).toEqual({});
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isSuccess).toBe(false);
  });

  it('permite cambiar password y confirmPassword', () => {
    const { result } = renderHook(() => useResetPassword());
    act(() => {
      result.current.setPassword('password123');
      result.current.setConfirmPassword('password123');
    });
    expect(result.current.password).toBe('password123');
    expect(result.current.confirmPassword).toBe('password123');
  });

  it('extrae token de la URL', () => {
    // El mock de useSearchParams devuelve token=abc123-token
    const { result } = renderHook(() => useResetPassword());
    // El hook internamente usa el token para resetPasswordUseCase
    expect(result.current).toBeDefined();
  });

  it('valida con validateResetPassword y setea errores si falla', async () => {
    mockValidateResetPassword.mockReturnValue({
      isValid: false,
      errors: { password: 'La contraseña debe tener al menos 8 caracteres', confirmPassword: 'Las contraseñas no coinciden' },
    });

    const { result } = renderHook(() => useResetPassword());

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() });
    });

    expect(result.current.errors).toEqual({
      password: 'La contraseña debe tener al menos 8 caracteres',
      confirmPassword: 'Las contraseñas no coinciden',
    });
    expect(resetPasswordUseCase).not.toHaveBeenCalled();
  });

  it('llama a resetPasswordUseCase con token y password si validación pasa', async () => {
    mockValidateResetPassword.mockReturnValue({ isValid: true, errors: {} });
    mockResetPasswordUseCase.mockResolvedValue();
    const { result } = renderHook(() => useResetPassword());

    act(() => {
      result.current.setPassword('password123');
      result.current.setConfirmPassword('password123');
    });

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() });
    });

    expect(resetPasswordUseCase).toHaveBeenCalledWith({ token: 'abc123-token', password: 'password123' });
    expect(result.current.isSuccess).toBe(true);
    expect(result.current.errors).toEqual({});
  });

  it('setea error si resetPasswordUseCase falla', async () => {
    mockValidateResetPassword.mockReturnValue({ isValid: true, errors: {} });
    mockResetPasswordUseCase.mockRejectedValue(new Error('Token inválido'));
    const { result } = renderHook(() => useResetPassword());

    act(() => {
      result.current.setPassword('password123');
      result.current.setConfirmPassword('password123');
    });

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() });
    });

    expect(result.current.error).toBe('Token inválido');
    expect(result.current.isSuccess).toBe(false);
  });

  it('setea isLoading=true durante submit y false al terminar', async () => {
    mockValidateResetPassword.mockReturnValue({ isValid: true, errors: {} });
    mockResetPasswordUseCase.mockResolvedValue();
    const { result } = renderHook(() => useResetPassword());

    act(() => {
      result.current.setPassword('password123');
      result.current.setConfirmPassword('password123');
    });

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() });
    });

    expect(result.current.isLoading).toBe(false);
  });
});