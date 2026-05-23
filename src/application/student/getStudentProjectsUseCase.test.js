/**
 * Tests para getStudentProjectsUseCase.
 * Carga proyectos + catálogo de habilidades para resolución de nombres.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAllProjects } from '../../infrastructure/api/projectApi.js';
import { getAllSkills } from '../../infrastructure/api/skillsApi.js';

vi.mock('../../infrastructure/api/projectApi.js', () => ({
  getAllProjects: vi.fn(),
}));

vi.mock('../../infrastructure/api/skillsApi.js', () => ({
  getAllSkills: vi.fn(),
}));

const { getStudentProjectsUseCase } = await import('./getStudentProjectsUseCase.js');

beforeEach(() => {
  vi.clearAllMocks();
});

describe('getStudentProjectsUseCase', () => {
  it('returns projects and skills combined', async () => {
    const mockProjects = [
      {
        id: 'p1',
        title: 'Project 1',
        skills: [{ skill_id: 'sk1', required_level: 'basic' }],
      },
    ];
    const mockSkills = [{ id: 'sk1', name: 'JavaScript' }];

    getAllProjects.mockResolvedValue(mockProjects);
    getAllSkills.mockResolvedValue(mockSkills);

    const result = await getStudentProjectsUseCase();

    expect(result.projects).toEqual(mockProjects);
    expect(result.skills).toEqual(mockSkills);
    expect(getAllProjects).toHaveBeenCalledOnce();
    expect(getAllSkills).toHaveBeenCalledOnce();
  });

  it('pasa filtros a getAllProjects', async () => {
    getAllProjects.mockResolvedValue([]);
    getAllSkills.mockResolvedValue([]);

    await getStudentProjectsUseCase({ skill_id: 'sk1' });

    expect(getAllProjects).toHaveBeenCalledWith({ skill_id: 'sk1' });
  });

  it('propaga error si getAllProjects falla', async () => {
    getAllProjects.mockRejectedValue(new Error('Server error'));

    await expect(getStudentProjectsUseCase()).rejects.toThrow('Server error');
  });

  it('propaga error si getAllSkills falla', async () => {
    getAllProjects.mockResolvedValue([]);
    getAllSkills.mockRejectedValue(new Error('Server error'));

    await expect(getStudentProjectsUseCase()).rejects.toThrow('Server error');
  });
});