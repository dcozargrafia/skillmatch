/**
 * Tests para verifyNgoUseCase.
 *
 * Criterios:
 * - Delegar a adminApi.verifyNgo con el userId
 * - Retornar la respuesta de la API
 * - Propagar error en caso de falla
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../infrastructure/api/adminApi.js', () => ({
  verifyNgo: vi.fn(),
}));

const { verifyNgo } = await import('../../infrastructure/api/adminApi.js');
const { verifyNgoUseCase } = await import('./verifyNgoUseCase.js');

const mockResponse = { message: 'ONG verificada', userId: 5 };

beforeEach(() => vi.clearAllMocks());

describe('verifyNgoUseCase', () => {
  it('delega a adminApi.verifyNgo con el userId', async () => {
    verifyNgo.mockResolvedValue(mockResponse);
    await verifyNgoUseCase(5);
    expect(verifyNgo).toHaveBeenCalledWith(5);
  });

  it('retorna la respuesta de la API', async () => {
    verifyNgo.mockResolvedValue(mockResponse);
    const result = await verifyNgoUseCase(5);
    expect(result).toEqual(mockResponse);
  });

  it('propaga el error si verifyNgo falla', async () => {
    const error = new Error('Error al verificar ONG');
    verifyNgo.mockRejectedValue(error);
    await expect(verifyNgoUseCase(5)).rejects.toThrow('Error al verificar ONG');
  });
});