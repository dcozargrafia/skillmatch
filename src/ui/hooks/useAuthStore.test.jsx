/**
 * Tests para useAuthStore (SMAPP-11).
 *
 * Criterios de aceptación:
 * - Estado inicial: user null, isLoading false
 * - login() exitoso: guarda user y isLoading vuelve a false
 * - login() fallido: lanza error e isLoading vuelve a false
 * - logout(): limpia user y redirige a /login
 * - hydrate() exitoso: restaura user desde GET /users/me
 * - hydrate() fallido (401/red): limpia user silenciosamente sin lanzar
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';

vi.mock('../../application/auth/loginUseCase.js', () => ({
  loginUseCase: vi.fn(),
}));

vi.mock('../../infrastructure/api/usersApi.js', () => ({
  getMe: vi.fn(),
}));

vi.mock('../../infrastructure/api/authApi.js', () => ({
  loginRequest: vi.fn(),
  registerRequest: vi.fn(),
  logoutRequest: vi.fn(),
}));

const { loginUseCase } = await import('../../application/auth/loginUseCase.js');
const { getMe } = await import('../../infrastructure/api/usersApi.js');
const { logoutRequest } = await import('../../infrastructure/api/authApi.js');
const { default: useAuthStore } = await import('./useAuthStore.jsx');

const mockUser = { id: 1, name: 'Ana', email: 'ana@test.com', role: 'student' };

beforeEach(() => {
  vi.clearAllMocks();
  logoutRequest.mockResolvedValue({});
  useAuthStore.setState({ user: null, isLoading: false });
  delete window.location;
  window.location = { pathname: '/', href: '' };
});

describe('estado inicial', () => {
  it('user es null e isLoading es false', () => {
    const { result } = renderHook(() => useAuthStore());
    expect(result.current.user).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });
});

describe('login', () => {
  it('guarda el usuario y desactiva isLoading al tener éxito', async () => {
    loginUseCase.mockResolvedValue(mockUser);
    const { result } = renderHook(() => useAuthStore());

    await act(async () => {
      await result.current.login({ email: 'ana@test.com', password: '123' });
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isLoading).toBe(false);
  });

  it('lanza el error y desactiva isLoading si falla', async () => {
    loginUseCase.mockRejectedValue(new Error('Credenciales inválidas'));
    const { result } = renderHook(() => useAuthStore());

    let thrownError;
    await act(async () => {
      try {
        await result.current.login({ email: 'x@x.com', password: 'wrong' });
      } catch (e) {
        thrownError = e;
      }
    });

    expect(thrownError?.message).toBe('Credenciales inválidas');
    expect(result.current.user).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });
});

describe('logout', () => {
  it('llama a logoutRequest, limpia el usuario y redirige a /login', async () => {
    useAuthStore.setState({ user: mockUser });
    const { result } = renderHook(() => useAuthStore());

    await act(async () => {
      await result.current.logout();
    });

    expect(logoutRequest).toHaveBeenCalledTimes(1);
    expect(result.current.user).toBeNull();
    expect(window.location.href).toBe('/login');
  });

  it('limpia el usuario y redirige aunque logoutRequest falle', async () => {
    logoutRequest.mockRejectedValueOnce(new Error('Network Error'));
    useAuthStore.setState({ user: mockUser });
    const { result } = renderHook(() => useAuthStore());

    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(window.location.href).toBe('/login');
  });
});

describe('hydrate', () => {
  it('restaura el usuario si la cookie JWT es válida', async () => {
    getMe.mockResolvedValue(mockUser);
    const { result } = renderHook(() => useAuthStore());

    await act(async () => {
      await result.current.hydrate();
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isLoading).toBe(false);
  });

  it('limpia el usuario silenciosamente si /users/me falla', async () => {
    getMe.mockRejectedValue(new Error('401'));
    const { result } = renderHook(() => useAuthStore());
    useAuthStore.setState({ user: mockUser });

    await act(async () => {
      await result.current.hydrate();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });
});
