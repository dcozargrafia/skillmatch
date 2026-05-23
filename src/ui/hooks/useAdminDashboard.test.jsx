/**
 * Test: useAdminDashboard
 * SDD Phase 6, Task 6.1
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { getSkillsUseCase } from '../../application/skill/getSkillsUseCase.js';
import { createSkillUseCase } from '../../application/admin/createSkillUseCase.js';
import { deleteSkillUseCase } from '../../application/admin/deleteSkillUseCase.js';
import { verifyNgoUseCase } from '../../application/admin/verifyNgoUseCase.js';
import { getUnverifiedNgosUseCase } from '../../application/admin/getUnverifiedNgosUseCase.js';

vi.mock('../../application/skill/getSkillsUseCase.js', () => ({
  getSkillsUseCase: vi.fn(),
}));

vi.mock('../../application/admin/createSkillUseCase.js', () => ({
  createSkillUseCase: vi.fn(),
}));

vi.mock('../../application/admin/deleteSkillUseCase.js', () => ({
  deleteSkillUseCase: vi.fn(),
}));

vi.mock('../../application/admin/verifyNgoUseCase.js', () => ({
  verifyNgoUseCase: vi.fn(),
}));

vi.mock('../../application/admin/getUnverifiedNgosUseCase.js', () => ({
  getUnverifiedNgosUseCase: vi.fn(),
}));

const { getSkillsUseCase: mockGetSkillsUseCase } = await import('../../application/skill/getSkillsUseCase.js');
const { createSkillUseCase: mockCreateSkillUseCase } = await import('../../application/admin/createSkillUseCase.js');
const { deleteSkillUseCase: mockDeleteSkillUseCase } = await import('../../application/admin/deleteSkillUseCase.js');
const { verifyNgoUseCase: mockVerifyNgoUseCase } = await import('../../application/admin/verifyNgoUseCase.js');
const { getUnverifiedNgosUseCase: mockGetUnverifiedNgosUseCase } = await import('../../application/admin/getUnverifiedNgosUseCase.js');

const { default: useAdminDashboard } = await import('./useAdminDashboard.jsx');

const mockSkills = [
  { id: 1, name: 'JavaScript', category: 'Programming' },
  { id: 2, name: 'React', category: 'Frontend' },
];

const mockNgos = [
  { id: 1, name: 'ONG Verde', email: 'verde@ong.com', verified: false },
  { id: 2, name: 'ONG Azul', email: 'azul@ong.com', verified: false },
];

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useAdminDashboard', () => {
  it('inicializa la nueva skill con la categoría por defecto visible en el select', async () => {
    mockGetSkillsUseCase.mockResolvedValue(mockSkills);
    mockGetUnverifiedNgosUseCase.mockResolvedValue(mockNgos);

    const { result } = renderHook(() => useAdminDashboard());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.newSkillCategory).toBe('Desarrollo');
  });

  it('carga skills y ngos al montar', async () => {
    mockGetSkillsUseCase.mockResolvedValue(mockSkills);
    mockGetUnverifiedNgosUseCase.mockResolvedValue(mockNgos);

    const { result } = renderHook(() => useAdminDashboard());

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockGetSkillsUseCase).toHaveBeenCalled();
    expect(mockGetUnverifiedNgosUseCase).toHaveBeenCalled();
    expect(result.current.skills).toEqual(mockSkills);
    expect(result.current.ngos).toEqual(mockNgos);
  });

  it('maneja error al cargar skills/ngos', async () => {
    mockGetSkillsUseCase.mockRejectedValue(new Error('Error de red'));
    mockGetUnverifiedNgosUseCase.mockResolvedValue([]);

    const { result } = renderHook(() => useAdminDashboard());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe('Error al cargar el dashboard');
    expect(result.current.skills).toEqual([]);
  });

  it('createSkill llama a createSkillUseCase y re-carga skills', async () => {
    const newSkill = { id: 3, name: 'Node.js', category: 'Backend' };
    mockGetSkillsUseCase
      .mockResolvedValueOnce(mockSkills)
      .mockResolvedValueOnce([...mockSkills, newSkill]);
    mockCreateSkillUseCase.mockResolvedValue(newSkill);
    mockGetUnverifiedNgosUseCase.mockResolvedValue([]);

    const { result } = renderHook(() => useAdminDashboard());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    mockGetSkillsUseCase
      .mockResolvedValueOnce([...mockSkills, newSkill])
      .mockResolvedValueOnce([...mockSkills, newSkill]);

    await act(async () => {
      await result.current.handleCreateSkill({ name: 'Node.js', category: 'Backend' });
    });

    expect(mockCreateSkillUseCase).toHaveBeenCalledWith({ name: 'Node.js', category: 'Backend' });
    expect(result.current.skills).toContainEqual(newSkill);
    expect(result.current.newSkillCategory).toBe('Desarrollo');
  });

  it('deleteSkill solicita confirmación y luego elimina', async () => {
    mockGetSkillsUseCase.mockResolvedValue(mockSkills);
    mockGetUnverifiedNgosUseCase.mockResolvedValue([]);
    mockDeleteSkillUseCase.mockResolvedValue();

    const { result } = renderHook(() => useAdminDashboard());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.handleDeleteSkill(1);
    });
    expect(result.current.skillToDelete).toBe(1);

    await act(async () => {
      await result.current.handleConfirmDelete();
    });

    expect(mockDeleteSkillUseCase).toHaveBeenCalledWith(1);
    expect(result.current.skillToDelete).toBeNull();
  });

  it('cancelDelete limpia skillToDelete', async () => {
    mockGetSkillsUseCase.mockResolvedValue(mockSkills);
    mockGetUnverifiedNgosUseCase.mockResolvedValue([]);

    const { result } = renderHook(() => useAdminDashboard());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.handleDeleteSkill(1);
    });
    expect(result.current.skillToDelete).toBe(1);

    act(() => {
      result.current.cancelDelete();
    });
    expect(result.current.skillToDelete).toBeNull();
  });

  it('verifyNgo llama a verifyNgoUseCase y re-carga ngos', async () => {
    const verifiedNgo = { ...mockNgos[0], verified: true };
    mockGetSkillsUseCase.mockResolvedValue([]);
    mockGetUnverifiedNgosUseCase
      .mockResolvedValueOnce(mockNgos)
      .mockResolvedValueOnce([mockNgos[1]]);
    mockVerifyNgoUseCase.mockResolvedValue(verifiedNgo);

    const { result } = renderHook(() => useAdminDashboard());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.handleVerifyNgo(1);
    });

    expect(mockVerifyNgoUseCase).toHaveBeenCalledWith(1);
    expect(result.current.ngos).toHaveLength(1);
    expect(result.current.ngos[0].id).toBe(2);
  });

  it('handleCreateSkill setea error si falla', async () => {
    mockGetSkillsUseCase.mockResolvedValue(mockSkills);
    mockGetUnverifiedNgosUseCase.mockResolvedValue([]);
    mockCreateSkillUseCase.mockRejectedValue(new Error('Error al crear skill'));

    const { result } = renderHook(() => useAdminDashboard());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.handleCreateSkill({ name: 'Bad', category: 'Test' });
    });

    expect(result.current.skillError).toBe('Error al crear la habilidad');
  });
});
