import { describe, expect, it } from 'vitest';
import {
  validateReview,
  canSubmitReview,
  isDuplicateReviewError,
} from './Review.js';

describe('Review', () => {
  describe('validateReview', () => {
    it('returns valid for rating 1', () => {
      const result = validateReview({ rating: 1, comment: '' });
      expect(result.errors).toEqual({});
    });

    it('returns valid for rating 5', () => {
      const result = validateReview({ rating: 5, comment: '' });
      expect(result.errors).toEqual({});
    });

    it('returns valid for rating 3 with comment', () => {
      const result = validateReview({ rating: 3, comment: 'Great work!' });
      expect(result.errors).toEqual({});
    });

    it('returns error for rating 0', () => {
      const result = validateReview({ rating: 0, comment: '' });
      expect(result.errors.rating).toBeDefined();
    });

    it('returns error for rating 6', () => {
      const result = validateReview({ rating: 6, comment: '' });
      expect(result.errors.rating).toBeDefined();
    });

    it('returns error for rating -1', () => {
      const result = validateReview({ rating: -1, comment: '' });
      expect(result.errors.rating).toBeDefined();
    });

    it('returns error for rating null', () => {
      const result = validateReview({ rating: null, comment: '' });
      expect(result.errors.rating).toBeDefined();
    });

    it('returns error for rating undefined', () => {
      const result = validateReview({ rating: undefined, comment: '' });
      expect(result.errors.rating).toBeDefined();
    });

    it('returns error when comment is only whitespace', () => {
      const result = validateReview({ rating: 4, comment: '   ' });
      expect(result.errors.comment).toBeDefined();
    });

    it('returns valid when comment is a truthy string', () => {
      const result = validateReview({ rating: 4, comment: 'a' });
      expect(result.errors).toEqual({});
    });

    it('accepts review without comment field', () => {
      const result = validateReview({ rating: 4 });
      expect(result.errors).toEqual({});
    });
  });

  describe('canSubmitReview', () => {
    it('returns true when assignment status is completed and not reviewed', () => {
      expect(canSubmitReview({ status: 'completed' }, false)).toBe(true);
    });

    it('returns false when already reviewed', () => {
      expect(canSubmitReview({ status: 'completed' }, true)).toBe(false);
    });

    it('returns false when assignment status is in_progress', () => {
      expect(canSubmitReview({ status: 'in_progress' }, false)).toBe(false);
    });

    it('returns false when assignment status is assigned', () => {
      expect(canSubmitReview({ status: 'assigned' }, false)).toBe(false);
    });

    it('returns false when no status provided', () => {
      expect(canSubmitReview({}, false)).toBe(false);
    });
  });

  describe('isDuplicateReviewError', () => {
    it('returns true when error response status is 409', () => {
      expect(isDuplicateReviewError({ response: { status: 409 } })).toBe(true);
    });

    it('returns false when error response status is 400', () => {
      expect(isDuplicateReviewError({ response: { status: 400 } })).toBe(false);
    });

    it('returns false when error has no response', () => {
      expect(isDuplicateReviewError({})).toBe(false);
    });

    it('returns false when error is null', () => {
      expect(isDuplicateReviewError(null)).toBe(false);
    });

    it('returns false when error is undefined', () => {
      expect(isDuplicateReviewError(undefined)).toBe(false);
    });
  });
});