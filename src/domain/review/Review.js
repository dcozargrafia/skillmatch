/**
 * Módulo de dominio: reseñas.
 *
 * Validación de datos de reseña (rating 1-5, comentario no vacío)
 * y guards para determinar si una reseña puede enviarse.
 * Los hooks de review delegan aquí la validación antes de
 * llamar al caso de uso.
 *
 * Nota: isDuplicateReviewError inspecciona error.response.status,
 * asumiendo la estructura de error de Axios. Esto es una
 * dependencia implícita de la forma del error de infraestructura.
 *
 * Sin dependencias directas de React, Axios ni infraestructura.
 */
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