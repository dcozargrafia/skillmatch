/**
 * Tests para createSkillUseCase.
 *
 * Criterios:
 * - Delegar a adminApi.createSkill con { name, category }
 * - Retornar el skill creado
 * - Propagar error en caso de falla
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../infrastructure/api/adminApi.js', () => ({
  createSkill: vi.fn(),
}));

const { createSkill } = await import('../../infrastructure/api/adminApi.js');
const { createSkillUseCase } = await import('./createSkillUseCase.js');

const mockSkill = { id: 1, name: 'JavaScript', category: 'programming' };

beforeEach(() => vi.clearAllMocks());

describe('createSkillUseCase', () => {
  it('delega a adminApi.createSkill con name y category', async () => {
    createSkill.mockResolvedValue(mockSkill);
    await createSkillUseCase({ name: 'JavaScript', category: 'programming' });
    expect(createSkill).toHaveBeenCalledWith({ name: 'JavaScript', category: 'programming' });
  });

  it('retorna el skill creado', async () => {
    createSkill.mockResolvedValue(mockSkill);
    const result = await createSkillUseCase({ name: 'JavaScript', category: 'programming' });
    expect(result).toEqual(mockSkill);
  });

  it('propaga el error si createSkill falla', async () => {
    const error = new Error('Error al crear skill');
    createSkill.mockRejectedValue(error);
    await expect(createSkillUseCase({ name: 'JS', category: 'code' })).rejects.toThrow('Error al crear skill');
  });
});