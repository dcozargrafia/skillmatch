/**
 * Tests para updateStudentProfileUseCase.
 * Normaliza disponibilidad → availability antes de llamar a la API.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { updateStudentMe } from '../../infrastructure/api/studentApi.js';
import { normalizeStudentProfile } from '../../domain/student/Student.js';

vi.mock('../../infrastructure/api/studentApi.js', () => ({
  updateStudentMe: vi.fn(),
}));

const { updateStudentProfileUseCase } = await import('./updateStudentProfileUseCase.js');

beforeEach(() => {
  vi.clearAllMocks();
});

describe('updateStudentProfileUseCase', () => {
  it('normalizes disponibilidad to availability via domain and calls updateStudentMe', async () => {
    const input = { disponibilidad: true, portfolio_url: 'https://alice.dev' };
    const normalized = normalizeStudentProfile(input);

    updateStudentMe.mockResolvedValue({ id: 's1', ...normalized });

    const result = await updateStudentProfileUseCase(input);

    expect(updateStudentMe).toHaveBeenCalledWith(normalized);
    expect(result.availability).toBe(true);
  });

  it('maps disponibilidad false correctly', async () => {
    const input = { disponibilidad: false, portfolio_url: '' };
    const normalized = normalizeStudentProfile(input);

    updateStudentMe.mockResolvedValue({ id: 's1', ...normalized });

    await updateStudentProfileUseCase(input);

    const calledWith = updateStudentMe.mock.calls[0][0];
    expect(calledWith.availability).toBe(false);
  });

  it('propaga error si updateStudentMe falla', async () => {
    updateStudentMe.mockRejectedValue(new Error('Validation error'));

    await expect(updateStudentProfileUseCase({ disponibilidad: true })).rejects.toThrow('Validation error');
  });
});