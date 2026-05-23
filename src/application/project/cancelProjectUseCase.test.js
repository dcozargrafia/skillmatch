/**
 * Tests para cancelProjectUseCase.
 * - Valida con canCancelProject antes de llamar a la API
 * - Propaga el error si el dominio no permite cancelar
 * - Llama a projectApi.cancelProject
 * - Retorna el proyecto cancelado
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { cancelProject } from '../../infrastructure/api/projectApi.js';
import { canCancelProject } from '../../domain/ngo/Ngo.js';

vi.mock('../../infrastructure/api/projectApi.js', () => ({
  cancelProject: vi.fn(),
}));

vi.mock('../../domain/ngo/Ngo.js', () => ({
  canCancelProject: vi.fn(),
}));

const { cancelProjectUseCase } = await import('./cancelProjectUseCase.js');

beforeEach(() => {
  vi.clearAllMocks();
});

describe('cancelProjectUseCase', () => {
  it('llama a cancelProject cuando canCancelProject permite', async () => {
    const mockCancelled = { id: 'p1', status: 'cancelled' };
    canCancelProject.mockReturnValue(true);
    cancelProject.mockResolvedValue(mockCancelled);

    const result = await cancelProjectUseCase('p1', 'pending');

    expect(canCancelProject).toHaveBeenCalledWith('pending');
    expect(cancelProject).toHaveBeenCalledWith('p1');
    expect(result).toEqual(mockCancelled);
  });

  it('lanza error si canCancelProject deniega', async () => {
    canCancelProject.mockReturnValue(false);

    await expect(cancelProjectUseCase('p1', 'completed')).rejects.toThrow(
      'Cannot cancel project in terminal status',
    );

    expect(cancelProject).not.toHaveBeenCalled();
  });

  it('propaga error si cancelProject falla', async () => {
    canCancelProject.mockReturnValue(true);
    cancelProject.mockRejectedValue(new Error('Server error'));

    await expect(cancelProjectUseCase('p1', 'pending')).rejects.toThrow('Server error');
  });
});