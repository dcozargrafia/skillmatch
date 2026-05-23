/**
 * Caso de uso: revisar un deliverable (approve/reject).
 * Llama a deliverableApi.reviewDeliverable.
 */

import { reviewDeliverable } from '../../infrastructure/api/deliverableApi.js';

/**
 * @param {string} deliverableId
 * @param {{ status: string, comment?: string }} reviewData
 * @returns {Promise<object>}
 */
export async function reviewDeliverableUseCase(deliverableId, reviewData) {
  return reviewDeliverable(deliverableId, reviewData);
}