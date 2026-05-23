/**
 * Hook: useStudentReview
 * SDD Phase 3, Task 3.7
 *
 * Maneja el envío de reseñas/votaciones de proyectos completados.
 * Llama a createReviewUseCase.
 * NUNCA llama a infrastructure APIs directamente.
 */

import { useState, useCallback } from 'react';
import { createReviewUseCase } from '../../application/review/createReviewUseCase.js';

/**
 * @returns {{
 *   submitting: boolean,
 *   reviewSent: boolean,
 *   error: string|null,
 *   handleSubmitReview: (data: {assignment_id: string, rating: number, comment: string}) => Promise<void>,
 * }}
 */
export default function useStudentReview() {
  const [submitting, setSubmitting] = useState(false);
  const [reviewSent, setReviewSent] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmitReview = useCallback(async (data) => {
    setError(null);
    setSubmitting(true);
    try {
      await createReviewUseCase(data);
      setReviewSent(true);
    } catch (err) {
      if (err?.response?.status === 409) {
        setError('Ya has valorado este proyecto.');
      } else {
        setError('Error al enviar la valoración. Intenta de nuevo.');
      }
    } finally {
      setSubmitting(false);
    }
  }, []);

  return {
    submitting,
    reviewSent,
    error,
    handleSubmitReview,
  };
}