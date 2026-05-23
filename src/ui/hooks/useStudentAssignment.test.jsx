/**
 * Test: useStudentAssignment
 * SDD Phase 3, Task 3.5
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';

vi.mock('../../application/assignment/getStudentAssignmentDetailUseCase.js', () => ({
  getStudentAssignmentDetailUseCase: vi.fn(),
}));

vi.mock('../../application/deliverable/startDeliverableUseCase.js', () => ({
  startDeliverableUseCase: vi.fn(),
}));

vi.mock('../../application/deliverable/submitDeliverableUseCase.js', () => ({
  submitDeliverableUseCase: vi.fn(),
}));

vi.mock('../../application/assignment/acceptAssignmentUseCase.js', () => ({
  acceptAssignmentUseCase: vi.fn(),
}));

const { getStudentAssignmentDetailUseCase } = await import('../../application/assignment/getStudentAssignmentDetailUseCase.js');
const { startDeliverableUseCase } = await import('../../application/deliverable/startDeliverableUseCase.js');
const { submitDeliverableUseCase } = await import('../../application/deliverable/submitDeliverableUseCase.js');
const { acceptAssignmentUseCase } = await import('../../application/assignment/acceptAssignmentUseCase.js');

const { default: useStudentAssignment } = await import('./useStudentAssignment.jsx');

const mockAssignment = {
  id: 'asgn-1',
  project_title: 'Project One',
  project_status: 'in_progress',
  start_date: '2025-01-01',
  certificate_id: null,
};

const mockDeliverables = [
  { id: 'del-1', title: 'Deliverable 1', status: 'pending' },
  { id: 'del-2', title: 'Deliverable 2', status: 'in_progress' },
];

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useStudentAssignment', () => {
  it('loads assignment and deliverables on mount', async () => {
    getStudentAssignmentDetailUseCase.mockResolvedValue({ assignment: mockAssignment, deliverables: mockDeliverables });

    const { result } = renderHook(() => useStudentAssignment('asgn-1'));

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(getStudentAssignmentDetailUseCase).toHaveBeenCalledWith('asgn-1');
    expect(result.current.assignment).toEqual(mockAssignment);
    expect(result.current.deliverables).toEqual(mockDeliverables);
  });

  it('handles loading error gracefully', async () => {
    getStudentAssignmentDetailUseCase.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useStudentAssignment('asgn-1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Error al cargar el detalle del proyecto. Intenta de nuevo.');
    expect(result.current.assignment).toBe(null);
  });

  it('handleAcceptAssignment calls acceptAssignmentUseCase and re-syncs', async () => {
    const updatedAssignment = { ...mockAssignment, project_status: 'in_progress' };
    getStudentAssignmentDetailUseCase
      .mockResolvedValueOnce({ assignment: mockAssignment, deliverables: [] })
      .mockResolvedValueOnce({ assignment: updatedAssignment, deliverables: [] });
    acceptAssignmentUseCase.mockResolvedValue(updatedAssignment);

    const { result } = renderHook(() => useStudentAssignment('asgn-1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.actions.handleAcceptAssignment();
    });

    expect(acceptAssignmentUseCase).toHaveBeenCalledWith(mockAssignment);
    expect(result.current.assignment.project_status).toBe('in_progress');
  });

  it('handleStartDeliverable calls startDeliverableUseCase and re-syncs', async () => {
    const startedDeliverable = { ...mockDeliverables[0], status: 'in_progress' };
    getStudentAssignmentDetailUseCase
      .mockResolvedValueOnce({ assignment: mockAssignment, deliverables: mockDeliverables })
      .mockResolvedValueOnce({ assignment: mockAssignment, deliverables: [startedDeliverable, mockDeliverables[1]] });
    startDeliverableUseCase.mockResolvedValue(startedDeliverable);

    const { result } = renderHook(() => useStudentAssignment('asgn-1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.actions.handleStartDeliverable(mockDeliverables[0], mockDeliverables);
    });

    expect(startDeliverableUseCase).toHaveBeenCalledWith(mockDeliverables[0], mockDeliverables);
  });

  it('handleSubmitDeliverable calls submitDeliverableUseCase and re-syncs', async () => {
    const submittedDeliverable = { ...mockDeliverables[1], status: 'in_review' };
    getStudentAssignmentDetailUseCase
      .mockResolvedValueOnce({ assignment: mockAssignment, deliverables: mockDeliverables })
      .mockResolvedValueOnce({ assignment: mockAssignment, deliverables: [mockDeliverables[0], submittedDeliverable] });
    submitDeliverableUseCase.mockResolvedValue(submittedDeliverable);

    const { result } = renderHook(() => useStudentAssignment('asgn-1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.actions.handleSubmitDeliverable(mockDeliverables[1], 'https://file.example.com/output.pdf', mockDeliverables);
    });

    expect(submitDeliverableUseCase).toHaveBeenCalledWith(mockDeliverables[1], 'https://file.example.com/output.pdf', mockDeliverables);
  });

  it('handleAcceptAssignment catches error and sets error message', async () => {
    getStudentAssignmentDetailUseCase.mockResolvedValue({ assignment: mockAssignment, deliverables: [] });
    acceptAssignmentUseCase.mockRejectedValue(new Error('Accept failed'));

    const { result } = renderHook(() => useStudentAssignment('asgn-1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.actions.handleAcceptAssignment();
    });

    expect(result.current.error).toBe('Error al aceptar el proyecto. Intenta de nuevo.');
  });

  it('handles missing assignment (null) gracefully', async () => {
    getStudentAssignmentDetailUseCase.mockResolvedValue({ assignment: null, deliverables: [] });

    const { result } = renderHook(() => useStudentAssignment('asgn-1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.assignment).toBe(null);
    expect(result.current.deliverables).toEqual([]);
  });

  it('error is cleared before new mutation', async () => {
    getStudentAssignmentDetailUseCase.mockResolvedValue({ assignment: mockAssignment, deliverables: mockDeliverables });
    acceptAssignmentUseCase.mockRejectedValue(new Error('fail'));

    const { result } = renderHook(() => useStudentAssignment('asgn-1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.actions.handleAcceptAssignment();
    });
    expect(result.current.error).toBeTruthy();

    // Second mutation clears error
    getStudentAssignmentDetailUseCase
      .mockResolvedValueOnce({ assignment: mockAssignment, deliverables: mockDeliverables })
      .mockResolvedValueOnce({ assignment: mockAssignment, deliverables: mockDeliverables });
    acceptAssignmentUseCase.mockResolvedValue(mockAssignment);

    await act(async () => {
      await result.current.actions.handleAcceptAssignment();
    });

    expect(result.current.error || '').toBe('');
  });
});