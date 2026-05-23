/**
 * Tests para createDeliverableUseCase.
 * - Llama a deliverableApi.createDeliverable con los datos
 * - Retorna el deliverable creado
 * - Propaga error si la API falla
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createDeliverable } from '../../infrastructure/api/deliverableApi.js';

vi.mock('../../infrastructure/api/deliverableApi.js', () => ({
  createDeliverable: vi.fn(),
}));

const { createDeliverableUseCase } = await import('./createDeliverableUseCase.js');

beforeEach(() => {
  vi.clearAllMocks();
});

describe('createDeliverableUseCase', () => {
  it('llama a createDeliverable con los datos correctos', async () => {
    const mockDeliverable = { id: 'del-1', title: 'Entregable 1', status: 'pending' };
    createDeliverable.mockResolvedValue(mockDeliverable);

    const data = { assignment_id: 'asgn-1', title: 'Entregable 1', description: 'Descripción' };
    const result = await createDeliverableUseCase(data);

    expect(createDeliverable).toHaveBeenCalledWith(data);
    expect(result).toEqual(mockDeliverable);
  });

  it('propaga error si createDeliverable falla', async () => {
    createDeliverable.mockRejectedValue(new Error('Server error'));

    await expect(
      createDeliverableUseCase({ assignment_id: 'asgn-1', title: 'Test' })
    ).rejects.toThrow('Server error');
  });
});