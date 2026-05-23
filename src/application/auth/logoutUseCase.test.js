/**
 * Tests para logoutUseCase.
 *
 * Criterios:
 * - Delegar a authApi.logoutRequest
 * - Retornar void en caso exitoso
 * - Propagar error en caso de falla
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../infrastructure/api/authApi.js', () => ({
  logoutRequest: vi.fn(),
}));

const { logoutRequest } = await import('../../infrastructure/api/authApi.js');
const { logoutUseCase } = await import('./logoutUseCase.js');

beforeEach(() => vi.clearAllMocks());

describe('logoutUseCase', () => {
  it('delega a logoutRequest sin argumentos', async () => {
    logoutRequest.mockResolvedValue(undefined);
    await logoutUseCase();
    expect(logoutRequest).toHaveBeenCalledWith();
  });

  it('retorna void en caso exitoso', async () => {
    logoutRequest.mockResolvedValue(undefined);
    const result = await logoutUseCase();
    expect(result).toBeUndefined();
  });

  it('propaga el error si logoutRequest falla', async () => {
    const error = new Error('Network error');
    logoutRequest.mockRejectedValue(error);
    await expect(logoutUseCase()).rejects.toThrow('Network error');
  });
});