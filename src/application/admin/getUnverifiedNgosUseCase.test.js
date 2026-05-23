/**
 * Tests para getUnverifiedNgosUseCase.
 *
 * Criterios:
 * - Delegar a adminApi.getUnverifiedNgos
 * - Retornar array de ONGs no verificadas
 * - Propagar error en caso de falla
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../infrastructure/api/adminApi.js', () => ({
  getUnverifiedNgos: vi.fn(),
}));

const { getUnverifiedNgos } = await import('../../infrastructure/api/adminApi.js');
const { getUnverifiedNgosUseCase } = await import('./getUnverifiedNgosUseCase.js');

const mockNgos = [
  { id: 1, name: 'ONG Verde', email: 'ong@verde.com', role: 'ngo' },
  { id: 2, name: 'ONG Azul', email: 'ong@azul.com', role: 'ngo' },
];

beforeEach(() => vi.clearAllMocks());

describe('getUnverifiedNgosUseCase', () => {
  it('delega a adminApi.getUnverifiedNgos', async () => {
    getUnverifiedNgos.mockResolvedValue(mockNgos);
    await getUnverifiedNgosUseCase();
    expect(getUnverifiedNgos).toHaveBeenCalledWith();
  });

  it('retorna array de ONGs no verificadas', async () => {
    getUnverifiedNgos.mockResolvedValue(mockNgos);
    const result = await getUnverifiedNgosUseCase();
    expect(result).toEqual(mockNgos);
  });

  it('propaga el error si getUnverifiedNgos falla', async () => {
    const error = new Error('Error al obtener ONGs');
    getUnverifiedNgos.mockRejectedValue(error);
    await expect(getUnverifiedNgosUseCase()).rejects.toThrow('Error al obtener ONGs');
  });
});