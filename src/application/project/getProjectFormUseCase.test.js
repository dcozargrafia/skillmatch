/**
 * Tests para getProjectFormUseCase.
 * - Create mode: carga solo skills
 * - Edit mode: carga project + skills
 * - Retorna { project?, skills } según el modo
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getProjectById } from '../../infrastructure/api/projectApi.js';
import { getAllSkills } from '../../infrastructure/api/skillsApi.js';

vi.mock('../../infrastructure/api/projectApi.js', () => ({
  getProjectById: vi.fn(),
}));

vi.mock('../../infrastructure/api/skillsApi.js', () => ({
  getAllSkills: vi.fn(),
}));

const { getProjectFormUseCase } = await import('./getProjectFormUseCase.js');

beforeEach(() => {
  vi.clearAllMocks();
});

describe('getProjectFormUseCase', () => {
  describe('create mode (projectId omitted)', () => {
    it('retorna skills para formulario de creación', async () => {
      const mockSkills = [{ id: 's1', name: 'React' }, { id: 's2', name: 'Node' }];
      getAllSkills.mockResolvedValue(mockSkills);

      const result = await getProjectFormUseCase();

      expect(getAllSkills).toHaveBeenCalledWith({});
      expect(result).toEqual({ project: null, skills: mockSkills });
    });
  });

  describe('edit mode (projectId provided)', () => {
    it('carga project + skills para formulario de edición', async () => {
      const mockProject = { id: 'p1', title: 'Test Project' };
      const mockSkills = [{ id: 's1', name: 'React' }];
      getProjectById.mockResolvedValue(mockProject);
      getAllSkills.mockResolvedValue(mockSkills);

      const result = await getProjectFormUseCase('p1');

      expect(getProjectById).toHaveBeenCalledWith('p1');
      expect(getAllSkills).toHaveBeenCalledWith({});
      expect(result).toEqual({ project: mockProject, skills: mockSkills });
    });

    it('propaga error si getProjectById falla', async () => {
      const mockSkills = [{ id: 's1', name: 'React' }];
      getProjectById.mockRejectedValue(new Error('Not found'));
      getAllSkills.mockResolvedValue(mockSkills);

      await expect(getProjectFormUseCase('p999')).rejects.toThrow('Not found');
    });
  });
});