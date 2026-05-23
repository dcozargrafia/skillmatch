/**
 * Caso de uso: obtener detalle de proyecto.
 * Carga proyecto + assignment + deliverables + applications.
 * Assignment 404 → returns assignment: null (not a failure).
 */

import { getProjectById } from '../../infrastructure/api/projectApi.js';
import { getAssignmentsByProject } from '../../infrastructure/api/assignmentApi.js';
import { getDeliverablesByAssignment } from '../../infrastructure/api/deliverableApi.js';
import { getApplicationsByProject } from '../../infrastructure/api/applicationApi.js';

/**
 * @param {string} projectId
 * @returns {Promise<{project: object, assignment: object|null, deliverables: object[], applications: object[]}>}
 */
export async function getProjectDetailUseCase(projectId) {
  const project = await getProjectById(projectId);

  const applications = await getApplicationsByProject(projectId);

  let assignment = null;
  try {
    const assignments = await getAssignmentsByProject(projectId);
    assignment = assignments.length > 0 ? assignments[0] : null;
  } catch (err) {
    // 404 on assignment is not a failure — project may not have one yet
    if (err?.response?.status === 404) {
      assignment = null;
    } else {
      throw err;
    }
  }

  let deliverables = [];
  if (assignment) {
    deliverables = await getDeliverablesByAssignment(assignment.id);
  }

  return { project, assignment, deliverables, applications };
}