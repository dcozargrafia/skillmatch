/**
 * Caso de uso: obtener detalle de proyecto para estudiante.
 * Incluye verificación de aplicación previa + catálogo de skills.
 */

import { getProjectById } from '../../infrastructure/api/projectApi.js';
import { getOwnApplications } from '../../infrastructure/api/applicationApi.js';
import { getAllSkills } from '../../infrastructure/api/skillsApi.js';

/**
 * @param {string} projectId
 * @returns {Promise<{project: object, applied: boolean, skills: object[]}>}
 */
export async function getStudentProjectDetailUseCase(projectId) {
  const [project, applications, skills] = await Promise.all([
    getProjectById(projectId),
    getOwnApplications(),
    getAllSkills(),
  ]);

  const applied = applications.some((a) => a.project_id === projectId);

  return { project, applied, skills };
}