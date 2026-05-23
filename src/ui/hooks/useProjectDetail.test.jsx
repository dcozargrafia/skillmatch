/**
 * Tests para useProjectDetail (SDD Phase 3, Task 3.1).
 *
 * Hook que maneja la carga de detalle de proyecto + assignment + deliverables + applications
 * y todas las mutaciones: review, createDeliverable, selectCandidate, cancel, markCompleted.
 *
 * Criterios de aceptación:
 * - Loading state inicial: loading=true, error=null
 * - Carga exitosa: project, assignment, deliverables, applications todos seteados
 * - Assignment 404: assignment=null (no error)
 * - Error en carga: error.message setteado, loading=false
 * - handleReview: llama reviewDeliverableUseCase → re-sincroniza con getProjectDetailUseCase
 * - handleCreateDeliverable: llama createDeliverable → re-sincroniza
 * - handleSelectCandidate: llama createAssignmentUseCase → re-sincroniza
 * - handleCancelProject: llama cancelProjectUseCase → re-sincroniza
 * - handleMarkCompleted: llama markProjectCompletedUseCase → re-sincroniza
 * - Error mapping: errores de API se traducen a mensajes user-friendly
 * - Re-sync después de mutación: vuelve a llamar getProjectDetailUseCase
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';

// Mock dependencies FIRST — before importing the hook
vi.mock('../../application/project/getProjectDetailUseCase.js', () => ({
  getProjectDetailUseCase: vi.fn(),
}));

vi.mock('../../application/deliverable/reviewDeliverableUseCase.js', () => ({
  reviewDeliverableUseCase: vi.fn(),
}));

vi.mock('../../application/deliverable/createDeliverableUseCase.js', () => ({
  createDeliverableUseCase: vi.fn(),
}));

vi.mock('../../application/assignment/createAssignmentUseCase.js', () => ({
  createAssignmentUseCase: vi.fn(),
}));

vi.mock('../../application/project/cancelProjectUseCase.js', () => ({
  cancelProjectUseCase: vi.fn(),
}));

vi.mock('../../application/project/markProjectCompletedUseCase.js', () => ({
  markProjectCompletedUseCase: vi.fn(),
}));

const { getProjectDetailUseCase } = await import('../../application/project/getProjectDetailUseCase.js');
const { reviewDeliverableUseCase } = await import('../../application/deliverable/reviewDeliverableUseCase.js');
const { createDeliverableUseCase } = await import('../../application/deliverable/createDeliverableUseCase.js');
const { createAssignmentUseCase } = await import('../../application/assignment/createAssignmentUseCase.js');
const { cancelProjectUseCase } = await import('../../application/project/cancelProjectUseCase.js');
const { markProjectCompletedUseCase } = await import('../../application/project/markProjectCompletedUseCase.js');

const { default: useProjectDetail } = await import('./useProjectDetail.jsx');

const mockProject = {
  id: 'proj-1',
  title: 'Mi Proyecto',
  status: 'in_progress',
  description: 'Descripción',
  deadline: '2025-12-31',
  modality: 'remoto',
};

const mockAssignment = {
  id: 'asgn-1',
  student_name: 'Juan Pérez',
  student_email: 'juan@test.com',
  start_date: '2025-01-01',
};

const mockDeliverables = [
  { id: 'del-1', title: 'Entregable 1', status: 'in_review' },
  { id: 'del-2', title: 'Entregable 2', status: 'approved' },
];

const mockApplications = [
  { id: 'app-1', student_name: 'Ana', student_email: 'ana@test.com', compatibility_score: 85 },
];

beforeEach(() => {
  vi.clearAllMocks();
});

describe('carga inicial', () => {
  it('loading=true, error=null inicialmente', async () => {
    getProjectDetailUseCase.mockImplementation(() => new Promise(() => {})); // pending forever
    const { result } = renderHook(() => useProjectDetail('proj-1'));
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('carga exitosa: project, assignment, deliverables, applications seteados', async () => {
    getProjectDetailUseCase.mockResolvedValue({
      project: mockProject,
      assignment: mockAssignment,
      deliverables: mockDeliverables,
      applications: mockApplications,
    });

    const { result } = renderHook(() => useProjectDetail('proj-1'));

    // Wait for async to settle
    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    expect(result.current.project).toEqual(mockProject);
    expect(result.current.assignment).toEqual(mockAssignment);
    expect(result.current.deliverables).toEqual(mockDeliverables);
    expect(result.current.applications).toEqual(mockApplications);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('assignment 404: assignment=null (no error thrown)', async () => {
    const apiError = new Error('Not found');
    apiError.response = { status: 404 };
    getProjectDetailUseCase.mockResolvedValue({
      project: { ...mockProject, status: 'pending' },
      assignment: null,
      deliverables: [],
      applications: [],
    });

    const { result } = renderHook(() => useProjectDetail('proj-1'));

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    expect(result.current.assignment).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('error en carga: error.message setteado, loading=false', async () => {
    getProjectDetailUseCase.mockRejectedValue(new Error('Error al cargar el proyecto.'));

    const { result } = renderHook(() => useProjectDetail('proj-1'));

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    expect(result.current.error).toBe('Error al cargar el proyecto.');
    expect(result.current.loading).toBe(false);
    expect(result.current.project).toBeNull();
  });
});

describe('mutaciones y re-sync', () => {
  it('handleReview: llama reviewDeliverableUseCase y re-sincroniza', async () => {
    getProjectDetailUseCase.mockResolvedValue({
      project: mockProject,
      assignment: mockAssignment,
      deliverables: mockDeliverables,
      applications: [],
    });
    reviewDeliverableUseCase.mockResolvedValue({ id: 'del-1', status: 'approved' });

    const { result } = renderHook(() => useProjectDetail('proj-1'));

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    // Call handleReview
    await act(async () => {
      await result.current.actions.handleReview('del-1', 'approved');
    });

    expect(reviewDeliverableUseCase).toHaveBeenCalledWith('del-1', { status: 'approved' });
    // After mutation, re-sync should be called at least once more (initially + after mutation)
    expect(getProjectDetailUseCase).toHaveBeenCalledTimes(2);
    expect(getProjectDetailUseCase).toHaveBeenCalledWith('proj-1');
  });

  it('handleSelectCandidate: llama createAssignmentUseCase y re-sincroniza', async () => {
    getProjectDetailUseCase.mockResolvedValue({
      project: { ...mockProject, status: 'pending' },
      assignment: null,
      deliverables: [],
      applications: mockApplications,
    });
    createAssignmentUseCase.mockResolvedValue({ id: 'asgn-new' });

    const { result } = renderHook(() => useProjectDetail('proj-1'));

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    await act(async () => {
      await result.current.actions.handleSelectCandidate('app-1');
    });

    expect(createAssignmentUseCase).toHaveBeenCalledWith('app-1');
    expect(getProjectDetailUseCase).toHaveBeenCalledTimes(2);
  });

  it('handleCancelProject: llama cancelProjectUseCase y re-sincroniza', async () => {
    getProjectDetailUseCase.mockResolvedValue({
      project: { ...mockProject, status: 'in_progress' },
      assignment: mockAssignment,
      deliverables: mockDeliverables,
      applications: [],
    });
    cancelProjectUseCase.mockResolvedValue({ id: 'proj-1', status: 'cancelled' });

    // Mock window.confirm
    window.confirm = vi.fn(() => true);

    const { result } = renderHook(() => useProjectDetail('proj-1'));

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    await act(async () => {
      await result.current.actions.handleCancelProject();
    });

    expect(cancelProjectUseCase).toHaveBeenCalledWith('proj-1', 'in_progress');
    expect(getProjectDetailUseCase).toHaveBeenCalledTimes(2);
  });

  it('handleCancelProject: no hace nada si user cancela el confirm', async () => {
    window.confirm = vi.fn(() => false);

    getProjectDetailUseCase.mockResolvedValue({
      project: mockProject,
      assignment: mockAssignment,
      deliverables: [],
      applications: [],
    });

    const { result } = renderHook(() => useProjectDetail('proj-1'));

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    await act(async () => {
      await result.current.actions.handleCancelProject();
    });

    expect(cancelProjectUseCase).not.toHaveBeenCalled();
    expect(getProjectDetailUseCase).toHaveBeenCalledTimes(1); // only initial load
  });

  it('handleMarkCompleted: llama markProjectCompletedUseCase y re-sincroniza', async () => {
    getProjectDetailUseCase.mockResolvedValue({
      project: { ...mockProject, status: 'in_review' },
      assignment: mockAssignment,
      deliverables: [{ id: 'del-1', status: 'approved' }],
      applications: [],
    });
    markProjectCompletedUseCase.mockResolvedValue({ id: 'proj-1', status: 'completed' });

    const { result } = renderHook(() => useProjectDetail('proj-1'));

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    await act(async () => {
      await result.current.actions.handleMarkCompleted();
    });

    expect(markProjectCompletedUseCase).toHaveBeenCalled();
    expect(getProjectDetailUseCase).toHaveBeenCalledTimes(2);
  });
});

describe('error mapping', () => {
  it('handleReview con 403: error mapeado a mensaje user-friendly', async () => {
    getProjectDetailUseCase.mockResolvedValue({
      project: mockProject,
      assignment: mockAssignment,
      deliverables: mockDeliverables,
      applications: [],
    });
    const err403 = new Error('Forbidden');
    err403.response = { status: 403 };
    reviewDeliverableUseCase.mockRejectedValue(err403);
    getProjectDetailUseCase.mockResolvedValue({
      project: mockProject,
      assignment: mockAssignment,
      deliverables: mockDeliverables,
      applications: [],
    });

    const { result } = renderHook(() => useProjectDetail('proj-1'));

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    await act(async () => {
      await result.current.actions.handleReview('del-1', 'approved');
    });

    // Error should be mapped to user-friendly message
    expect(result.current.error).toBeTruthy();
    expect(typeof result.current.error).toBe('string');
  });
});