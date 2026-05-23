/**
 * Hook: useStudentProjectDetail
 * SDD Phase 3, Task 3.3
 *
 * Carga detalle de proyecto + verificación de aplicación previa.
 * Llama a getStudentProjectDetailUseCase y applyToProjectUseCase.
 * NUNCA llama a infrastructure APIs directamente.
 */

import { useState, useEffect, useCallback } from 'react';
import { getStudentProjectDetailUseCase } from '../../application/student/getStudentProjectDetailUseCase.js';
import { applyToProjectUseCase } from '../../application/application/applyToProjectUseCase.js';

/**
 * @param {string} projectId
 * @returns {{
 *   project: object|null,
 *   skills: object[],
 *   applied: boolean,
 *   loading: boolean,
 *   error: string|null,
 *   successMessage: string,
 *   handleApply: () => Promise<void>,
 * }}
 */
export default function useStudentProjectDetail(projectId) {
  const [project, setProject] = useState(null);
  const [skills, setSkills] = useState([]);
  const [applied, setApplied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const loadProject = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    setError(null);
    try {
      const { project: p, applied: a, skills: s } = await getStudentProjectDetailUseCase(projectId);
      setProject(p);
      setApplied(a);
      setSkills(s);
    } catch {
      setError('Error al cargar el proyecto. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadProject();
  }, [loadProject]);

  /**
   * handleApply: se postula al proyecto.
   * Re-sincroniza para actualizar el estado 'applied'.
   */
  const handleApply = useCallback(async () => {
    if (!projectId) return;
    setError(null);
    setSuccessMessage('');
    try {
      await applyToProjectUseCase(projectId);
      // Re-sync to refresh applied status
      const { project: p, applied: a, skills: s } = await getStudentProjectDetailUseCase(projectId);
      setProject(p);
      setApplied(a);
      setSkills(s);
      setSuccessMessage('Te has postulado al proyecto correctamente.');
    } catch {
      setError('Error al aplicarse al proyecto. Intenta de nuevo.');
    }
  }, [projectId]);

  return {
    project,
    skills,
    applied,
    loading,
    error,
    successMessage,
    handleApply,
  };
}