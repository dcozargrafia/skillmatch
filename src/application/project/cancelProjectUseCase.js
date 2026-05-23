/**
 * Caso de uso: cancelar un proyecto.
 * Validamos con canCancelProject antes de llamar a la API.
 */

import { cancelProject } from '../../infrastructure/api/projectApi.js';
import { canCancelProject } from '../../domain/ngo/Ngo.js';

/**
 * @param {string} projectId
 * @param {string} status - estado actual del proyecto
 * @returns {Promise<object>}
 * @throws {Error} Si no se puede cancelar o la API falla
 */
export async function cancelProjectUseCase(projectId, status) {
  if (!canCancelProject(status)) {
    throw new Error('Cannot cancel project in terminal status');
  }

  return cancelProject(projectId);
}