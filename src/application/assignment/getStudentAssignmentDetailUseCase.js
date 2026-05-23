/**
 * Caso de uso: obtener detalle de assignment para estudiante.
 */

import { getAssignmentById } from '../../infrastructure/api/assignmentApi.js';
import { getDeliverablesByAssignment } from '../../infrastructure/api/deliverableApi.js';

/**
 * @param {string} assignmentId
 * @returns {Promise<{assignment: object, deliverables: object[]}>}
 */
export async function getStudentAssignmentDetailUseCase(assignmentId) {
  const [assignment, deliverables] = await Promise.all([
    getAssignmentById(assignmentId),
    getDeliverablesByAssignment(assignmentId),
  ]);

  return { assignment, deliverables };
}