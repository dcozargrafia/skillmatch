/**
 * Caso de uso: hidratar la sesión del usuario autenticado.
 * Obtiene el perfil del usuario actual desde GET /users/me.
 */

import { getMe } from '../../infrastructure/api/usersApi.js';

/**
 * @returns {Promise<object>} Datos del usuario autenticado
 */
export async function hydrateUseCase() {
  return getMe();
}