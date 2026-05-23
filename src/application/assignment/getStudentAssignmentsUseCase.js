/**
 * Caso de uso: obtener assignments del estudiante autenticado con sus deliverables.
 */

import { getMyAssignments } from '../../infrastructure/api/assignmentApi.js';
import { getDeliverablesByAssignment } from '../../infrastructure/api/deliverableApi.js';

/**
 * @returns {Promise<{assignments: object[]}>}
 */
export async function getStudentAssignmentsUseCase() {
  const assignments = await getMyAssignments();

  const assignmentsWithDeliverables = await Promise.all(
    assignments.map(async (assignment) => {
      const deliverables = await getDeliverablesByAssignment(assignment.id);
      return { ...assignment, deliverables };
    }),
  );

  return { assignments: assignmentsWithDeliverables };
}