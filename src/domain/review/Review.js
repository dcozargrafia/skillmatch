export function validateReview({ rating, comment }) {
  const errors = {};

  if (
    rating === undefined ||
    rating === null ||
    !Number.isInteger(rating) ||
    rating < 1 ||
    rating > 5
  ) {
    errors.rating = 'Rating must be an integer between 1 and 5';
  }

  if (comment && typeof comment === 'string' && !comment.trim()) {
    errors.comment = 'Comment cannot be only whitespace';
  }

  return { errors };
}

export function canSubmitReview(assignment, alreadyReviewed) {
  if (alreadyReviewed) return false;
  return assignment?.status === 'completed';
}

export function isDuplicateReviewError(error) {
  return error?.response?.status === 409;
}