/**
 * Tests para resetPasswordUseCase.
 *
 * Criterios:
 * - Delegar a authApi.resetPasswordRequest con token y password
 * - Retornar void en caso exitoso
 * - Propagar error en caso de falla
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../infrastructure/api/authApi.js', () => ({
  resetPasswordRequest: vi.fn(),
}));

const { resetPasswordRequest } = await import('../../infrastructure/api/authApi.js');
const { resetPasswordUseCase } = await import('./resetPasswordUseCase.js');

beforeEach(() => vi.clearAllMocks());

describe('resetPasswordUseCase', () => {
  it('delega a resetPasswordRequest con token y password', async () => {
    resetPasswordRequest.mockResolvedValue(undefined);
    await resetPasswordUseCase({ token: 'abc123', password: 'nuevapass123' });
    expect(resetPasswordRequest).toHaveBeenCalledWith('abc123', 'nuevapass123');
  });

  it('retorna void en caso exitoso', async () => {
    resetPasswordRequest.mockResolvedValue(undefined);
    const result = await resetPasswordUseCase({ token: 'abc123', password: 'nuevapass123' });
    expect(result).toBeUndefined();
  });

  it('propaga el error si resetPasswordRequest falla', async () => {
    const error = new Error('Token expirado');
    resetPasswordRequest.mockRejectedValue(error);
    await expect(resetPasswordUseCase({ token: 'expired', password: 'nuevapass123' })).rejects.toThrow('Token expirado');
  });
});