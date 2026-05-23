/**
 * Caso de uso: obtener proyectos disponibles para estudiantes.
 * Carga proyectos + catálogo de habilidades para resolución de nombres.
 */

import { getAllProjects } from '../../infrastructure/api/projectApi.js';
import { getAllSkills } from '../../infrastructure/api/skillsApi.js';

/**
 * @param {object} filters - Filtros opcionales para getAllProjects
 * @returns {Promise<{projects: object[], skills: object[]}>}
 */
export async function getStudentProjectsUseCase(filters = {}) {
  const [projects, skills] = await Promise.all([getAllProjects(filters), getAllSkills()]);
  return { projects, skills };
}