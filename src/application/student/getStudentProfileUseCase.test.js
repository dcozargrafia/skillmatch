/**
 * Tests para getStudentProfileUseCase.
 * Combina perfil del estudiante + catálogo completo de habilidades.
 * Normaliza inbound: availability → disponibilidad.
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
  it('returns profile with availability mapped to disponibilidad', async () => {
    const apiProfile = { id: 's1', name: 'Alice', availability: true, portfolio_url: 'https://dev.portfolio', skills: [{ skill_id: 'sk1', level: 'basic' }] };
    const mockSkills = [
      { id: 'sk1', name: 'JavaScript' },
      { id: 'sk2', name: 'React' },
    ];

    getStudentMe.mockResolvedValue(apiProfile);
    getAllSkills.mockResolvedValue(mockSkills);

    const result = await getStudentProfileUseCase();

    expect(result.profile.disponibilidad).toBe(true);
    expect(result.profile.availability).toBe(true);
    expect(result.profile.skills[0].level).toBe('basic');
    expect(result.allSkills).toEqual(mockSkills);
    expect(getStudentMe).toHaveBeenCalledOnce();
    expect(getAllSkills).toHaveBeenCalledOnce();
  });

  it('defaults disponibilidad to false when availability is missing', async () => {
    const apiProfile = { id: 's2', name: 'Bob', portfolio_url: '' };
    getStudentMe.mockResolvedValue(apiProfile);
    getAllSkills.mockResolvedValue([]);

    const result = await getStudentProfileUseCase();

    expect(result.profile.disponibilidad).toBe(false);
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

  it('returns null profile when normalizeInboundStudentProfile receives null', async () => {
    getStudentMe.mockResolvedValue(null);
    getAllSkills.mockResolvedValue([]);

    const result = await getStudentProfileUseCase();

    expect(result.profile).toBeNull();
  });
});