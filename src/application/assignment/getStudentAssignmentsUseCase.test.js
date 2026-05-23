/**
 * Tests para getStudentAssignmentsUseCase.
 * Carga assignments del estudiante + deliverables para cada uno.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getMyAssignments } from '../../infrastructure/api/assignmentApi.js';
import { getDeliverablesByAssignment } from '../../infrastructure/api/deliverableApi.js';

vi.mock('../../infrastructure/api/assignmentApi.js', () => ({
  getMyAssignments: vi.fn(),
}));

vi.mock('../../infrastructure/api/deliverableApi.js', () => ({
  getDeliverablesByAssignment: vi.fn(),
}));

const { getStudentAssignmentsUseCase } = await import('./getStudentAssignmentsUseCase.js');

beforeEach(() => {
  vi.clearAllMocks();
});

describe('getStudentAssignmentsUseCase', () => {
  it('returns assignments with embedded deliverables', async () => {
    const mockAssignments = [
      { id: 'a1', project_id: 'p1', title: 'Project 1' },
      { id: 'a2', project_id: 'p2', title: 'Project 2' },
    ];
    const mockDeliverables1 = [{ id: 'd1', assignment_id: 'a1' }];
    const mockDeliverables2 = [{ id: 'd2', assignment_id: 'a2' }];

    getMyAssignments.mockResolvedValue(mockAssignments);
    getDeliverablesByAssignment
      .mockResolvedValueOnce(mockDeliverables1)
      .mockResolvedValueOnce(mockDeliverables2);

    const result = await getStudentAssignmentsUseCase();

    expect(result.assignments).toHaveLength(2);
    expect(result.assignments[0].deliverables).toEqual(mockDeliverables1);
    expect(result.assignments[1].deliverables).toEqual(mockDeliverables2);
  });

  it('returns empty assignments when student has none', async () => {
    getMyAssignments.mockResolvedValue([]);
    getDeliverablesByAssignment.mockResolvedValue([]);

    const result = await getStudentAssignmentsUseCase();

    expect(result.assignments).toEqual([]);
  });

  it('propaga error si getMyAssignments falla', async () => {
    getMyAssignments.mockRejectedValue(new Error('Unauthorized'));

    await expect(getStudentAssignmentsUseCase()).rejects.toThrow('Unauthorized');
  });

  it('propaga error si getDeliverablesByAssignment falla', async () => {
    getMyAssignments.mockResolvedValue([{ id: 'a1' }]);
    getDeliverablesByAssignment.mockRejectedValue(new Error('Server error'));

    await expect(getStudentAssignmentsUseCase()).rejects.toThrow('Server error');
  });
});