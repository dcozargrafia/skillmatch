/**
 * Caso de uso: crear un assignment (seleccionar candidato).
 * Llama a assignmentApi.createAssignment.
 */

import { createAssignment } from '../../infrastructure/api/assignmentApi.js';

/**
 * @param {string} applicationId
 * @returns {Promise<object>}
 */
export async function createAssignmentUseCase(applicationId) {
  return createAssignment(applicationId);
}