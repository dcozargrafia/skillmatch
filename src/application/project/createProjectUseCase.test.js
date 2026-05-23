/**
 * Tests para createProjectUseCase.
 * - Llama a projectApi.createProject con los datos recibidos
 * - Valida con validateNgoProfile antes de enviar
 * - Propaga el error si la API falla
 * - Retorna el proyecto creado
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createProject } from '../../infrastructure/api/projectApi.js';
import { validateNgoProfile } from '../../domain/ngo/Ngo.js';

vi.mock('../../infrastructure/api/projectApi.js', () => ({
  createProject: vi.fn(),
}));

vi.mock('../../domain/ngo/Ngo.js', () => ({
  validateNgoProfile: vi.fn(),
}));

const { createProjectUseCase } = await import('./createProjectUseCase.js');

beforeEach(() => {
  vi.clearAllMocks();
});

describe('createProjectUseCase', () => {
  it('llama a createProject con los datos del proyecto', async () => {
    const projectData = {
      title: 'Test Project',
      description: 'Description',
      max_students: 3,
    };
    const mockCreatedProject = { id: 'p1', ...projectData, status: 'pending' };

    validateNgoProfile.mockReturnValue({ values: projectData, errors: {} });
    createProject.mockResolvedValue(mockCreatedProject);

    const result = await createProjectUseCase(projectData);

    expect(createProject).toHaveBeenCalledWith(projectData);
    expect(result).toEqual(mockCreatedProject);
  });

  it('propaga error si validateNgoProfile retorna errores', async () => {
    const projectData = { title: '', description: 'Desc' };
    validateNgoProfile.mockReturnValue({
      values: { title: '' },
      errors: { title: 'Title is required' },
    });

    await expect(createProjectUseCase(projectData)).rejects.toThrow('Title is required');
    expect(createProject).not.toHaveBeenCalled();
  });

  it('retorna el proyecto creado en respuesta exitosa', async () => {
    const projectData = { title: 'New Project', description: 'Desc' };
    const mockProject = { id: 'p2', title: 'New Project', status: 'pending' };

    validateNgoProfile.mockReturnValue({ values: projectData, errors: {} });
    createProject.mockResolvedValue(mockProject);

    const result = await createProjectUseCase(projectData);

    expect(result).toEqual(mockProject);
  });

  it('propaga error si createProject falla', async () => {
    const projectData = { title: 'Test', description: 'Desc' };
    validateNgoProfile.mockReturnValue({ values: projectData, errors: {} });
    createProject.mockRejectedValue(new Error('Server error'));

    await expect(createProjectUseCase(projectData)).rejects.toThrow('Server error');
  });
});