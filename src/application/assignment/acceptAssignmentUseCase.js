/**
 * Caso de uso: aceptar un assignment.
 * Domain guard: canAcceptAssignment.
 */

import { acceptAssignment } from '../../infrastructure/api/assignmentApi.js';
import { canAcceptAssignment } from '../../domain/assignment/Assignment.js';

/**
 * @param {object} assignment
 * @returns {Promise<object>}
 * @throws {Error} Si el assignment no puede ser aceptado
 */
export async function acceptAssignmentUseCase(assignment) {
  if (!canAcceptAssignment(assignment)) {
    throw new Error('Cannot accept assignment');
  }
  return acceptAssignment(assignment.id);
}