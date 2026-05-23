/**
 * Test: useStudentReview
 * SDD Phase 3, Task 3.7
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';

vi.mock('../../application/review/createReviewUseCase.js', () => ({
  createReviewUseCase: vi.fn(),
}));

const { createReviewUseCase } = await import('../../application/review/createReviewUseCase.js');

const { default: useStudentReview } = await import('./useStudentReview.jsx');

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useStudentReview', () => {
  it('handleSubmitReview calls createReviewUseCase and sets reviewSent=true', async () => {
    createReviewUseCase.mockResolvedValue({ success: true });

    const { result } = renderHook(() => useStudentReview());

    const reviewData = { assignment_id: 'asgn-1', rating: 5, comment: 'Great project!' };

    await act(async () => {
      await result.current.handleSubmitReview(reviewData);
    });

    expect(createReviewUseCase).toHaveBeenCalledWith(reviewData);
    expect(result.current.submitting).toBe(false);
    expect(result.current.reviewSent).toBe(true);
    expect(result.current.error).toBe(null);
  });

  it('handleSubmitReview sets error on failure', async () => {
    createReviewUseCase.mockRejectedValue(new Error('Submit failed'));

    const { result } = renderHook(() => useStudentReview());

    await act(async () => {
      await result.current.handleSubmitReview({ assignment_id: 'asgn-1', rating: 5, comment: 'Good' });
    });

    expect(result.current.error).toBe('Error al enviar la valoración. Intenta de nuevo.');
    expect(result.current.submitting).toBe(false);
    expect(result.current.reviewSent).toBe(false);
  });

  it('handleSubmitReview detects duplicate review (409)', async () => {
    const err409 = new Error('Duplicate');
    err409.response = { status: 409 };
    createReviewUseCase.mockRejectedValue(err409);

    const { result } = renderHook(() => useStudentReview());

    await act(async () => {
      await result.current.handleSubmitReview({ assignment_id: 'asgn-1', rating: 5, comment: 'Nice' });
    });

    expect(result.current.error).toBe('Ya has valorado este proyecto.');
    expect(result.current.submitting).toBe(false);
  });

  it('reviewSent remains true after submission', async () => {
    createReviewUseCase.mockResolvedValue({ success: true });

    const { result } = renderHook(() => useStudentReview());

    await act(async () => {
      await result.current.handleSubmitReview({ assignment_id: 'asgn-1', rating: 5, comment: 'Great' });
    });

    expect(result.current.reviewSent).toBe(true);

    // Second submission should also succeed
    createReviewUseCase.mockClear();
    createReviewUseCase.mockResolvedValue({ success: true });

    await act(async () => {
      await result.current.handleSubmitReview({ assignment_id: 'asgn-1', rating: 4, comment: 'Good' });
    });

    expect(result.current.reviewSent).toBe(true);
  });

  it('clears error before new submit attempt', async () => {
    createReviewUseCase.mockRejectedValue(new Error('fail'));

    const { result } = renderHook(() => useStudentReview());

    await act(async () => {
      await result.current.handleSubmitReview({ assignment_id: 'asgn-1', rating: 5, comment: 'Ok' });
    });
    expect(result.current.error).toBeTruthy();

    createReviewUseCase.mockResolvedValue({ success: true });

    await act(async () => {
      await result.current.handleSubmitReview({ assignment_id: 'asgn-1', rating: 4, comment: 'Better' });
    });

    expect(result.current.error || '').toBe('');
    expect(result.current.reviewSent).toBe(true);
  });

});
