/**
 * Tests para submitDeliverableUseCase.
 * Domain guard: canSubmitDeliverable (status in_progress + valid fileUrl).
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { submitDeliverable } from '../../infrastructure/api/deliverableApi.js';
import { canSubmitDeliverable } from '../../domain/assignment/Assignment.js';

vi.mock('../../infrastructure/api/deliverableApi.js', () => ({
  submitDeliverable: vi.fn(),
}));

const { submitDeliverableUseCase } = await import('./submitDeliverableUseCase.js');

beforeEach(() => {
  vi.clearAllMocks();
});

describe('submitDeliverableUseCase', () => {
  it('calls submitDeliverable API when domain guard passes', async () => {
    const deliverable = { id: 'd1', assignment_id: 'a1', status: 'in_progress' };
    const fileUrl = 'https://example.com/file.pdf';
    submitDeliverable.mockResolvedValue({ id: 'd1', status: 'submitted' });

    const result = await submitDeliverableUseCase(deliverable, fileUrl);

    expect(submitDeliverable).toHaveBeenCalledWith('d1', fileUrl, undefined);
    expect(result.status).toBe('submitted');
  });

  it('passes optional comment to submitDeliverable', async () => {
    const deliverable = { id: 'd1', assignment_id: 'a1', status: 'in_progress' };
    const fileUrl = 'https://example.com/file.pdf';
    const comment = 'First version';
    submitDeliverable.mockResolvedValue({ id: 'd1', status: 'submitted' });

    await submitDeliverableUseCase(deliverable, fileUrl, comment);

    expect(submitDeliverable).toHaveBeenCalledWith('d1', fileUrl, comment);
  });

  it('throws error when domain guard fails (not in_progress)', async () => {
    const deliverable = { id: 'd1', assignment_id: 'a1', status: 'pending' };
    const fileUrl = 'https://example.com/file.pdf';

    await expect(submitDeliverableUseCase(deliverable, fileUrl)).rejects.toThrow(
      'Cannot submit deliverable',
    );
    expect(submitDeliverable).not.toHaveBeenCalled();
  });

  it('throws error when fileUrl is empty', async () => {
    const deliverable = { id: 'd1', assignment_id: 'a1', status: 'in_progress' };

    await expect(submitDeliverableUseCase(deliverable, '')).rejects.toThrow('Cannot submit deliverable');
    expect(submitDeliverable).not.toHaveBeenCalled();
  });

  it('throws error when fileUrl is whitespace', async () => {
    const deliverable = { id: 'd1', assignment_id: 'a1', status: 'in_progress' };

    await expect(submitDeliverableUseCase(deliverable, '   ')).rejects.toThrow('Cannot submit deliverable');
    expect(submitDeliverable).not.toHaveBeenCalled();
  });

  it('propaga error si submitDeliverable API falla', async () => {
    const deliverable = { id: 'd1', assignment_id: 'a1', status: 'in_progress' };
    const fileUrl = 'https://example.com/file.pdf';
    submitDeliverable.mockRejectedValue(new Error('Server error'));

    await expect(submitDeliverableUseCase(deliverable, fileUrl)).rejects.toThrow('Server error');
  });
});