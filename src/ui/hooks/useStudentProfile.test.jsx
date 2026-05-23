/**
 * Test: useStudentProfile
 * SDD Phase 3, Task 3.1
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';

// Mock BEFORE importing the hook
vi.mock('../../application/student/getStudentProfileUseCase.js', () => ({
  getStudentProfileUseCase: vi.fn(),
}));

vi.mock('../../application/student/updateStudentProfileUseCase.js', () => ({
  updateStudentProfileUseCase: vi.fn(),
}));

vi.mock('../../application/student/updateStudentSkillsUseCase.js', () => ({
  updateStudentSkillsUseCase: vi.fn(),
}));

const { getStudentProfileUseCase } = await import('../../application/student/getStudentProfileUseCase.js');
const { updateStudentProfileUseCase } = await import('../../application/student/updateStudentProfileUseCase.js');
const { updateStudentSkillsUseCase } = await import('../../application/student/updateStudentSkillsUseCase.js');

const { default: useStudentProfile } = await import('./useStudentProfile.jsx');

const mockProfile = {
  id: 'student-1',
  name: 'Test Student',
  email: 'test@example.com',
  disponibilidad: true,
  portfolio_url: 'https://portfolio.example.com',
  skills: [
    { skill_id: 'skill-a', level: 'básico' },
    { skill_id: 'skill-b', level: 'intermedio' },
  ],
};

const mockSkills = [
  { id: 'skill-a', name: 'JavaScript' },
  { id: 'skill-b', name: 'React' },
  { id: 'skill-c', name: 'Node.js' },
];

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useStudentProfile', () => {
  it('loads profile and skills on mount', async () => {
    getStudentProfileUseCase.mockResolvedValue({ profile: mockProfile, allSkills: mockSkills });

    const { result } = renderHook(() => useStudentProfile());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(getStudentProfileUseCase).toHaveBeenCalled();
    expect(result.current.profile).toEqual(mockProfile);
    expect(result.current.allSkills).toEqual(mockSkills);
  });

  it('computes availableSkills as allSkills minus profile skills', async () => {
    getStudentProfileUseCase.mockResolvedValue({ profile: mockProfile, allSkills: mockSkills });

    const { result } = renderHook(() => useStudentProfile());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // skill-c (Node.js) is not in profile skills → available
    expect(result.current.availableSkills).toHaveLength(1);
    expect(result.current.availableSkills[0].id).toBe('skill-c');
  });

  it('handles loading error gracefully', async () => {
    getStudentProfileUseCase.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useStudentProfile());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Error al cargar el perfil. Intenta de nuevo.');
    expect(result.current.profile).toBe(null);
  });

  it('handleSave calls updateStudentProfileUseCase and re-syncs', async () => {
    const updatedProfile = { ...mockProfile, disponibilidad: false };
    // First call: initial mount; second call: re-sync after save
    getStudentProfileUseCase
      .mockResolvedValueOnce({ profile: mockProfile, allSkills: mockSkills })
      .mockResolvedValueOnce({ profile: updatedProfile, allSkills: mockSkills });
    updateStudentProfileUseCase.mockResolvedValue(updatedProfile);

    const { result } = renderHook(() => useStudentProfile());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.handleSave({ disponibilidad: false, portfolio_url: 'https://portfolio.example.com' });
    });

    expect(updateStudentProfileUseCase).toHaveBeenCalledWith({ disponibilidad: false, portfolio_url: 'https://portfolio.example.com' });
    expect(result.current.profile).toEqual(updatedProfile);
    expect(result.current.successMessage).toBe('Perfil actualizado correctamente.');
  });

  it('handleAddSkill calls updateStudentSkillsUseCase and re-syncs', async () => {
    const updatedProfile = { ...mockProfile, skills: [...mockProfile.skills, { skill_id: 'skill-c', level: 'avanzado' }] };
    getStudentProfileUseCase
      .mockResolvedValueOnce({ profile: mockProfile, allSkills: mockSkills })
      .mockResolvedValueOnce({ profile: updatedProfile, allSkills: mockSkills });
    updateStudentSkillsUseCase.mockResolvedValue();

    const { result } = renderHook(() => useStudentProfile());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.handleAddSkill('skill-c', 'avanzado');
    });

    expect(updateStudentSkillsUseCase).toHaveBeenCalledWith([
      { skill_id: 'skill-a', level: 'básico' },
      { skill_id: 'skill-b', level: 'intermedio' },
      { skill_id: 'skill-c', level: 'avanzado' },
    ]);
    expect(result.current.successMessage).toBe('Skill agregada correctamente.');
  });

  it('handleRemoveSkill calls updateStudentSkillsUseCase and re-syncs', async () => {
    const updatedProfile = { ...mockProfile, skills: [{ skill_id: 'skill-a', level: 'básico' }] };
    getStudentProfileUseCase
      .mockResolvedValueOnce({ profile: mockProfile, allSkills: mockSkills })
      .mockResolvedValueOnce({ profile: updatedProfile, allSkills: mockSkills });
    updateStudentSkillsUseCase.mockResolvedValue();

    const { result } = renderHook(() => useStudentProfile());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.handleRemoveSkill('skill-b');
    });

    expect(updateStudentSkillsUseCase).toHaveBeenCalledWith([
      { skill_id: 'skill-a', level: 'básico' },
    ]);
    expect(result.current.successMessage).toBe('Skill eliminada correctamente.');
  });

  it('handleSave catches error and sets error message', async () => {
    getStudentProfileUseCase.mockResolvedValue({ profile: mockProfile, allSkills: mockSkills });
    updateStudentProfileUseCase.mockRejectedValue(new Error('Save failed'));

    const { result } = renderHook(() => useStudentProfile());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.handleSave({ disponibilidad: true, portfolio_url: 'url' });
    });

    expect(result.current.error).toBe('Error al actualizar el perfil. Intenta de nuevo.');
  });

  it('clears messages before mutating', async () => {
    // First load fails
    getStudentProfileUseCase.mockRejectedValue(new Error('fail'));

    const { result } = renderHook(() => useStudentProfile());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // First call fails
    await act(async () => {
      await result.current.handleSave({ disponibilidad: true, portfolio_url: 'url' });
    });
    expect(result.current.error).toBeTruthy();

    // Second call succeeds — mocks for successful save + re-sync
    getStudentProfileUseCase
      .mockResolvedValueOnce({ profile: mockProfile, allSkills: mockSkills })  // mount
      .mockResolvedValueOnce({ profile: mockProfile, allSkills: mockSkills }); // re-sync after save
    updateStudentProfileUseCase.mockResolvedValue(mockProfile);

    await act(async () => {
      await result.current.handleSave({ disponibilidad: false, portfolio_url: 'url' });
    });

    expect(result.current.error || '').toBe('');
    expect(result.current.successMessage).toBe('Perfil actualizado correctamente.');
  });
});