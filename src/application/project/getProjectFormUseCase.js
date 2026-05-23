/**
 * Caso de uso: obtener datos para formulario de proyecto.
 * Create mode: carga solo skills.
 * Edit mode: carga project + skills.
 */

import { getProjectById } from '../../infrastructure/api/projectApi.js';
import { getAllSkills } from '../../infrastructure/api/skillsApi.js';

/**
 * @param {string|null} projectId - null para create, ID para edit
 * @returns {Promise<{project: object|null, skills: object[]}>}
 */
export async function getProjectFormUseCase(projectId = null) {
  const skills = await getAllSkills({});

  if (!projectId) {
    return { project: null, skills };
  }

  const project = await getProjectById(projectId);
  return { project, skills };
}