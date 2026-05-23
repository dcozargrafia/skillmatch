/**
 * Tests para updateProjectUseCase.
 * - Valida propiedad via canEditProject antes de llamar a la API
 * - Propaga el error si el dominio no permite la edición
 * - Llama a projectApi.updateProject con los datos
 * - Retorna el proyecto actualizado
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { updateProject, updateProjectSkills } from '../../infrastructure/api/projectApi.js';
import { canEditProject } from '../../domain/ngo/Ngo.js';

vi.mock('../../infrastructure/api/projectApi.js', () => ({
  updateProject: vi.fn(),
  updateProjectSkills: vi.fn(),
}));

vi.mock('../../domain/ngo/Ngo.js', () => ({
  canEditProject: vi.fn(),
}));

const { updateProjectUseCase } = await import('./updateProjectUseCase.js');

beforeEach(() => {
  vi.clearAllMocks();
});

describe('updateProjectUseCase', () => {
  it('llama a updateProject cuando canEditProject permite', async () => {
    const project = { id: 'p1', ngo_user_id: 'ngo1', status: 'pending' };
    const updateData = { title: 'Updated Title' };
    const mockUpdated = { id: 'p1', ...updateData, status: 'pending' };

    canEditProject.mockReturnValue(true);
    updateProject.mockResolvedValue(mockUpdated);

    const result = await updateProjectUseCase('p1', updateData, 'ngo1', project);

    expect(canEditProject).toHaveBeenCalledWith(project, 'ngo1');
    expect(updateProject).toHaveBeenCalledWith('p1', updateData);
    expect(result).toEqual(mockUpdated);
  });

  it('lanza error si canEditProject deniega', async () => {
    const project = { id: 'p1', ngo_user_id: 'ngo1', status: 'completed' };
    canEditProject.mockReturnValue(false);

    await expect(
      updateProjectUseCase('p1', { title: 'New' }, 'ngo1', project),
    ).rejects.toThrow('No permission to edit this project');

    expect(updateProject).not.toHaveBeenCalled();
  });

  it('propaga error si updateProject falla', async () => {
    const project = { id: 'p1', ngo_user_id: 'ngo1', status: 'pending' };
    canEditProject.mockReturnValue(true);
    updateProject.mockRejectedValue(new Error('Server error'));

    await expect(
      updateProjectUseCase('p1', { title: 'New' }, 'ngo1', project),
    ).rejects.toThrow('Server error');
  });

  it('cuando skills array es proporcionado, llama a updateProjectSkills tras updateProject', async () => {
    const project = { id: 'p1', ngo_user_id: 'ngo1', status: 'pending' };
    const updateData = { title: 'Updated Title' };
    const skills = [{ skill_id: 's1', required_level: 'basic' }];
    const mockUpdated = { id: 'p1', ...updateData, status: 'pending' };

    canEditProject.mockReturnValue(true);
    updateProject.mockResolvedValue(mockUpdated);
    updateProjectSkills.mockResolvedValue(undefined);

    const result = await updateProjectUseCase('p1', updateData, 'ngo1', project, skills);

    expect(updateProject).toHaveBeenCalledWith('p1', updateData);
    expect(updateProjectSkills).toHaveBeenCalledWith('p1', skills);
    expect(result).toEqual(mockUpdated);
  });

  it('lanza error si updateProjectSkills falla tras updateProject exitoso (partial failure)', async () => {
    const project = { id: 'p1', ngo_user_id: 'ngo1', status: 'pending' };
    const updateData = { title: 'Updated Title' };
    const skills = [{ skill_id: 's1', required_level: 'basic' }];
    const mockUpdated = { id: 'p1', ...updateData, status: 'pending' };

    canEditProject.mockReturnValue(true);
    updateProject.mockResolvedValue(mockUpdated);
    updateProjectSkills.mockRejectedValue(new Error('Skills update failed'));

    await expect(
      updateProjectUseCase('p1', updateData, 'ngo1', project, skills),
    ).rejects.toThrow('Skills update failed');
  });

  it('cuando skills es undefined o vacio, no llama a updateProjectSkills', async () => {
    const project = { id: 'p1', ngo_user_id: 'ngo1', status: 'pending' };
    const updateData = { title: 'Updated Title' };
    const mockUpdated = { id: 'p1', ...updateData, status: 'pending' };

    canEditProject.mockReturnValue(true);
    updateProject.mockResolvedValue(mockUpdated);

    const result1 = await updateProjectUseCase('p1', updateData, 'ngo1', project, undefined);
    const result2 = await updateProjectUseCase('p1', updateData, 'ngo1', project, []);
    const result3 = await updateProjectUseCase('p1', updateData, 'ngo1', project);

    expect(updateProjectSkills).not.toHaveBeenCalled();
    expect(result1).toEqual(mockUpdated);
    expect(result2).toEqual(mockUpdated);
    expect(result3).toEqual(mockUpdated);
  });

  it('verifica propiedad con canEditProject antes de cualquier update', async () => {
    const project = { id: 'p1', ngo_user_id: 'ngo1', status: 'completed' };
    const skills = [{ skill_id: 's1', required_level: 'advanced' }];

    canEditProject.mockReturnValue(false);

    await expect(
      updateProjectUseCase('p1', { title: 'New' }, 'ngo1', project, skills),
    ).rejects.toThrow('No permission to edit this project');

    expect(updateProject).not.toHaveBeenCalled();
    expect(updateProjectSkills).not.toHaveBeenCalled();
  });
});