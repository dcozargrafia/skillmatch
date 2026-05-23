/**
 * Tests para applyToProjectUseCase.
 * - Llama a applicationApi.createApplication con projectId
 * - Retorna la aplicación creada
 * - Propaga error si la API falla
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createApplication } from '../../infrastructure/api/applicationApi.js';

vi.mock('../../infrastructure/api/applicationApi.js', () => ({
  createApplication: vi.fn(),
}));

const { applyToProjectUseCase } = await import('./applyToProjectUseCase.js');

beforeEach(() => {
  vi.clearAllMocks();
});

describe('applyToProjectUseCase', () => {
  it('llama a createApplication con el projectId', async () => {
    const mockApplication = { id: 'app1', project_id: 'p1', status: 'pending' };
    createApplication.mockResolvedValue(mockApplication);

    const result = await applyToProjectUseCase('p1');

    expect(createApplication).toHaveBeenCalledWith('p1');
    expect(result).toEqual(mockApplication);
  });

  it('propaga error si createApplication falla', async () => {
    createApplication.mockRejectedValue(new Error('Server error'));

    await expect(applyToProjectUseCase('p1')).rejects.toThrow('Server error');
  });
});