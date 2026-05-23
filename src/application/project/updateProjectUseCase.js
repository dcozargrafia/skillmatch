/**
 * Caso de uso: actualizar un proyecto.
 * Validamos propiedad con canEditProject antes de llamar a la API.
 */

import { updateProject } from '../../infrastructure/api/projectApi.js';
import { canEditProject } from '../../domain/ngo/Ngo.js';

/**
 * @param {string} projectId
 * @param {object} updateData
 * @param {string} ngoUserId
 * @param {object} project - proyecto actual (para validar propiedad)
 * @returns {Promise<object>}
 * @throws {Error} Si no hay permiso o la API falla
 */
export async function updateProjectUseCase(projectId, updateData, ngoUserId, project) {
  if (!canEditProject(project, ngoUserId)) {
    throw new Error('No permission to edit this project');
  }

  return updateProject(projectId, updateData);
}