/**
 * Tests para getStudentProfileUseCase.
 * Combina perfil del estudiante + catálogo completo de habilidades.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getStudentMe } from '../../infrastructure/api/studentApi.js';
import { getAllSkills } from '../../infrastructure/api/skillsApi.js';

vi.mock('../../infrastructure/api/studentApi.js', () => ({
  getStudentMe: vi.fn(),
}));

vi.mock('../../infrastructure/api/skillsApi.js', () => ({
  getAllSkills: vi.fn(),
}));

const { getStudentProfileUseCase } = await import('./getStudentProfileUseCase.js');

beforeEach(() => {
  vi.clearAllMocks();
});

describe('getStudentProfileUseCase', () => {
  it('returns profile and allSkills combined', async () => {
    const mockProfile = { id: 's1', name: 'Alice', disponibilidad: true };
    const mockSkills = [
      { id: 'sk1', name: 'JavaScript' },
      { id: 'sk2', name: 'React' },
    ];

    getStudentMe.mockResolvedValue(mockProfile);
    getAllSkills.mockResolvedValue(mockSkills);

    const result = await getStudentProfileUseCase();

    expect(result).toEqual({ profile: mockProfile, allSkills: mockSkills });
    expect(getStudentMe).toHaveBeenCalledOnce();
    expect(getAllSkills).toHaveBeenCalledOnce();
  });

  it('propaga error si studentApi falla', async () => {
    getStudentMe.mockRejectedValue(new Error('Unauthorized'));

    await expect(getStudentProfileUseCase()).rejects.toThrow('Unauthorized');
  });

  it('propaga error si skillsApi falla', async () => {
    getStudentMe.mockResolvedValue({ id: 's1' });
    getAllSkills.mockRejectedValue(new Error('Server error'));

    await expect(getStudentProfileUseCase()).rejects.toThrow('Server error');
  });
});