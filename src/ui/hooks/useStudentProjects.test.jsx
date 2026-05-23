/**
 * Test: useStudentProjects
 * SDD Phase 3, Task 3.2
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';

vi.mock('../../application/student/getStudentProjectsUseCase.js', () => ({
  getStudentProjectsUseCase: vi.fn(),
}));

const { getStudentProjectsUseCase } = await import('../../application/student/getStudentProjectsUseCase.js');

const { default: useStudentProjects } = await import('./useStudentProjects.jsx');

const mockProjects = [
  {
    id: 'proj-1',
    title: 'Project One',
    status: 'pending',
    modality: 'remoto',
    deadline: '2025-12-31',
    description: 'Desc uno',
    skills: [{ skill_id: 'skill-a', required_level: 'basic' }],
    ngo: { name: 'ONG Uno' },
  },
  {
    id: 'proj-2',
    title: 'Project Two',
    status: 'in_progress',
    modality: 'presencial',
    deadline: '2025-11-15',
    description: 'Desc dos',
    skills: [{ skill_id: 'skill-b', required_level: 'intermediate' }],
    ngo: { name: 'ONG Dos' },
  },
];

const mockSkills = [
  { id: 'skill-a', name: 'JavaScript' },
  { id: 'skill-b', name: 'React' },
  { id: 'skill-c', name: 'Node.js' },
];

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useStudentProjects', () => {
  it('loads projects and skills on mount', async () => {
    getStudentProjectsUseCase.mockResolvedValue({ projects: mockProjects, skills: mockSkills });

    const { result } = renderHook(() => useStudentProjects());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(getStudentProjectsUseCase).toHaveBeenCalled();
    expect(result.current.projects).toEqual(mockProjects);
    expect(result.current.skills).toEqual(mockSkills);
  });

  it('handles loading error gracefully', async () => {
    getStudentProjectsUseCase.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useStudentProjects());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Error al cargar los proyectos. Intenta de nuevo.');
    expect(result.current.projects).toEqual([]);
  });

  it('setSelectedSkillId updates filter and re-fetches', async () => {
    getStudentProjectsUseCase
      .mockResolvedValueOnce({ projects: mockProjects, skills: mockSkills })
      .mockResolvedValueOnce({ projects: [mockProjects[0]], skills: mockSkills });

    const { result } = renderHook(() => useStudentProjects());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      result.current.setSelectedSkillId('skill-a');
    });

    await waitFor(() => {
      expect(getStudentProjectsUseCase).toHaveBeenCalledWith({ skill_id: 'skill-a' });
    });

    expect(result.current.selectedSkillId).toBe('skill-a');
  });

  it('setSelectedSkillId to empty clears filter and re-fetches', async () => {
    // Initial load with filter, then re-fetch with empty filter
    getStudentProjectsUseCase
      .mockResolvedValueOnce({ projects: [mockProjects[0]], skills: mockSkills })
      .mockResolvedValueOnce({ projects: mockProjects, skills: mockSkills });

    const { result } = renderHook(() => useStudentProjects());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      result.current.setSelectedSkillId('');
    });

    await waitFor(() => {
      expect(getStudentProjectsUseCase).toHaveBeenCalledWith({});
    });

    expect(result.current.selectedSkillId).toBe('');
  });

  it('refresh re-fetches with current filter', async () => {
    getStudentProjectsUseCase.mockResolvedValue({ projects: mockProjects, skills: mockSkills });

    const { result } = renderHook(() => useStudentProjects());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    getStudentProjectsUseCase.mockClear();
    getStudentProjectsUseCase.mockResolvedValue({ projects: mockProjects, skills: mockSkills });

    await act(async () => {
      result.current.refresh();
    });

    await waitFor(() => {
      expect(getStudentProjectsUseCase).toHaveBeenCalledWith({});
    });
  });

  it('refresh re-fetches with current selectedSkillId filter', async () => {
    getStudentProjectsUseCase
      .mockResolvedValueOnce({ projects: mockProjects, skills: mockSkills })
      .mockResolvedValueOnce({ projects: [mockProjects[0]], skills: mockSkills })
      .mockResolvedValueOnce({ projects: [mockProjects[0]], skills: mockSkills });

    const { result } = renderHook(() => useStudentProjects());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      result.current.setSelectedSkillId('skill-a');
    });

    await waitFor(() => {
      expect(result.current.selectedSkillId).toBe('skill-a');
    });

    getStudentProjectsUseCase.mockClear();
    getStudentProjectsUseCase.mockResolvedValue({ projects: [mockProjects[0]], skills: mockSkills });

    await act(async () => {
      result.current.refresh();
    });

    await waitFor(() => {
      expect(getStudentProjectsUseCase).toHaveBeenCalledWith({ skill_id: 'skill-a' });
    });
  });
});
