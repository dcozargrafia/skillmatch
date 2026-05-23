/**
 * Caso de uso: obtener catálogo de habilidades.
 */

import { getAllSkills } from '../../infrastructure/api/skillsApi.js';

/**
 * @returns {Promise<object[]>}
 */
export async function getSkillsUseCase() {
  return getAllSkills();
}