/**
 * Caso de uso: obtener ONGs no verificadas (admin).
 */

import { getUnverifiedNgos } from '../../infrastructure/api/adminApi.js';

/**
 * @returns {Promise<object[]>}
 */
export async function getUnverifiedNgosUseCase() {
  return getUnverifiedNgos();
}