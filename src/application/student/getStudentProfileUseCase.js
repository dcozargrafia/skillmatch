/**
 * Caso de uso: obtener perfil del estudiante autenticado + catálogo de habilidades.
 */

import { getStudentMe } from '../../infrastructure/api/studentApi.js';
import { getAllSkills } from '../../infrastructure/api/skillsApi.js';

/**
 * @returns {Promise<{profile: object, allSkills: object[]}>}
 */
export async function getStudentProfileUseCase() {
  const [profile, allSkills] = await Promise.all([getStudentMe(), getAllSkills()]);
  return { profile, allSkills };
}