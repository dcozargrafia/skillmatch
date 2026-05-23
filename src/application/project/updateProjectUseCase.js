/**
 * Caso de uso: actualizar un proyecto.
 * Validamos propiedad con canEditProject antes de llamar a la API.
 * Opcionalmente actualiza skills via updateProjectSkills si skills.length > 0.
 */

import { updateProject, updateProjectSkills } from '../../infrastructure/api/projectApi.js';
import { canEditProject } from '../../domain/ngo/Ngo.js';

/**
 * @param {string} projectId
 * @param {object} updateData
 * @param {string} ngoUserId
 * @param {object} project - proyecto actual (para validar propiedad)
 * @param {Array} [skills] - array opcional de skills [{skill_id, required_level}]
 * @returns {Promise<object>}
 * @throws {Error} Si no hay permiso o la API falla (incluye partial failure de skills)
 */
export async function updateProjectUseCase(projectId, updateData, ngoUserId, project, skills) {
  if (!canEditProject(project, ngoUserId)) {
    throw new Error('No permission to edit this project');
  }

  const updatedProject = await updateProject(projectId, updateData);

  if (skills?.length > 0) {
    await updateProjectSkills(projectId, skills);
  }

  return updatedProject;
}