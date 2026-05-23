/**
 * Caso de uso: obtener los proyectos de la ONG autenticada.
 */

import { getOwnProjects } from '../../infrastructure/api/projectApi.js';

/**
 * @param {object} filters
 * @returns {Promise<object[]>}
 */
export async function getProjectsUseCase(filters = {}) {
  return getOwnProjects(filters);
}