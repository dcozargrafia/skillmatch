/**
 * Caso de uso: obtener perfil de la ONG.
 * Combina datos de ngoApi.getNgoMe y usersApi.getUserMe.
 */

import { getNgoMe } from '../../infrastructure/api/ngoApi.js';
import { getUserMe } from '../../infrastructure/api/usersApi.js';

/**
 * @returns {Promise<{ngo: object, user: object}>}
 */
export async function getNgoProfileUseCase() {
  const [ngo, user] = await Promise.all([getNgoMe(), getUserMe()]);
  return { ngo, user };
}