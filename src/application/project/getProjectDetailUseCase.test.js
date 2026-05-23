/**
 * Tests para getProjectDetailUseCase — composed flow
 * Loads project + assignment + deliverables + applications.
 * Assignment 404 → returns assignment: null (not a failure).
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getProjectById } from '../../infrastructure/api/projectApi.js';
import { getAssignmentsByProject } from '../../infrastructure/api/assignmentApi.js';
import { getDeliverablesByAssignment } from '../../infrastructure/api/deliverableApi.js';
import { getApplicationsByProject } from '../../infrastructure/api/applicationApi.js';

vi.mock('../../infrastructure/api/projectApi.js', () => ({
  getProjectById: vi.fn(),
}));

vi.mock('../../infrastructure/api/assignmentApi.js', () => ({
  getAssignmentsByProject: vi.fn(),
}));

vi.mock('../../infrastructure/api/deliverableApi.js', () => ({
  getDeliverablesByAssignment: vi.fn(),
}));

vi.mock('../../infrastructure/api/applicationApi.js', () => ({
  getApplicationsByProject: vi.fn(),
}));

const { getProjectDetailUseCase } = await import('./getProjectDetailUseCase.js');

beforeEach(() => {
  vi.clearAllMocks();
});

describe('getProjectDetailUseCase', () => {
  it('loads project + assignment + deliverables + applications and returns them', async () => {
    const mockProject = { id: 'p1', title: 'Test Project', status: 'in_progress' };
    const mockAssignment = { id: 'a1', project_id: 'p1' };
    const mockDeliverables = [{ id: 'd1', status: 'approved' }];
    const mockApplications = [{ id: 'app1', student_name: 'Alice' }];

    getProjectById.mockResolvedValue(mockProject);
    getAssignmentsByProject.mockResolvedValue([mockAssignment]);
    getDeliverablesByAssignment.mockResolvedValue(mockDeliverables);
    getApplicationsByProject.mockResolvedValue(mockApplications);

    const result = await getProjectDetailUseCase('p1');

    expect(result).toEqual({
      project: mockProject,
      assignment: mockAssignment,
      deliverables: mockDeliverables,
      applications: mockApplications,
    });
  });

  it('returns assignment: null when no assignment exists (404 or empty)', async () => {
    const mockProject = { id: 'p1', title: 'Test Project', status: 'pending' };
    getProjectById.mockResolvedValue(mockProject);
    getAssignmentsByProject.mockResolvedValue([]); // no assignment
    getDeliverablesByAssignment.mockResolvedValue([]);
    getApplicationsByProject.mockResolvedValue([]);

    const result = await getProjectDetailUseCase('p1');

    expect(result.assignment).toBeNull();
    expect(result.deliverables).toEqual([]);
  });

  it('returns assignment: null when assignment API returns 404 error', async () => {
    const mockProject = { id: 'p1', status: 'pending' };
    const notFoundError = Object.assign(new Error('Not found'), { response: { status: 404 } });
    getProjectById.mockResolvedValue(mockProject);
    getAssignmentsByProject.mockRejectedValue(notFoundError);
    getDeliverablesByAssignment.mockResolvedValue([]);
    getApplicationsByProject.mockResolvedValue([]);

    const result = await getProjectDetailUseCase('p1');

    expect(result.assignment).toBeNull();
  });

  it('propaga error si projectApi falla con status no-404', async () => {
    const error = new Error('Server error');
    getProjectById.mockRejectedValue(error);
    getAssignmentsByProject.mockResolvedValue([]);
    getDeliverablesByAssignment.mockResolvedValue([]);
    getApplicationsByProject.mockResolvedValue([]);

    await expect(getProjectDetailUseCase('p1')).rejects.toThrow('Server error');
  });
});