/**
 * Tests para useNgoProfile (SDD Phase 3, Task 3.4).
 *
 * Hook que carga y guarda el perfil de la ONG.
 * Llama a getNgoProfileUseCase y updateNgoProfileUseCase.
 *
 * Criterios de aceptación:
 * - Loading state inicial: loading=true, profile=null
 * - Carga exitosa: profile={ngo, user}, loading=false
 * - Error en carga: error.message seteado, loading=false
 * - handleSave: llama updateNgoProfileUseCase, actualiza profile en success
 * - handleSave error: error.message seteado (no actualiza profile)
 * - Success message en handleSave exitoso
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';

vi.mock('../../application/ngo/getNgoProfileUseCase.js', () => ({
  getNgoProfileUseCase: vi.fn(),
}));

vi.mock('../../application/ngo/updateNgoProfileUseCase.js', () => ({
  updateNgoProfileUseCase: vi.fn(),
}));

const { getNgoProfileUseCase } = await import('../../application/ngo/getNgoProfileUseCase.js');
const { updateNgoProfileUseCase } = await import('../../application/ngo/updateNgoProfileUseCase.js');
const { default: useNgoProfile } = await import('./useNgoProfile.jsx');

const mockNgo = {
  id: 'ngo-1',
  name: 'ONG Test',
  email: 'ong@test.com',
  organization_name: 'ONG de Prueba',
  area: 'Educación',
  verified: true,
};

const mockUser = {
  id: 1,
  name: 'Juan Pérez',
  email: 'juan@test.com',
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('carga inicial', () => {
  it('carga exitosa: profile={ngo, user}, loading=false', async () => {
    getNgoProfileUseCase.mockResolvedValue({ ngo: mockNgo, user: mockUser });

    const { result } = renderHook(() => useNgoProfile());

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    expect(result.current.profile).toEqual({ ngo: mockNgo, user: mockUser });
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('error en carga: error.message seteado, loading=false', async () => {
    getNgoProfileUseCase.mockRejectedValue(new Error('Error al cargar el perfil.'));

    const { result } = renderHook(() => useNgoProfile());

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    expect(result.current.error).toBe('Error al cargar el perfil.');
    expect(result.current.loading).toBe(false);
  });
});

describe('handleSave', () => {
  it('handleSave exitoso: llama updateNgoProfileUseCase, actualiza profile', async () => {
    getNgoProfileUseCase.mockResolvedValue({ ngo: mockNgo, user: mockUser });
    const updatedProfile = {
      ngo: { ...mockNgo, organization_name: 'ONG Actualizada' },
      user: { ...mockUser, name: 'Juan Actualizado' },
    };
    updateNgoProfileUseCase.mockResolvedValue(updatedProfile);

    const { result } = renderHook(() => useNgoProfile());

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    const saveData = {
      name: 'Juan Actualizado',
      email: 'juan@test.com',
      organization_name: 'ONG Actualizada',
      area: 'Educación',
    };

    await act(async () => {
      await result.current.handleSave(saveData);
    });

    expect(updateNgoProfileUseCase).toHaveBeenCalledWith(saveData);
    expect(result.current.profile).toEqual(updatedProfile);
    expect(result.current.successMessage).toBe('Perfil actualizado correctamente.');
    expect(result.current.error).toBeNull();
  });

  it('handleSave error: error.message seteado, profile no cambia', async () => {
    getNgoProfileUseCase.mockResolvedValue({ ngo: mockNgo, user: mockUser });
    updateNgoProfileUseCase.mockRejectedValue(new Error('Error al actualizar el perfil.'));

    const { result } = renderHook(() => useNgoProfile());

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    const saveData = {
      name: 'Juan',
      email: 'juan@test.com',
      organization_name: 'ONG',
      area: 'Educación',
    };

    await act(async () => {
      await result.current.handleSave(saveData);
    });

    expect(result.current.error).toBe('Error al actualizar el perfil.');
    expect(result.current.profile).toEqual({ ngo: mockNgo, user: mockUser }); // unchanged
    expect(result.current.successMessage).toBe('');
  });

  it('handleSave limpia mensajes previos', async () => {
    getNgoProfileUseCase.mockResolvedValue({ ngo: mockNgo, user: mockUser });
    updateNgoProfileUseCase.mockRejectedValueOnce(new Error('Error al actualizar el perfil.'));
    updateNgoProfileUseCase.mockResolvedValueOnce({
      ngo: mockNgo,
      user: mockUser,
    });

    const { result } = renderHook(() => useNgoProfile());

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    // First save — fails
    await act(async () => {
      await result.current.handleSave({ name: 'Juan', email: 'j@test.com', organization_name: 'ONG', area: 'Ed' });
    });
    expect(result.current.error).toBe('Error al actualizar el perfil.');

    // Second save — succeeds
    await act(async () => {
      await result.current.handleSave({ name: 'Juan', email: 'j@test.com', organization_name: 'ONG', area: 'Ed' });
    });
    expect(result.current.error).toBeNull();
    expect(result.current.successMessage).toBe('Perfil actualizado correctamente.');
  });
});
