/**
 * Test: useResetPassword
 * SDD Phase 5, Task 5.3
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
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

});
