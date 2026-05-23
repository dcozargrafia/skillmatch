/**
 * Hook: useStudentAssignment
 * SDD Phase 3, Task 3.5
 *
 * Carga detalle de assignment + todos sus deliverables.
 * Maneja acceptAssignment, startDeliverable, submitDeliverable con re-sync.
 * NUNCA llama a infrastructure APIs directamente.
 */

import { useState, useEffect, useCallback } from 'react';
import { getStudentAssignmentDetailUseCase } from '../../application/assignment/getStudentAssignmentDetailUseCase.js';
import { startDeliverableUseCase } from '../../application/deliverable/startDeliverableUseCase.js';
import { submitDeliverableUseCase } from '../../application/deliverable/submitDeliverableUseCase.js';
import { acceptAssignmentUseCase } from '../../application/assignment/acceptAssignmentUseCase.js';

/**
 * @param {string} assignmentId
 * @returns {{
 *   assignment: object|null,
 *   deliverables: object[],
 *   loading: boolean,
 *   error: string|null,
 *   actions: {
 *     handleStartDeliverable: (deliverable: object, allDeliverables: object[]) => Promise<void>,
 *     handleSubmitDeliverable: (deliverable: object, fileUrl: string) => Promise<void>,
 *     handleAcceptAssignment: () => Promise<void>,
 *   },
 * }}
 */
export default function useStudentAssignment(assignmentId) {
  const [assignment, setAssignment] = useState(null);
  const [deliverables, setDeliverables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadAssignment = useCallback(async () => {
    if (!assignmentId) return;
    setLoading(true);
    setError(null);
    try {
      const { assignment: a, deliverables: d } = await getStudentAssignmentDetailUseCase(assignmentId);
      setAssignment(a);
      setDeliverables(d ?? []);
    } catch {
      setError('Error al cargar el detalle del proyecto. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }, [assignmentId]);

  useEffect(() => {
    loadAssignment();
  }, [loadAssignment]);

  const handleAcceptAssignment = useCallback(async () => {
    if (!assignment) return;
    setError(null);
    try {
      await acceptAssignmentUseCase(assignment);
      const { assignment: updated, deliverables: d } = await getStudentAssignmentDetailUseCase(assignmentId);
      setAssignment(updated);
      setDeliverables(d ?? []);
    } catch {
      setError('Error al aceptar el proyecto. Intenta de nuevo.');
    }
  }, [assignment, assignmentId]);

  const handleStartDeliverable = useCallback(
    async (deliverable, allDeliverables) => {
      setError(null);
      try {
        await startDeliverableUseCase(deliverable, allDeliverables);
        const { deliverables: d } = await getStudentAssignmentDetailUseCase(assignmentId);
        setDeliverables(d ?? []);
      } catch {
        setError('Error al iniciar el entregable. Intenta de nuevo.');
      }
    },
    [assignmentId]
  );

  const handleSubmitDeliverable = useCallback(
    async (deliverable, fileUrl) => {
      setError(null);
      try {
        await submitDeliverableUseCase(deliverable, fileUrl);
        const { deliverables: d } = await getStudentAssignmentDetailUseCase(assignmentId);
        setDeliverables(d ?? []);
      } catch {
        setError('Error al enviar el entregable. Intenta de nuevo.');
      }
    },
    [assignmentId]
  );

  return {
    assignment,
    deliverables,
    loading,
    error,
    actions: {
      handleStartDeliverable,
      handleSubmitDeliverable,
      handleAcceptAssignment,
    },
  };
}
