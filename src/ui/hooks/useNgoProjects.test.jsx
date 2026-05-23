/**
 * Tests para useNgoProjects (SDD Phase 3, Task 3.2).
 *
 * Hook que carga la lista de proyectos de la ONG autenticada.
 * Llama a getProjectsUseCase — nunca a infrastructure APIs directamente.
 *
 * Criterios de aceptación:
 * - Loading state inicial: loading=true
 * - Carga exitosa: projects array seteado, loading=false
 * - Error en carga: error.message setteado, loading=false
 * - Lista vacía: projects=[], sin error
 * - refresh: vuelve a llamar getProjectsUseCase y actualiza projects
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';

vi.mock('../../application/project/getProjectsUseCase.js', () => ({
  getProjectsUseCase: vi.fn(),
}));

const { getProjectsUseCase } = await import('../../application/project/getProjectsUseCase.js');
const { default: useNgoProjects } = await import('./useNgoProjects.jsx');

const mockProjects = [
  { id: 'p1', title: 'Proyecto 1', status: 'in_progress', deadline: '2025-12-01', modality: 'remoto' },
  { id: 'p2', title: 'Proyecto 2', status: 'pending', deadline: '2025-12-15', modality: 'presencial' },
];

beforeEach(() => {
  vi.clearAllMocks();
});

describe('carga inicial', () => {
  it('loading=true inicialmente', async () => {
    getProjectsUseCase.mockImplementation(() => new Promise(() => {}));
    const { result } = renderHook(() => useNgoProjects());
    expect(result.current.loading).toBe(true);
  });

  it('carga exitosa: projects array seteado, loading=false', async () => {
    getProjectsUseCase.mockResolvedValue(mockProjects);
    const { result } = renderHook(() => useNgoProjects());

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    expect(result.current.projects).toEqual(mockProjects);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('error en carga: error.message seteado, loading=false', async () => {
    getProjectsUseCase.mockRejectedValue(new Error('Error al cargar proyectos.'));
    const { result } = renderHook(() => useNgoProjects());

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    expect(result.current.error).toBe('Error al cargar proyectos.');
    expect(result.current.loading).toBe(false);
    expect(result.current.projects).toEqual([]);
  });

  it('lista vacía: projects=[], sin error', async () => {
    getProjectsUseCase.mockResolvedValue([]);
    const { result } = renderHook(() => useNgoProjects());

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    expect(result.current.projects).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });
});

describe('refresh', () => {
  it('refresh vuelve a llamar getProjectsUseCase y actualiza projects', async () => {
    getProjectsUseCase.mockResolvedValue(mockProjects);
    const { result } = renderHook(() => useNgoProjects());

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    const newProjects = [{ id: 'p3', title: 'Proyecto 3', status: 'completed', deadline: '2025-12-20', modality: 'híbrido' }];
    getProjectsUseCase.mockResolvedValue(newProjects);

    await act(async () => {
      await result.current.refresh();
    });

    expect(getProjectsUseCase).toHaveBeenCalledTimes(2);
    expect(result.current.projects).toEqual(newProjects);
  });

  it('refresh en estado de error: limpia error y vuelve a cargar', async () => {
    getProjectsUseCase
      .mockRejectedValueOnce(new Error('Initial error'))
      .mockResolvedValueOnce(mockProjects);

    const { result } = renderHook(() => useNgoProjects());

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    expect(result.current.error).toBe('Initial error');

    await act(async () => {
      await result.current.refresh();
    });

    expect(result.current.error).toBeNull();
    expect(result.current.projects).toEqual(mockProjects);
  });
});