/**
 * Tests para acceptAssignmentUseCase.
 * Domain guard: canAcceptAssignment (status must be 'assigned').
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { acceptAssignment } from '../../infrastructure/api/assignmentApi.js';
import { canAcceptAssignment } from '../../domain/assignment/Assignment.js';

vi.mock('../../infrastructure/api/assignmentApi.js', () => ({
  acceptAssignment: vi.fn(),
}));

const { acceptAssignmentUseCase } = await import('./acceptAssignmentUseCase.js');

beforeEach(() => {
  vi.clearAllMocks();
});

describe('acceptAssignmentUseCase', () => {
  it('calls acceptAssignment API when domain guard passes', async () => {
    const assignment = { id: 'a1', status: 'assigned' };
    acceptAssignment.mockResolvedValue({ id: 'a1', status: 'accepted' });

    const result = await acceptAssignmentUseCase(assignment);

    expect(acceptAssignment).toHaveBeenCalledWith('a1');
    expect(result.status).toBe('accepted');
  });

  it('throws error when domain guard fails (not assigned)', async () => {
    const assignment = { id: 'a1', status: 'pending' };

    await expect(acceptAssignmentUseCase(assignment)).rejects.toThrow('Cannot accept assignment');
    expect(acceptAssignment).not.toHaveBeenCalled();
  });

  it('throws error when assignment is completed', async () => {
    const assignment = { id: 'a1', status: 'completed' };

    await expect(acceptAssignmentUseCase(assignment)).rejects.toThrow('Cannot accept assignment');
    expect(acceptAssignment).not.toHaveBeenCalled();
  });

  it('propaga error si acceptAssignment API falla', async () => {
    const assignment = { id: 'a1', status: 'assigned' };
    acceptAssignment.mockRejectedValue(new Error('Server error'));

    await expect(acceptAssignmentUseCase(assignment)).rejects.toThrow('Server error');
  });
});