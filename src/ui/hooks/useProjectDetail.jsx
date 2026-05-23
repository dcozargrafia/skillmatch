/**
 * Hook: useProjectDetail
 * SDD Phase 3, Task 3.1
 *
 * Carga proyecto + assignment + deliverables + applications
 * y expone acciones de mutación con re-sync automático.
 *
 * Llama application use cases — NUNCA infrastructure APIs directamente.
 */

import { useState, useEffect, useCallback } from 'react';
import { getProjectDetailUseCase } from '../../application/project/getProjectDetailUseCase.js';
import { createDeliverableUseCase } from '../../application/deliverable/createDeliverableUseCase.js';
import { reviewDeliverableUseCase } from '../../application/deliverable/reviewDeliverableUseCase.js';
import { createAssignmentUseCase } from '../../application/assignment/createAssignmentUseCase.js';
import { cancelProjectUseCase } from '../../application/project/cancelProjectUseCase.js';
import { markProjectCompletedUseCase } from '../../application/project/markProjectCompletedUseCase.js';

/**
 * @param {string} projectId
 * @returns {{
 *   project: object|null,
 *   assignment: object|null,
 *   deliverables: object[],
 *   applications: object[],
 *   loading: boolean,
 *   error: string|null,
 *   actions: {
 *     handleReview: (deliverableId: string, status: string) => Promise<void>,
 *     handleCreateDeliverable: (data: {title: string, description: string}) => Promise<void>,
 *     handleSelectCandidate: (applicationId: string) => Promise<void>,
 *     handleCancelProject: () => Promise<void>,
 *     handleMarkCompleted: () => Promise<void>,
 *   }
 * }}
 */
export default function useProjectDetail(projectId) {
  const [project, setProject] = useState(null);
  const [assignment, setAssignment] = useState(null);
  const [deliverables, setDeliverables] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mutation-specific loading flags (optional sub-states)
  const [submittingDeliverable, setSubmittingDeliverable] = useState(false);
  const [selectingId, setSelectingId] = useState(null);
  const [mutatingStatus, setMutatingStatus] = useState(false);

  /**
   * Re-sincroniza el estado del proyecto después de una mutación.
   */
  const syncProjectState = useCallback(async () => {
    if (!projectId) return;
    try {
      const result = await getProjectDetailUseCase(projectId);
      setProject(result.project);
      setAssignment(result.assignment);
      setDeliverables(result.deliverables);
      setApplications(result.applications);
    } catch {
      // On re-sync error, preserve current state — don't overwrite
    }
  }, [projectId]);

  /**
   * Función helper para ejecutar una mutación con re-sync.
   * Mapea errores de infraestructura a mensajes user-friendly.
   */
  const runMutationWithResync = useCallback(
    async (mutationFn, fallbackMessage, forbiddenMessage = null) => {
      setError(null);
      try {
        await mutationFn();
        await syncProjectState();
        return true;
      } catch (err) {
        if (err?.response?.status === 403) {
          setError(forbiddenMessage ?? 'No tienes permiso para realizar esta acción.');
        } else if (err?.response?.status === 400) {
          setError('No se pudo completar la transición de estado solicitada.');
        } else {
          setError(fallbackMessage);
        }
        // Try to re-sync even on error (to refresh state)
        try {
          await syncProjectState();
        } catch {
          // noop
        }
        return false;
      }
    },
    [syncProjectState]
  );

  // Carga inicial
  useEffect(() => {
    if (!projectId) return;

    setLoading(true);
    setError(null);
    setProject(null);
    setAssignment(null);
    setDeliverables([]);
    setApplications([]);

    getProjectDetailUseCase(projectId)
      .then((result) => {
        setProject(result.project);
        setAssignment(result.assignment);
        setDeliverables(result.deliverables);
        setApplications(result.applications);
        setLoading(false);
      })
      .catch((err) => {
        setError(err?.message ?? 'Error al cargar el proyecto.');
        setLoading(false);
      });
  }, [projectId]);

  /**
   * handleReview: aprueba o rechaza un entregable.
   */
  const handleReview = useCallback(
    async (deliverableId, status) => {
      await runMutationWithResync(
        () => reviewDeliverableUseCase(deliverableId, { status }),
        'Error al revisar el entregable. Intenta de nuevo.'
      );
    },
    [runMutationWithResync]
  );

  /**
   * handleCreateDeliverable: crea un nuevo entregable.
   */
  const handleCreateDeliverable = useCallback(
    async ({ title, description }) => {
      if (!title?.trim() || !assignment?.id) return false;

      setSubmittingDeliverable(true);
      const created = await runMutationWithResync(
        () =>
          createDeliverableUseCase({
            assignment_id: assignment.id,
            title: title.trim(),
            description: description?.trim() || '',
          }),
        'Error al crear el entregable. Intenta de nuevo.',
        'No tienes permiso para crear entregables.'
      );
      setSubmittingDeliverable(false);
      return created;
    },
    [runMutationWithResync, assignment]
  );

  /**
   * handleSelectCandidate: selecciona un candidato (crea assignment).
   */
  const handleSelectCandidate = useCallback(
    async (applicationId) => {
      setError(null);
      setSelectingId(applicationId);
      try {
        await createAssignmentUseCase(applicationId);
        await syncProjectState();
      } catch (err) {
        if (err?.response?.status === 403) {
          setError('No tienes permiso para realizar esta acción.');
        } else {
          setError('Error al seleccionar el candidato. Intenta de nuevo.');
        }
      } finally {
        setSelectingId(null);
      }
    },
    [syncProjectState]
  );

  /**
   * handleCancelProject: cancela el proyecto.
   */
  const handleCancelProject = useCallback(async () => {
    if (!window.confirm('¿Seguro que querés cancelar este proyecto?')) return;

    setMutatingStatus(true);
    await runMutationWithResync(
      () => cancelProjectUseCase(projectId, project?.status),
      'Error al cancelar el proyecto. Intenta de nuevo.'
    );
    setMutatingStatus(false);
  }, [runMutationWithResync, projectId, project?.status]);

  /**
   * handleMarkCompleted: marca el proyecto como completado.
   */
  const handleMarkCompleted = useCallback(async () => {
    setMutatingStatus(true);
    await runMutationWithResync(
      () => markProjectCompletedUseCase(project, deliverables),
      'Error al marcar el proyecto como completado. Intenta de nuevo.'
    );
    setMutatingStatus(false);
  }, [runMutationWithResync, project, deliverables]);

  return {
    project,
    assignment,
    deliverables,
    applications,
    loading,
    error,
    actions: {
      handleReview,
      handleCreateDeliverable,
      handleSelectCandidate,
      handleCancelProject,
      handleMarkCompleted,
    },
  };
}