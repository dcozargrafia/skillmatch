/**
 * Caso de uso: actualizar perfil de la ONG.
 * Valida con validateNgoProfile y luego actualiza ngo + user.
 */

import { updateNgoMe } from '../../infrastructure/api/ngoApi.js';
import { updateUserMe } from '../../infrastructure/api/usersApi.js';
import { validateNgoProfile } from '../../domain/ngo/Ngo.js';

/**
 * @param {object} profileData
 * @returns {Promise<{ngo: object, user: object}>}
 * @throws {Error} Si la validación falla o alguna API falla
 */
export async function updateNgoProfileUseCase(profileData) {
  const { errors } = validateNgoProfile(profileData);
  if (Object.keys(errors).length > 0) {
    const firstError = Object.values(errors)[0];
    throw new Error(firstError);
  }

  const ngo = await updateNgoMe(profileData);
  const user = await updateUserMe(profileData);

  return { ngo, user };
}