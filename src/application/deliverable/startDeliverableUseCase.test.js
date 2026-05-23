/**
 * Tests para startDeliverableUseCase.
 * Domain guard: canStartDeliverable (status pending/rejected + no other active).
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { startDeliverable } from '../../infrastructure/api/deliverableApi.js';
import { canStartDeliverable } from '../../domain/assignment/Assignment.js';

vi.mock('../../infrastructure/api/deliverableApi.js', () => ({
  startDeliverable: vi.fn(),
}));

const { startDeliverableUseCase } = await import('./startDeliverableUseCase.js');

beforeEach(() => {
  vi.clearAllMocks();
});

describe('startDeliverableUseCase', () => {
  it('calls startDeliverable API when domain guard passes', async () => {
    const deliverable = { id: 'd1', assignment_id: 'a1', status: 'pending' };
    const allDeliverables = [deliverable];
    startDeliverable.mockResolvedValue({ id: 'd1', status: 'in_progress' });

    const result = await startDeliverableUseCase(deliverable, allDeliverables);

    expect(startDeliverable).toHaveBeenCalledWith('d1');
    expect(result.status).toBe('in_progress');
  });

  it('throws error when domain guard fails (status not pending/rejected)', async () => {
    const deliverable = { id: 'd1', assignment_id: 'a1', status: 'in_progress' };
    const allDeliverables = [deliverable];

    await expect(startDeliverableUseCase(deliverable, allDeliverables)).rejects.toThrow(
      'Cannot start deliverable',
    );
    expect(startDeliverable).not.toHaveBeenCalled();
  });

  it('throws error when other deliverable is active', async () => {
    const deliverable = { id: 'd1', assignment_id: 'a1', status: 'pending' };
    const otherActive = { id: 'd2', assignment_id: 'a1', status: 'in_progress' };
    const allDeliverables = [deliverable, otherActive];

    await expect(startDeliverableUseCase(deliverable, allDeliverables)).rejects.toThrow(
      'Cannot start deliverable',
    );
    expect(startDeliverable).not.toHaveBeenCalled();
  });

  it('propaga error si startDeliverable API falla', async () => {
    const deliverable = { id: 'd1', assignment_id: 'a1', status: 'pending' };
    const allDeliverables = [deliverable];
    startDeliverable.mockRejectedValue(new Error('Server error'));

    await expect(startDeliverableUseCase(deliverable, allDeliverables)).rejects.toThrow('Server error');
  });
});