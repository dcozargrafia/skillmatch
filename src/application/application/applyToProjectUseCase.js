/**
 * Caso de uso: aplicar a un proyecto (estudiante).
 * Llama a applicationApi.createApplication.
 */

import { createApplication } from '../../infrastructure/api/applicationApi.js';

/**
 * @param {string} projectId
 * @returns {Promise<object>}
 */
export async function applyToProjectUseCase(projectId) {
  return createApplication(projectId);
}