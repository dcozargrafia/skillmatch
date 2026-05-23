/**
 * Caso de uso: crear una nueva habilidad (admin).
 */

import { createSkill } from '../../infrastructure/api/adminApi.js';

/**
 * @param {{ name: string, category: string }} data
 * @returns {Promise<object>}
 */
export async function createSkillUseCase({ name, category }) {
  return createSkill({ name, category });
}