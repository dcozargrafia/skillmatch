/**
 * Tests para updateProjectUseCase.
 * - Valida propiedad via canEditProject antes de llamar a la API
 * - Propaga el error si el dominio no permite la edición
 * - Llama a projectApi.updateProject con los datos
 * - Retorna el proyecto actualizado
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { updateProject } from '../../infrastructure/api/projectApi.js';
import { canEditProject } from '../../domain/ngo/Ngo.js';

vi.mock('../../infrastructure/api/projectApi.js', () => ({
  updateProject: vi.fn(),
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
});