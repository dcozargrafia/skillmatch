/**
 * Caso de uso: eliminar una habilidad (admin).
 */

import { deleteSkill } from '../../infrastructure/api/adminApi.js';

/**
 * @param {number} skillId
 * @returns {Promise<void>}
 */
export async function deleteSkillUseCase(skillId) {
  return deleteSkill(skillId);
}