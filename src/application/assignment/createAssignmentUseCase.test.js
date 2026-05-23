/**
 * Tests para createAssignmentUseCase.
 * - Llama a assignmentApi.createAssignment con applicationId
 * - Retorna el assignment creado
 * - Propaga error si la API falla
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createAssignment } from '../../infrastructure/api/assignmentApi.js';

vi.mock('../../infrastructure/api/assignmentApi.js', () => ({
  createAssignment: vi.fn(),
}));

const { createAssignmentUseCase } = await import('./createAssignmentUseCase.js');

beforeEach(() => {
  vi.clearAllMocks();
});

describe('createAssignmentUseCase', () => {
  it('llama a createAssignment con el applicationId', async () => {
    const mockAssignment = { id: 'a1', application_id: 'app1', project_id: 'p1' };
    createAssignment.mockResolvedValue(mockAssignment);

    const result = await createAssignmentUseCase('app1');

    expect(createAssignment).toHaveBeenCalledWith('app1');
    expect(result).toEqual(mockAssignment);
  });

  it('propaga error si createAssignment falla', async () => {
    createAssignment.mockRejectedValue(new Error('Server error'));

    await expect(createAssignmentUseCase('app1')).rejects.toThrow('Server error');
  });
});