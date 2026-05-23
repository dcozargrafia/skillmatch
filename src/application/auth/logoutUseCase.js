/**
 * Caso de uso: cerrar sesión.
 */

import { logoutRequest } from '../../infrastructure/api/authApi.js';

/**
 * @returns {Promise<void>}
 */
export async function logoutUseCase() {
  return logoutRequest();
}