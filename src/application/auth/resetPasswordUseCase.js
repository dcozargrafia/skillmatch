/**
 * Caso de uso: restablecer contraseña con token.
 */

import { resetPasswordRequest } from '../../infrastructure/api/authApi.js';

/**
 * @param {{ token: string, password: string }} data
 * @returns {Promise<void>}
 */
export async function resetPasswordUseCase({ token, password }) {
  return resetPasswordRequest(token, password);
}