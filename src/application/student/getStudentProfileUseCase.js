/**
 * Caso de uso: obtener perfil del estudiante autenticado + catálogo de habilidades.
 * Normaliza el perfil inbound (availability → disponibilidad) para la UI.
 */

import { getStudentMe } from '../../infrastructure/api/studentApi.js';
import { getAllSkills } from '../../infrastructure/api/skillsApi.js';
import { normalizeInboundStudentProfile } from '../../domain/student/Student.js';

/**
 * @returns {Promise<{profile: object, allSkills: object[]}>}
 */
export async function getStudentProfileUseCase() {
  const [profile, allSkills] = await Promise.all([getStudentMe(), getAllSkills()]);
  return { profile: normalizeInboundStudentProfile(profile), allSkills };
}