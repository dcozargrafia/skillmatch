/**
 * Caso de uso: crear un proyecto.
 * Valida el perfil NGO y luego llama a la API.
 */

import { createProject } from '../../infrastructure/api/projectApi.js';
import { validateNgoProfile } from '../../domain/ngo/Ngo.js';

/**
 * @param {object} projectData
 * @returns {Promise<object>}
 * @throws {Error} Si la validación falla o la API falla
 */
export async function createProjectUseCase(projectData) {
  const { errors } = validateNgoProfile(projectData);
  if (Object.keys(errors).length > 0) {
    const firstError = Object.values(errors)[0];
    throw new Error(firstError);
  }

  const project = await createProject(projectData);
  return project;
}