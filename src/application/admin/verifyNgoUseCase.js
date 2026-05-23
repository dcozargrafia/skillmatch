/**
 * Caso de uso: verificar una ONG (admin).
 */

import { verifyNgo } from '../../infrastructure/api/adminApi.js';

/**
 * @param {number} userId
 * @returns {Promise<object>}
 */
export async function verifyNgoUseCase(userId) {
  return verifyNgo(userId);
}