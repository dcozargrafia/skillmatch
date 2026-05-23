/**
 * Tests para getSkillsUseCase.
 * Devuelve el catálogo completo de habilidades.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAllSkills } from '../../infrastructure/api/skillsApi.js';

vi.mock('../../infrastructure/api/skillsApi.js', () => ({
  getAllSkills: vi.fn(),
}));

const { getSkillsUseCase } = await import('./getSkillsUseCase.js');

beforeEach(() => {
  vi.clearAllMocks();
});

describe('getSkillsUseCase', () => {
  it('returns the full skills catalog', async () => {
    const skills = [
      { id: 'sk1', name: 'JavaScript' },
      { id: 'sk2', name: 'React' },
      { id: 'sk3', name: 'Node.js' },
    ];

    getAllSkills.mockResolvedValue(skills);

    const result = await getSkillsUseCase();

    expect(result).toEqual(skills);
    expect(getAllSkills).toHaveBeenCalledOnce();
  });

  it('propaga error si skillsApi falla', async () => {
    getAllSkills.mockRejectedValue(new Error('Server error'));

    await expect(getSkillsUseCase()).rejects.toThrow('Server error');
  });
});