/**
 * Hook: useNgoProjects
 * SDD Phase 3, Task 3.2
 *
 * Carga la lista de proyectos de la ONG autenticada.
 * Llama a getProjectsUseCase — nunca a infrastructure APIs directamente.
 */

import { useState, useEffect, useCallback } from 'react';
import { getProjectsUseCase } from '../../application/project/getProjectsUseCase.js';

/**
 * @returns {{
 *   projects: object[],
 *   loading: boolean,
 *   error: string|null,
 *   refresh: () => Promise<void>,
 * }}
 */
export default function useNgoProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getProjectsUseCase();
      setProjects(data ?? []);
    } catch (err) {
      setError(err?.message ?? 'Error al cargar proyectos.');
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const refresh = useCallback(async () => {
    await loadProjects();
  }, [loadProjects]);

  return { projects, loading, error, refresh };
}