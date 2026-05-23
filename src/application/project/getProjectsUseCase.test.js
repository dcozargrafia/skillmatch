/**
 * Tests para getProjectsUseCase.
 * - Llama a projectApi.getOwnProjects con filtros opcionales
 * - Retorna la lista de proyectos
 * - Propaga el error si la API falla
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getOwnProjects } from '../../infrastructure/api/projectApi.js';

vi.mock('../../infrastructure/api/projectApi.js', () => ({
  getOwnProjects: vi.fn(),
}));

const { getProjectsUseCase } = await import('./getProjectsUseCase.js');

beforeEach(() => {
  vi.clearAllMocks();
});

describe('getProjectsUseCase', () => {
  it('llama a getOwnProjects sin filtros por defecto', async () => {
    const mockProjects = [
      { id: 'p1', title: 'Project 1', status: 'in_progress' },
      { id: 'p2', title: 'Project 2', status: 'pending' },
    ];
    getOwnProjects.mockResolvedValue(mockProjects);

    const result = await getProjectsUseCase();

    expect(getOwnProjects).toHaveBeenCalledWith({});
    expect(result).toEqual(mockProjects);
  });

  it('pasa filtros a getOwnProjects', async () => {
    const mockProjects = [{ id: 'p1', title: 'Project 1' }];
    getOwnProjects.mockResolvedValue(mockProjects);
    const filters = { status: 'in_progress' };

    const result = await getProjectsUseCase(filters);

    expect(getOwnProjects).toHaveBeenCalledWith(filters);
    expect(result).toEqual(mockProjects);
  });

  it('propaga error si getOwnProjects falla', async () => {
    getOwnProjects.mockRejectedValue(new Error('Network error'));

    await expect(getProjectsUseCase()).rejects.toThrow('Network error');
  });
});