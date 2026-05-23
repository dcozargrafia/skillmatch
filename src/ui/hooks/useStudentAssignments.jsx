/**
 * Hook: useStudentAssignments
 * SDD Phase 3, Task 3.4
 *
 * Carga proyectos asignados + deliverables agrupados por assignment.
 * Llama a getStudentAssignmentsUseCase.
 * NUNCA llama a infrastructure APIs directamente.
 */

import { useState, useEffect, useCallback } from 'react';
import { getStudentAssignmentsUseCase } from '../../application/assignment/getStudentAssignmentsUseCase.js';

/**
 * @returns {{
 *   assignments: object[],
 *   deliverablesByAssignment: object,
 *   loading: boolean,
 *   error: string|null,
 *   refresh: () => void,
 * }}
 */
export default function useStudentAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadAssignments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { assignments: a } = await getStudentAssignmentsUseCase();
      setAssignments(a);
    } catch {
      setError('Error al cargar los proyectos asignados. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAssignments();
  }, [loadAssignments]);

  /**
   * Computed: map de assignmentId -> deliverables[]
   */
  const deliverablesByAssignment = {};
  assignments.forEach((a) => {
    deliverablesByAssignment[a.id] = a.deliverables ?? [];
  });

  const refresh = useCallback(() => {
    loadAssignments();
  }, [loadAssignments]);

  return {
    assignments,
    deliverablesByAssignment,
    loading,
    error,
    refresh,
  };
}