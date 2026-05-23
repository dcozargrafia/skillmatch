/**
 * Tests para useNgoProjectForm (SDD Phase 3, Task 3.3).
 *
 * Hook que maneja el formulario de crear/editar proyecto.
 * Llama a getProjectFormUseCase, createProjectUseCase, updateProjectUseCase.
 *
 * Criterios de aceptación:
 * - Create mode (no projectId): solo carga skills, project=null
 * - Edit mode (projectId provided): carga project + skills
 * - loading state: true inicialmente, false al completar
 * - handleSubmit create: llama createProjectUseCase → navigate al proyecto creado
 * - handleSubmit edit: llama updateProjectUseCase → navigate al proyecto
 * - Error en handleSubmit: error.message seteado (no navigate)
 * - Error en carga: error.message seteado, loading=false
 * - mode: 'create' | 'edit' basado en si projectId fue provisto
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';

vi.mock('../../application/project/getProjectFormUseCase.js', () => ({
  getProjectFormUseCase: vi.fn(),
}));

vi.mock('../../application/project/createProjectUseCase.js', () => ({
  createProjectUseCase: vi.fn(),
}));

vi.mock('../../application/project/updateProjectUseCase.js', () => ({
  updateProjectUseCase: vi.fn(),
}));

const { getProjectFormUseCase } = await import('../../application/project/getProjectFormUseCase.js');
const { createProjectUseCase } = await import('../../application/project/createProjectUseCase.js');
const { updateProjectUseCase } = await import('../../application/project/updateProjectUseCase.js');
const { default: useNgoProjectForm } = await import('./useNgoProjectForm.jsx');

const mockSkills = [
  { id: 's1', name: 'JavaScript' },
  { id: 's2', name: 'React' },
];

const mockProject = {
  id: 'proj-1',
  title: 'Mi Proyecto',
  description: 'Descripción',
  objectives: 'Objetivos',
  estimated_hours: 40,
  deadline: '2025-12-31',
  modality: 'remoto',
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('modo create (sin projectId)', () => {
  it('loading=true inicialmente, luego false', async () => {
    getProjectFormUseCase.mockImplementation(() => new Promise(() => {}));
    const { result } = renderHook(() => useNgoProjectForm(null));

    expect(result.current.loading).toBe(true);
  });

  it('carga skills, project=null, mode=create', async () => {
    getProjectFormUseCase.mockResolvedValue({ project: null, skills: mockSkills });

    const { result } = renderHook(() => useNgoProjectForm(null));

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    expect(result.current.project).toBeNull();
    expect(result.current.skills).toEqual(mockSkills);
    expect(result.current.mode).toBe('create');
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('error en carga: error.message seteado, loading=false', async () => {
    getProjectFormUseCase.mockRejectedValue(new Error('Error al cargar formulario.'));

    const { result } = renderHook(() => useNgoProjectForm(null));

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    expect(result.current.error).toBe('Error al cargar formulario.');
    expect(result.current.loading).toBe(false);
  });
});

describe('modo edit (con projectId)', () => {
  it('carga project + skills, mode=edit', async () => {
    getProjectFormUseCase.mockResolvedValue({ project: mockProject, skills: mockSkills });

    const { result } = renderHook(() => useNgoProjectForm('proj-1'));

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    expect(result.current.project).toEqual(mockProject);
    expect(result.current.skills).toEqual(mockSkills);
    expect(result.current.mode).toBe('edit');
    expect(result.current.loading).toBe(false);
  });
});

describe('handleSubmit', () => {
  it('create: llama createProjectUseCase y retorna el proyecto creado', async () => {
    getProjectFormUseCase.mockResolvedValue({ project: null, skills: mockSkills });
    const createdProject = { id: 'proj-new', title: 'Nuevo' };
    createProjectUseCase.mockResolvedValue(createdProject);

    const { result } = renderHook(() => useNgoProjectForm(null));

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    const submitData = {
      title: 'Nuevo Proyecto',
      description: 'Descripción',
      objectives: 'Objetivos',
      estimated_hours: 20,
      deadline: '2025-12-01',
      modality: 'remoto',
    };

    let submittedProject;
    await act(async () => {
      submittedProject = await result.current.handleSubmit(submitData);
    });

    expect(createProjectUseCase).toHaveBeenCalledWith(submitData);
    expect(submittedProject).toEqual(createdProject);
    expect(result.current.error).toBeNull();
  });

  it('edit: llama updateProjectUseCase y retorna el proyecto actualizado', async () => {
    getProjectFormUseCase.mockResolvedValue({ project: mockProject, skills: mockSkills });
    const updatedProject = { id: 'proj-1', title: 'Actualizado' };
    updateProjectUseCase.mockResolvedValue(updatedProject);

    const { result } = renderHook(() => useNgoProjectForm('proj-1'));

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    const submitData = { title: 'Actualizado', description: 'Desc', objectives: 'Obj', modality: 'remoto' };

    let submittedProject;
    await act(async () => {
      submittedProject = await result.current.handleSubmit(submitData);
    });

    expect(updateProjectUseCase).toHaveBeenCalledWith('proj-1', submitData, undefined, mockProject);
    expect(submittedProject).toEqual(updatedProject);
  });

  it('handleSubmit error: error.message seteado, no returned project', async () => {
    getProjectFormUseCase.mockResolvedValue({ project: null, skills: mockSkills });
    createProjectUseCase.mockRejectedValue(new Error('Error al crear proyecto.'));

    const { result } = renderHook(() => useNgoProjectForm(null));

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    const submitData = { title: 'Nuevo', description: 'Desc', objectives: 'Obj', modality: 'remoto' };

    let submittedProject;
    await act(async () => {
      submittedProject = await result.current.handleSubmit(submitData);
    });

    expect(result.current.error).toBe('Error al crear proyecto.');
    expect(submittedProject).toBeUndefined();
  });
});