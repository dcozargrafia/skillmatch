/**
 * Tests para getStudentAssignmentDetailUseCase.
 * Carga assignment individual + sus deliverables.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAssignmentById } from '../../infrastructure/api/assignmentApi.js';
import { getDeliverablesByAssignment } from '../../infrastructure/api/deliverableApi.js';

vi.mock('../../infrastructure/api/assignmentApi.js', () => ({
  getAssignmentById: vi.fn(),
}));

vi.mock('../../infrastructure/api/deliverableApi.js', () => ({
  getDeliverablesByAssignment: vi.fn(),
}));

const { getStudentAssignmentDetailUseCase } = await import('./getStudentAssignmentDetailUseCase.js');

beforeEach(() => {
  vi.clearAllMocks();
});

describe('getStudentAssignmentDetailUseCase', () => {
  it('returns assignment and deliverables combined', async () => {
    const mockAssignment = { id: 'a1', project_id: 'p1', status: 'assigned' };
    const mockDeliverables = [{ id: 'd1', assignment_id: 'a1', status: 'pending' }];

    getAssignmentById.mockResolvedValue(mockAssignment);
    getDeliverablesByAssignment.mockResolvedValue(mockDeliverables);

    const result = await getStudentAssignmentDetailUseCase('a1');

    expect(result).toEqual({ assignment: mockAssignment, deliverables: mockDeliverables });
  });

  it('propaga error si getAssignmentById falla', async () => {
    getAssignmentById.mockRejectedValue(new Error('Not found'));

    await expect(getStudentAssignmentDetailUseCase('a1')).rejects.toThrow('Not found');
  });

  it('propaga error si getDeliverablesByAssignment falla', async () => {
    getAssignmentById.mockResolvedValue({ id: 'a1' });
    getDeliverablesByAssignment.mockRejectedValue(new Error('Server error'));

    await expect(getStudentAssignmentDetailUseCase('a1')).rejects.toThrow('Server error');
  });
});