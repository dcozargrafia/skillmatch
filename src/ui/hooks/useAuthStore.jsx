/**
 * Store global de autenticación con Zustand.
 * Gestiona el ciclo de vida de la sesión: login, logout e hidratación.
 */

import { create } from 'zustand';
import { loginUseCase } from '../../application/auth/loginUseCase.js';
import { hydrateUseCase } from '../../application/auth/hydrateUseCase.js';
import { logoutUseCase } from '../../application/auth/logoutUseCase.js';

const useAuthStore = create((set) => ({
  /** @type {{ id: number, name: string, email: string, role: string }|null} */
  user: null,

  /** Indica si hay una operación de autenticación en curso */
  isLoading: false,

  /**
   * Inicia sesión con las credenciales dadas.
   * Guarda el usuario en el store si el login es exitoso.
   *
   * @param {{ email: string, password: string }} credentials
   * @returns {Promise<void>}
   * @throws {Error} Si las credenciales son inválidas
   */
  login: async (credentials) => {
    set({ isLoading: true });
    try {
      const user = await loginUseCase(credentials);
      set({ user, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  /**
   * Cierra la sesión llamando al backend para limpiar la cookie HttpOnly,
   * luego limpia el store y redirige a /login.
   * Si el backend falla (red caída) igualmente limpia el estado local.
   */
  logout: async () => {
    try {
      await logoutUseCase();
    } catch {
      // silencioso: el estado local se limpia igualmente
    }
    set({ user: null, isLoading: false });
    window.location.href = '/login';
  },

  /**
   * Restaura la sesión al montar la app llamando a GET /users/me.
   * Si la cookie JWT es válida, recupera el usuario sin requerir login.
   * Si falla (401 o error de red), limpia el estado silenciosamente.
   */
  hydrate: async () => {
    set({ isLoading: true });
    try {
      const user = await hydrateUseCase();
      set({ user, isLoading: false });
    } catch {
      set({ user: null, isLoading: false });
    }
  },
}));

export default useAuthStore;
