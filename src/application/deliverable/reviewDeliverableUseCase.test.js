/**
 * Tests para reviewDeliverableUseCase.
 * - Llama a deliverableApi.reviewDeliverable con id + data (approve/reject)
 * - Retorna el deliverable actualizado
 * - Propaga error si la API falla
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { reviewDeliverable } from '../../infrastructure/api/deliverableApi.js';

vi.mock('../../infrastructure/api/deliverableApi.js', () => ({
  reviewDeliverable: vi.fn(),
}));

const { reviewDeliverableUseCase } = await import('./reviewDeliverableUseCase.js');

beforeEach(() => {
  vi.clearAllMocks();
});

describe('reviewDeliverableUseCase', () => {
  it('llama a reviewDeliverable con id y data de revisión', async () => {
    const mockReviewed = {
      id: 'd1',
      status: 'approved',
      reviewer_comment: 'Good work',
    };
    reviewDeliverable.mockResolvedValue(mockReviewed);

    const result = await reviewDeliverableUseCase('d1', {
      status: 'approved',
      comment: 'Good work',
    });

    expect(reviewDeliverable).toHaveBeenCalledWith('d1', {
      status: 'approved',
      comment: 'Good work',
    });
    expect(result).toEqual(mockReviewed);
  });

  it('retorna el deliverable actualizado en respuesta exitosa', async () => {
    const mockReviewed = { id: 'd1', status: 'rejected', reviewer_comment: 'Needs revision' };
    reviewDeliverable.mockResolvedValue(mockReviewed);

    const result = await reviewDeliverableUseCase('d1', { status: 'rejected', comment: 'Needs revision' });

    expect(result).toEqual(mockReviewed);
  });

  it('propaga error si reviewDeliverable falla', async () => {
    reviewDeliverable.mockRejectedValue(new Error('Server error'));

    await expect(
      reviewDeliverableUseCase('d1', { status: 'approved', comment: 'ok' }),
    ).rejects.toThrow('Server error');
  });
});