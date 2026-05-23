/**
 * Tests para markProjectCompletedUseCase.
 * - Valida con canCompleteProject (status = in_review + all deliverables approved)
 * - Llama a projectApi.updateProjectStatus para marcar como 'completed'
 * - Propaga error si no se cumplen las condiciones
 * - Retorna el proyecto actualizado
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { updateProjectStatus } from '../../infrastructure/api/projectApi.js';
import { canCompleteProject } from '../../domain/project/Project.js';

vi.mock('../../infrastructure/api/projectApi.js', () => ({
  updateProjectStatus: vi.fn(),
}));

vi.mock('../../domain/project/Project.js', () => ({
  canCompleteProject: vi.fn(),
}));

const { markProjectCompletedUseCase } = await import('./markProjectCompletedUseCase.js');

beforeEach(() => {
  vi.clearAllMocks();
});

describe('markProjectCompletedUseCase', () => {
  it('llama a updateProjectStatus cuando canCompleteProject permite', async () => {
    const project = { id: 'p1', status: 'in_review' };
    const deliverables = [{ id: 'd1', status: 'approved' }, { id: 'd2', status: 'approved' }];
    const mockCompleted = { id: 'p1', status: 'completed' };

    canCompleteProject.mockReturnValue(true);
    updateProjectStatus.mockResolvedValue(mockCompleted);

    const result = await markProjectCompletedUseCase(project, deliverables);

    expect(canCompleteProject).toHaveBeenCalledWith(project, deliverables);
    expect(updateProjectStatus).toHaveBeenCalledWith('p1', 'completed');
    expect(result).toEqual(mockCompleted);
  });

  it('lanza error si canCompleteProject deniega (no in_review)', async () => {
    const project = { id: 'p1', status: 'in_progress' };
    const deliverables = [{ id: 'd1', status: 'approved' }];
    canCompleteProject.mockReturnValue(false);

    await expect(markProjectCompletedUseCase(project, deliverables)).rejects.toThrow(
      'Project cannot be marked as completed',
    );

    expect(updateProjectStatus).not.toHaveBeenCalled();
  });

  it('lanza error si hay entregables no aprobados', async () => {
    const project = { id: 'p1', status: 'in_review' };
    const deliverables = [{ id: 'd1', status: 'approved' }, { id: 'd2', status: 'pending' }];
    canCompleteProject.mockReturnValue(false);

    await expect(markProjectCompletedUseCase(project, deliverables)).rejects.toThrow(
      'Project cannot be marked as completed',
    );

    expect(updateProjectStatus).not.toHaveBeenCalled();
  });

  it('propaga error si updateProjectStatus falla', async () => {
    const project = { id: 'p1', status: 'in_review' };
    const deliverables = [{ id: 'd1', status: 'approved' }];
    canCompleteProject.mockReturnValue(true);
    updateProjectStatus.mockRejectedValue(new Error('Server error'));

    await expect(markProjectCompletedUseCase(project, deliverables)).rejects.toThrow('Server error');
  });
});