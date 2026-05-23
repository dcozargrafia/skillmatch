/**
 * Hook: useNgoProjectForm
 * SDD Phase 3, Task 3.3
 *
 * Maneja crear/editar proyecto para NgoProjectFormPage.
 * Llama a getProjectFormUseCase, createProjectUseCase, updateProjectUseCase.
 * NUNCA llama a infrastructure APIs directamente.
 *
 * @param {string|null} projectId - null para create, ID para edit
 * @returns {{
 *   project: object|null,
 *   skills: object[],
 *   loading: boolean,
 *   error: string|null,
 *   mode: 'create'|'edit',
 *   handleSubmit: (data: object) => Promise<object|undefined>,
 * }}
 */
import { useState, useEffect, useCallback } from 'react';
import { getProjectFormUseCase } from '../../application/project/getProjectFormUseCase.js';
import { createProjectUseCase } from '../../application/project/createProjectUseCase.js';
import { updateProjectUseCase } from '../../application/project/updateProjectUseCase.js';

export default function useNgoProjectForm(projectId) {
  const [project, setProject] = useState(null);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isEdit = Boolean(projectId);
  const mode = isEdit ? 'edit' : 'create';

  useEffect(() => {
    if (!projectId) {
      // Create mode — load skills only
      setLoading(true);
      setError(null);
      getProjectFormUseCase(null)
        .then(({ project: _project, skills: s }) => {
          setProject(null);
          setSkills(s);
          setLoading(false);
        })
        .catch((err) => {
          setError(err?.message ?? 'Error al cargar formulario.');
          setLoading(false);
        });
    } else {
      // Edit mode — load project + skills
      setLoading(true);
      setError(null);
      getProjectFormUseCase(projectId)
        .then(({ project: p, skills: s }) => {
          setProject(p);
          setSkills(s);
          setLoading(false);
        })
        .catch((err) => {
          setError(err?.message ?? 'Error al cargar formulario.');
          setLoading(false);
        });
    }
  }, [projectId]);

  /**
   * handleSubmit: crea o actualiza el proyecto.
   * @param {object} data - campos del formulario
   * @param {object[]} [skills] - skills seleccionados (solo para edit mode)
   * @returns {Promise<object|undefined>} - proyecto creado/actualizado, o undefined si error
   */
  const handleSubmit = useCallback(
    async (data, skills) => {
      setError(null);
      try {
        if (isEdit) {
          const args = [projectId, data, undefined, project];
          if (skills !== undefined) args.push(skills);
          const updated = await updateProjectUseCase(...args);
          return updated;
        } else {
          const created = await createProjectUseCase(data);
          return created;
        }
      } catch (err) {
        const msg =
          err?.response?.status === 403
            ? 'No tienes permiso para editar este proyecto.'
            : err?.message ?? 'Error al guardar el proyecto. Intenta de nuevo.';
        setError(msg);
        return undefined;
      }
    },
    [isEdit, projectId, project]
  );

  return { project, skills, loading, error, mode, handleSubmit };
}