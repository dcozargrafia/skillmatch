/**
 * Caso de uso: crear un entregable.
 * Llama a deliverableApi.createDeliverable.
 */

import { createDeliverable } from '../../infrastructure/api/deliverableApi.js';

/**
 * @param {{ assignment_id: string, title: string, description?: string }} data
 * @returns {Promise<object>}
 */
export async function createDeliverableUseCase(data) {
  return createDeliverable(data);
}