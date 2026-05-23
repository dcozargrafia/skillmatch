/**
 * Test: useStudentProjectDetail
 * SDD Phase 3, Task 3.3
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';

vi.mock('../../application/student/getStudentProjectDetailUseCase.js', () => ({
  getStudentProjectDetailUseCase: vi.fn(),
}));

vi.mock('../../application/application/applyToProjectUseCase.js', () => ({
  applyToProjectUseCase: vi.fn(),
}));

const { getStudentProjectDetailUseCase } = await import('../../application/student/getStudentProjectDetailUseCase.js');
const { applyToProjectUseCase } = await import('../../application/application/applyToProjectUseCase.js');

const { default: useStudentProjectDetail } = await import('./useStudentProjectDetail.jsx');

const mockProject = {
  id: 'proj-1',
  title: 'Project One',
  status: 'pending',
  description: 'A great project',
  deadline: '2025-12-31',
  modality: 'remoto',
  skills: [{ skill_id: 'skill-a', required_level: 'basic' }],
  ngo: { name: 'ONG Test' },
};

const mockSkills = [{ id: 'skill-a', name: 'JavaScript' }];

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useStudentProjectDetail', () => {
  it('loads project detail on mount', async () => {
    getStudentProjectDetailUseCase.mockResolvedValue({ project: mockProject, applied: false, skills: mockSkills });

    const { result } = renderHook(() => useStudentProjectDetail('proj-1'));

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(getStudentProjectDetailUseCase).toHaveBeenCalledWith('proj-1');
    expect(result.current.project).toEqual(mockProject);
    expect(result.current.skills).toEqual(mockSkills);
    expect(result.current.applied).toBe(false);
  });

  it('detects already applied', async () => {
    getStudentProjectDetailUseCase.mockResolvedValue({ project: mockProject, applied: true, skills: mockSkills });

    const { result } = renderHook(() => useStudentProjectDetail('proj-1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.applied).toBe(true);
  });

  it('handles loading error gracefully', async () => {
    getStudentProjectDetailUseCase.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useStudentProjectDetail('proj-1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Error al cargar el proyecto. Intenta de nuevo.');
    expect(result.current.project).toBe(null);
  });

  it('handleApply calls applyToProjectUseCase and re-syncs', async () => {
    getStudentProjectDetailUseCase
      .mockResolvedValueOnce({ project: mockProject, applied: false, skills: mockSkills })
      .mockResolvedValueOnce({ project: mockProject, applied: true, skills: mockSkills });
    applyToProjectUseCase.mockResolvedValue({ applied: true });

    const { result } = renderHook(() => useStudentProjectDetail('proj-1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.handleApply();
    });

    expect(applyToProjectUseCase).toHaveBeenCalledWith('proj-1');
    expect(result.current.applied).toBe(true);
    expect(result.current.successMessage).toBe('Te has postulado al proyecto correctamente.');
  });

  it('handleApply handles 409 as already applied gracefully', async () => {
    getStudentProjectDetailUseCase
      .mockResolvedValueOnce({ project: mockProject, applied: false, skills: mockSkills })
      .mockResolvedValueOnce({ project: mockProject, applied: true, skills: mockSkills });
    applyToProjectUseCase.mockResolvedValue({ applied: true, duplicate: true });

    const { result } = renderHook(() => useStudentProjectDetail('proj-1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.handleApply();
    });

    expect(result.current.applied).toBe(true);
    expect(result.current.successMessage).toBe('Te has postulado al proyecto correctamente.');
  });

  it('handleApply catches error and sets error message', async () => {
    getStudentProjectDetailUseCase.mockResolvedValue({ project: mockProject, applied: false, skills: mockSkills });
    applyToProjectUseCase.mockRejectedValue(new Error('Apply failed'));

    const { result } = renderHook(() => useStudentProjectDetail('proj-1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.handleApply();
    });

    expect(result.current.error).toBe('Error al aplicarse al proyecto. Intenta de nuevo.');
  });

  it('clears error before new apply attempt', async () => {
    // First apply fails
    getStudentProjectDetailUseCase.mockResolvedValue({ project: mockProject, applied: false, skills: mockSkills });
    applyToProjectUseCase.mockRejectedValue(new Error('fail'));

    const { result } = renderHook(() => useStudentProjectDetail('proj-1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.handleApply();
    });
    expect(result.current.error).toBeTruthy();

    // Second apply: mock returns fresh applied=false, but success handler re-syncs
    getStudentProjectDetailUseCase.mockResolvedValue({ project: mockProject, applied: false, skills: mockSkills });
    applyToProjectUseCase.mockImplementation(async () => {
      // Override re-sync to return applied=true after success
      getStudentProjectDetailUseCase.mockResolvedValueOnce({ project: mockProject, applied: true, skills: mockSkills });
      return { applied: true };
    });

    await act(async () => {
      await result.current.handleApply();
    });

    // Error was cleared before the second mutation
    expect(result.current.error || '').toBe('');
  });
});