/**
 * Tests para createReviewUseCase.
 * Domain guards: validateReview, canSubmitReview, isDuplicateReviewError (409).
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createReview } from '../../infrastructure/api/reviewApi.js';
import { validateReview, canSubmitReview, isDuplicateReviewError } from '../../domain/review/Review.js';

vi.mock('../../infrastructure/api/reviewApi.js', () => ({
  createReview: vi.fn(),
}));

const { createReviewUseCase } = await import('./createReviewUseCase.js');

beforeEach(() => {
  vi.clearAllMocks();
});

describe('createReviewUseCase', () => {
  const validAssignment = { id: 'a1', status: 'completed' };

  it('calls createReview API when domain validation passes', async () => {
    const reviewData = { assignment: validAssignment, rating: 5, comment: 'Great work!', alreadyReviewed: false };
    createReview.mockResolvedValue({ id: 'r1', ...reviewData });

    const result = await createReviewUseCase(reviewData);

    expect(createReview).toHaveBeenCalledWith({ assignment_id: 'a1', rating: 5, comment: 'Great work!' });
    expect(result.id).toBe('r1');
  });

  it('throws validation error when rating is out of range', async () => {
    const reviewData = { assignment: validAssignment, rating: 0, comment: '', alreadyReviewed: false };
    const { errors } = validateReview(reviewData);

    expect(Object.keys(errors).length).toBeGreaterThan(0);
    await expect(createReviewUseCase(reviewData)).rejects.toThrow('Rating must be an integer between 1 and 5');
    expect(createReview).not.toHaveBeenCalled();
  });

  it('throws validation error when rating is not integer', async () => {
    const reviewData = { assignment: validAssignment, rating: 3.5, comment: '', alreadyReviewed: false };

    await expect(createReviewUseCase(reviewData)).rejects.toThrow('Rating must be an integer between 1 and 5');
    expect(createReview).not.toHaveBeenCalled();
  });

  it('throws error when alreadyReviewed is true', async () => {
    const reviewData = { assignment: validAssignment, rating: 5, comment: 'Great', alreadyReviewed: true };

    expect(canSubmitReview(reviewData.assignment, reviewData.alreadyReviewed)).toBe(false);
    await expect(createReviewUseCase(reviewData)).rejects.toThrow('Cannot submit review');
    expect(createReview).not.toHaveBeenCalled();
  });

  it('throws error when assignment is not completed', async () => {
    const pendingAssignment = { id: 'a1', status: 'assigned' };
    const reviewData = { assignment: pendingAssignment, rating: 5, comment: 'Great', alreadyReviewed: false };

    expect(canSubmitReview(reviewData.assignment, reviewData.alreadyReviewed)).toBe(false);
    await expect(createReviewUseCase(reviewData)).rejects.toThrow('Cannot submit review');
    expect(createReview).not.toHaveBeenCalled();
  });

  it('returns { duplicate: true } on 409 conflict', async () => {
    const reviewData = { assignment: validAssignment, rating: 5, comment: 'Great', alreadyReviewed: false };
    const conflictError = Object.assign(new Error('Conflict'), { response: { status: 409 } });
    createReview.mockRejectedValue(conflictError);

    const result = await createReviewUseCase(reviewData);

    expect(result).toEqual({ duplicate: true });
  });

  it('propaga error si createReview falla con status no-409', async () => {
    const reviewData = { assignment: validAssignment, rating: 5, comment: 'Great', alreadyReviewed: false };
    createReview.mockRejectedValue(new Error('Server error'));

    await expect(createReviewUseCase(reviewData)).rejects.toThrow('Server error');
  });
});