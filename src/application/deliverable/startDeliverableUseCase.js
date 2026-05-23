/**
 * Caso de uso: iniciar un deliverable.
 * Domain guard: canStartDeliverable.
 */

import { startDeliverable } from '../../infrastructure/api/deliverableApi.js';
import { canStartDeliverable } from '../../domain/assignment/Assignment.js';

/**
 * @param {object} deliverable
 * @param {object[]} allDeliverables
 * @returns {Promise<object>}
 * @throws {Error} Si el deliverable no puede ser iniciado
 */
export async function startDeliverableUseCase(deliverable, allDeliverables = []) {
  if (!canStartDeliverable(deliverable, allDeliverables)) {
    throw new Error('Cannot start deliverable');
  }
  return startDeliverable(deliverable.id);
}