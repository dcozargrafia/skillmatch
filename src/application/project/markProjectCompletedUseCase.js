/**
 * Caso de uso: marcar proyecto como completado.
 * Validamos con canCompleteProject antes de llamar a la API.
 */

import { updateProjectStatus } from '../../infrastructure/api/projectApi.js';
import { canCompleteProject } from '../../domain/project/Project.js';

/**
 * @param {object} project
 * @param {object[]} deliverables
 * @returns {Promise<object>}
 * @throws {Error} Si no se puede completar o la API falla
 */
export async function markProjectCompletedUseCase(project, deliverables = []) {
  if (!canCompleteProject(project, deliverables)) {
    throw new Error('Project cannot be marked as completed');
  }

  return updateProjectStatus(project.id, 'completed');
}