/**
 * Test: useStudentAssignments
 * SDD Phase 3, Task 3.4
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';

vi.mock('../../application/assignment/getStudentAssignmentsUseCase.js', () => ({
  getStudentAssignmentsUseCase: vi.fn(),
}));

const { getStudentAssignmentsUseCase } = await import('../../application/assignment/getStudentAssignmentsUseCase.js');

const { default: useStudentAssignments } = await import('./useStudentAssignments.jsx');

const mockAssignments = [
  {
    id: 'asgn-1',
    project_title: 'Project One',
    project_status: 'in_progress',
    start_date: '2025-01-01',
    deliverables: [
      { id: 'del-1', title: 'Deliverable 1', status: 'in_progress' },
      { id: 'del-2', title: 'Deliverable 2', status: 'pending' },
    ],
  },
  {
    id: 'asgn-2',
    project_title: 'Project Two',
    project_status: 'assigned',
    start_date: '2025-02-01',
    deliverables: [
      { id: 'del-3', title: 'Deliverable 3', status: 'pending' },
    ],
  },
];

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useStudentAssignments', () => {
  it('loads assignments on mount', async () => {
    getStudentAssignmentsUseCase.mockResolvedValue({ assignments: mockAssignments });

    const { result } = renderHook(() => useStudentAssignments());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(getStudentAssignmentsUseCase).toHaveBeenCalled();
    expect(result.current.assignments).toEqual(mockAssignments);
  });

  it('computes deliverablesByAssignment as a map of assignmentId -> deliverables', async () => {
    getStudentAssignmentsUseCase.mockResolvedValue({ assignments: mockAssignments });

    const { result } = renderHook(() => useStudentAssignments());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.deliverablesByAssignment).toHaveProperty('asgn-1');
    expect(result.current.deliverablesByAssignment['asgn-1']).toHaveLength(2);
    expect(result.current.deliverablesByAssignment['asgn-2']).toHaveLength(1);
  });

  it('handles loading error gracefully', async () => {
    getStudentAssignmentsUseCase.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useStudentAssignments());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Error al cargar los proyectos asignados. Intenta de nuevo.');
    expect(result.current.assignments).toEqual([]);
  });

  it('refresh re-fetches assignments', async () => {
    getStudentAssignmentsUseCase.mockResolvedValue({ assignments: mockAssignments });

    const { result } = renderHook(() => useStudentAssignments());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    getStudentAssignmentsUseCase.mockClear();
    getStudentAssignmentsUseCase.mockResolvedValue({ assignments: [mockAssignments[0]] });

    await act(async () => {
      result.current.refresh();
    });

    await waitFor(() => {
      expect(getStudentAssignmentsUseCase).toHaveBeenCalled();
    });

    expect(result.current.assignments).toHaveLength(1);
  });

  it('empty assignments list is valid state', async () => {
    getStudentAssignmentsUseCase.mockResolvedValue({ assignments: [] });

    const { result } = renderHook(() => useStudentAssignments());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.assignments).toEqual([]);
    expect(result.current.deliverablesByAssignment).toEqual({});
  });

  it('refresh keeps current assignments while re-fetching', async () => {
    getStudentAssignmentsUseCase.mockResolvedValue({ assignments: mockAssignments });

    const { result } = renderHook(() => useStudentAssignments());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    getStudentAssignmentsUseCase.mockClear();
    getStudentAssignmentsUseCase.mockImplementation(() => new Promise(() => {})); // pending forever

    let refreshReturned = false;
    await act(async () => {
      const refreshPromise = result.current.refresh();
      refreshReturned = true;
      await refreshPromise;
    });

    // While re-fetch is pending, previous data is preserved
    expect(result.current.assignments).toEqual(mockAssignments);
    expect(refreshReturned).toBe(true);
  });
});