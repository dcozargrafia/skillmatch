/**
 * Tests para getStudentProjectDetailUseCase.
 * Carga detalle de proyecto + verificación de aplicación previa + catálogo de skills.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getProjectById } from '../../infrastructure/api/projectApi.js';
import { getOwnApplications } from '../../infrastructure/api/applicationApi.js';
import { getAllSkills } from '../../infrastructure/api/skillsApi.js';

vi.mock('../../infrastructure/api/projectApi.js', () => ({
  getProjectById: vi.fn(),
}));

vi.mock('../../infrastructure/api/applicationApi.js', () => ({
  getOwnApplications: vi.fn(),
}));

vi.mock('../../infrastructure/api/skillsApi.js', () => ({
  getAllSkills: vi.fn(),
}));

const { getStudentProjectDetailUseCase } = await import('./getStudentProjectDetailUseCase.js');

beforeEach(() => {
  vi.clearAllMocks();
});

describe('getStudentProjectDetailUseCase', () => {
  it('returns project, applied flag, and skills', async () => {
    const mockProject = { id: 'p1', title: 'Test Project', skills: [] };
    const mockApplications = [{ project_id: 'p1', status: 'pending' }];
    const mockSkills = [{ id: 'sk1', name: 'JavaScript' }];

    getProjectById.mockResolvedValue(mockProject);
    getOwnApplications.mockResolvedValue(mockApplications);
    getAllSkills.mockResolvedValue(mockSkills);

    const result = await getStudentProjectDetailUseCase('p1');

    expect(result.project).toEqual(mockProject);
    expect(result.applied).toBe(true);
    expect(result.skills).toEqual(mockSkills);
  });

  it('returns applied: false when student has not applied', async () => {
    const mockProject = { id: 'p1', title: 'Test Project', skills: [] };
    getProjectById.mockResolvedValue(mockProject);
    getOwnApplications.mockResolvedValue([{ project_id: 'other', status: 'pending' }]);
    getAllSkills.mockResolvedValue([]);

    const result = await getStudentProjectDetailUseCase('p1');

    expect(result.applied).toBe(false);
  });

  it('returns applied: false when student has no applications', async () => {
    const mockProject = { id: 'p1', title: 'Test Project', skills: [] };
    getProjectById.mockResolvedValue(mockProject);
    getOwnApplications.mockResolvedValue([]);
    getAllSkills.mockResolvedValue([]);

    const result = await getStudentProjectDetailUseCase('p1');

    expect(result.applied).toBe(false);
  });

  it('propaga error si getProjectById falla', async () => {
    getProjectById.mockRejectedValue(new Error('Not found'));

    await expect(getStudentProjectDetailUseCase('p1')).rejects.toThrow('Not found');
  });
});