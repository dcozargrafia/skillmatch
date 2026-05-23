/**
 * Test: useForgotPassword
 * SDD Phase 5, Task 5.1
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { forgotPasswordUseCase } from '../../application/auth/forgotPasswordUseCase.js';
import { validateEmail } from '../../domain/user/User.js';

vi.mock('../../application/auth/forgotPasswordUseCase.js', () => ({
  forgotPasswordUseCase: vi.fn(),
}));

vi.mock('../../domain/user/User.js', () => ({
  validateEmail: vi.fn(),
}));

const { forgotPasswordUseCase: mockForgotPasswordUseCase } = await import('../../application/auth/forgotPasswordUseCase.js');
const { validateEmail: mockValidateEmail } = await import('../../domain/user/User.js');

const { default: useForgotPassword } = await import('./useForgotPassword.jsx');

const mockSentEmail = 'test@example.com';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useForgotPassword', () => {
  it('valida email y retorna error si es inválido', async () => {
    mockValidateEmail.mockReturnValue({ isValid: false, error: 'Email inválido' });
    const { result } = renderHook(() => useForgotPassword());

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() });
    });

    expect(result.current.error).toBe('Email inválido');
    expect(forgotPasswordUseCase).not.toHaveBeenCalled();
  });

  it('llama a forgotPasswordUseCase con email válido y setea sent=true', async () => {
    mockValidateEmail.mockReturnValue({ isValid: true });
    mockForgotPasswordUseCase.mockResolvedValue();
    const { result } = renderHook(() => useForgotPassword());

    act(() => {
      result.current.setEmail(mockSentEmail);
    });

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() });
    });

    expect(forgotPasswordUseCase).toHaveBeenCalledWith(mockSentEmail);
    expect(result.current.sent).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('setea error si forgotPasswordUseCase falla', async () => {
    mockValidateEmail.mockReturnValue({ isValid: true });
    mockForgotPasswordUseCase.mockRejectedValue(new Error('Error de red'));
    const { result } = renderHook(() => useForgotPassword());

    act(() => {
      result.current.setEmail(mockSentEmail);
    });

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() });
    });

    expect(result.current.error).toBe('Error de red');
    expect(result.current.sent).toBe(false);
  });

});
