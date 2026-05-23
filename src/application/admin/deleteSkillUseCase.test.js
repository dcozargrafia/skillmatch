/**
 * Tests para deleteSkillUseCase.
 *
 * Criterios:
 * - Delegar a adminApi.deleteSkill con el skillId
 * - Retornar void en caso exitoso
 * - Propagar error en caso de falla
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../infrastructure/api/adminApi.js', () => ({
  deleteSkill: vi.fn(),
}));

const { deleteSkill } = await import('../../infrastructure/api/adminApi.js');
const { deleteSkillUseCase } = await import('./deleteSkillUseCase.js');

beforeEach(() => vi.clearAllMocks());

describe('deleteSkillUseCase', () => {
  it('delega a adminApi.deleteSkill con el skillId', async () => {
    deleteSkill.mockResolvedValue(undefined);
    await deleteSkillUseCase(42);
    expect(deleteSkill).toHaveBeenCalledWith(42);
  });

  it('retorna void en caso exitoso', async () => {
    deleteSkill.mockResolvedValue(undefined);
    const result = await deleteSkillUseCase(42);
    expect(result).toBeUndefined();
  });

  it('propaga el error si deleteSkill falla', async () => {
    const error = new Error('Error al eliminar');
    deleteSkill.mockRejectedValue(error);
    await expect(deleteSkillUseCase(99)).rejects.toThrow('Error al eliminar');
  });
});