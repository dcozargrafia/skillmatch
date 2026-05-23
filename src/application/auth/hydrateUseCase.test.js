/**
 * Tests para hydrateUseCase.
 *
 * Criterios:
 * - Delegar a usersApi.getMe para obtener el usuario autenticado
 * - Retornar el usuario en caso exitoso
 * - Propagar error en caso de falla
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../infrastructure/api/usersApi.js', () => ({
  getMe: vi.fn(),
}));

const { getMe } = await import('../../infrastructure/api/usersApi.js');
const { hydrateUseCase } = await import('./hydrateUseCase.js');

const mockUser = { id: 1, name: 'Ana', email: 'ana@test.com', role: 'student' };

beforeEach(() => vi.clearAllMocks());

describe('hydrateUseCase', () => {
  it('delega a usersApi.getMe para obtener el usuario', async () => {
    getMe.mockResolvedValue(mockUser);
    await hydrateUseCase();
    expect(getMe).toHaveBeenCalledWith();
  });

  it('retorna el usuario en caso exitoso', async () => {
    getMe.mockResolvedValue(mockUser);
    const result = await hydrateUseCase();
    expect(result).toEqual(mockUser);
  });

  it('propaga el error si getMe falla', async () => {
    const error = new Error('No autenticado');
    getMe.mockRejectedValue(error);
    await expect(hydrateUseCase()).rejects.toThrow('No autenticado');
  });
});