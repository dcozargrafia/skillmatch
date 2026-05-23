/**
 * Caso de uso: entregar un deliverable.
 * Domain guard: canSubmitDeliverable.
 */

import { submitDeliverable } from '../../infrastructure/api/deliverableApi.js';
import { canSubmitDeliverable } from '../../domain/assignment/Assignment.js';

/**
 * @param {object} deliverable
 * @param {string} fileUrl
 * @param {string} [comment]
 * @returns {Promise<object>}
 * @throws {Error} Si el deliverable no puede ser entregado
 */
export async function submitDeliverableUseCase(deliverable, fileUrl, comment) {
  if (!canSubmitDeliverable(deliverable, fileUrl)) {
    throw new Error('Cannot submit deliverable');
  }
  return submitDeliverable(deliverable.id, fileUrl, comment);
}