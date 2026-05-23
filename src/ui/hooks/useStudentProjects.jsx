/**
 * Hook: useStudentProjects
 * SDD Phase 3, Task 3.2
 *
 * Carga proyectos disponibles + catálogo de skills para filtrado.
 * Llama a getStudentProjectsUseCase.
 * NUNCA llama a infrastructure APIs directamente.
 */

import { useState, useEffect, useCallback } from 'react';
import { getStudentProjectsUseCase } from '../../application/student/getStudentProjectsUseCase.js';

/**
 * @returns {{
 *   projects: object[],
 *   skills: object[],
 *   loading: boolean,
 *   error: string|null,
 *   selectedSkillId: string,
 *   setSelectedSkillId: (skillId: string) => void,
 *   refresh: () => void,
 * }}
 */
export default function useStudentProjects() {
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSkillId, setSelectedSkillId] = useState('');

  const loadProjects = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const { projects: p, skills: s } = await getStudentProjectsUseCase(filters);
      setProjects(p);
      setSkills(s);
    } catch {
      setError('Error al cargar los proyectos. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProjects(selectedSkillId ? { skill_id: selectedSkillId } : {});
  }, [loadProjects, selectedSkillId]);

  const handleSetSelectedSkillId = useCallback(
    (skillId) => {
      setSelectedSkillId(skillId);
    },
    []
  );

  const refresh = useCallback(() => {
    loadProjects(selectedSkillId ? { skill_id: selectedSkillId } : {});
  }, [loadProjects, selectedSkillId]);

  return {
    projects,
    skills,
    loading,
    error,
    selectedSkillId,
    setSelectedSkillId: handleSetSelectedSkillId,
    refresh,
  };
}