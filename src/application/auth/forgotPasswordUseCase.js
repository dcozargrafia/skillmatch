/**
 * Caso de uso: solicitar recuperación de contraseña.
 */

import { forgotPasswordRequest } from '../../infrastructure/api/authApi.js';

/**
 * @param {string} email
 * @returns {Promise<void>}
 */
export async function forgotPasswordUseCase(email) {
  return forgotPasswordRequest(email);
}