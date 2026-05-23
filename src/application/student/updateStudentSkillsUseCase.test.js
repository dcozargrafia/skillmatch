/**
 * Tests para updateStudentSkillsUseCase.
 * Normaliza niveles de habilidad vía domain antes de enviar a la API.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { updateStudentSkills } from '../../infrastructure/api/studentApi.js';
import { normalizeSkillLevel } from '../../domain/skill/Skill.js';

vi.mock('../../infrastructure/api/studentApi.js', () => ({
  updateStudentSkills: vi.fn(),
}));

const { updateStudentSkillsUseCase } = await import('./updateStudentSkillsUseCase.js');

beforeEach(() => {
  vi.clearAllMocks();
});

describe('updateStudentSkillsUseCase', () => {
  it('normalizes skill levels via domain before calling API', async () => {
    const skills = [
      { skill_id: 'sk1', level: 'básico' },
      { skill_id: 'sk2', level: 'intermedio' },
    ];
    const expected = [
      { skill_id: 'sk1', level: 'basic' },
      { skill_id: 'sk2', level: 'intermediate' },
    ];

    updateStudentSkills.mockResolvedValue({ success: true });

    const result = await updateStudentSkillsUseCase(skills);

    expect(updateStudentSkills).toHaveBeenCalledWith(expected);
    expect(result.success).toBe(true);
  });

  it('passes through already-normalized levels', async () => {
    const skills = [{ skill_id: 'sk1', level: 'advanced' }];
    const expected = [{ skill_id: 'sk1', level: 'advanced' }];

    updateStudentSkills.mockResolvedValue({ success: true });

    await updateStudentSkillsUseCase(skills);

    expect(updateStudentSkills).toHaveBeenCalledWith(expected);
  });

  it('propaga error si updateStudentSkills falla', async () => {
    updateStudentSkills.mockRejectedValue(new Error('Server error'));

    await expect(updateStudentSkillsUseCase([{ skill_id: 'sk1', level: 'basic' }])).rejects.toThrow('Server error');
  });
});