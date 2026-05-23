/**
 * Caso de uso: crear una review.
 * Domain guards: validateReview, canSubmitReview, isDuplicateReviewError (409).
 */

import { createReview } from '../../infrastructure/api/reviewApi.js';
import { validateReview, canSubmitReview, isDuplicateReviewError } from '../../domain/review/Review.js';

/**
 * @param {{ assignment: object, rating: number, comment?: string, alreadyReviewed: boolean }} reviewData
 * @returns {Promise<object | { duplicate: true }>}
 * @throws {Error} Si la validación falla o la API falla (excepto 409)
 */
export async function createReviewUseCase({ assignment, rating, comment, alreadyReviewed }) {
  // Validate rating and comment format
  const { errors } = validateReview({ rating, comment });
  if (Object.keys(errors).length > 0) {
    const firstError = Object.values(errors)[0];
    throw new Error(firstError);
  }

  // Guard: can submit review
  if (!canSubmitReview(assignment, alreadyReviewed)) {
    throw new Error('Cannot submit review');
  }

  try {
    return await createReview({ assignment_id: assignment.id, rating, comment });
  } catch (error) {
    if (isDuplicateReviewError(error)) {
      return { duplicate: true };
    }
    throw error;
  }
}