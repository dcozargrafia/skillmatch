/**
 * Tests para forgotPasswordUseCase.
 *
 * Criterios:
 * - Delegar a authApi.forgotPasswordRequest con el email recibido
 * - Retornar void en caso exitoso
 * - Propagar error en caso de falla
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../infrastructure/api/authApi.js', () => ({
  forgotPasswordRequest: vi.fn(),
}));

const { forgotPasswordRequest } = await import('../../infrastructure/api/authApi.js');
const { forgotPasswordUseCase } = await import('./forgotPasswordUseCase.js');

beforeEach(() => vi.clearAllMocks());

describe('forgotPasswordUseCase', () => {
  it('delega a forgotPasswordRequest con el email', async () => {
    forgotPasswordRequest.mockResolvedValue(undefined);
    await forgotPasswordUseCase('usuario@mail.com');
    expect(forgotPasswordRequest).toHaveBeenCalledWith('usuario@mail.com');
  });

  it('retorna void en caso exitoso', async () => {
    forgotPasswordRequest.mockResolvedValue(undefined);
    const result = await forgotPasswordUseCase('usuario@mail.com');
    expect(result).toBeUndefined();
  });

  it('propaga el error si forgotPasswordRequest falla', async () => {
    const error = new Error('Error de red');
    forgotPasswordRequest.mockRejectedValue(error);
    await expect(forgotPasswordUseCase('usuario@mail.com')).rejects.toThrow('Error de red');
  });
});