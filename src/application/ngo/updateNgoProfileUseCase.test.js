/**
 * Tests para updateNgoProfileUseCase.
 * - Valida con validateNgoProfile antes de enviar
 * - Llama a ngoApi.updateNgoMe y usersApi.updateUserMe
 * - Propaga error si la validación falla
 * - Propaga error si alguna API falla
 * - Retorna perfil actualizado
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { updateNgoMe } from '../../infrastructure/api/ngoApi.js';
import { updateUserMe } from '../../infrastructure/api/usersApi.js';
import { validateNgoProfile } from '../../domain/ngo/Ngo.js';

vi.mock('../../infrastructure/api/ngoApi.js', () => ({
  updateNgoMe: vi.fn(),
}));

vi.mock('../../infrastructure/api/usersApi.js', () => ({
  updateUserMe: vi.fn(),
}));

vi.mock('../../domain/ngo/Ngo.js', () => ({
  validateNgoProfile: vi.fn(),
}));

const { updateNgoProfileUseCase } = await import('./updateNgoProfileUseCase.js');

beforeEach(() => {
  vi.clearAllMocks();
});

describe('updateNgoProfileUseCase', () => {
  it('valida con validateNgoProfile y luego actualiza ambos', async () => {
    const profileData = { name: 'ONG Name', email: 'ong@test.com', organizationName: 'ONG', area: 'tech' };
    const mockNgo = { id: 'ngo1', ...profileData };
    const mockUser = { id: 'u1', name: 'ONG Name', email: 'ong@test.com' };

    validateNgoProfile.mockReturnValue({ values: profileData, errors: {} });
    updateNgoMe.mockResolvedValue(mockNgo);
    updateUserMe.mockResolvedValue(mockUser);

    const result = await updateNgoProfileUseCase(profileData);

    expect(validateNgoProfile).toHaveBeenCalledWith(profileData);
    expect(updateNgoMe).toHaveBeenCalledWith(profileData);
    expect(updateUserMe).toHaveBeenCalled();
    expect(result).toEqual({ ngo: mockNgo, user: mockUser });
  });

  it('lanza error si validateNgoProfile retorna errores', async () => {
    const profileData = { name: '', email: 'invalid', organizationName: '', area: '' };
    validateNgoProfile.mockReturnValue({
      values: { name: '' },
      errors: { name: 'Name is required', email: 'Invalid email format' },
    });

    await expect(updateNgoProfileUseCase(profileData)).rejects.toThrow('Name is required');
    expect(updateNgoMe).not.toHaveBeenCalled();
    expect(updateUserMe).not.toHaveBeenCalled();
  });

  it('propaga error si updateNgoMe falla', async () => {
    const profileData = { name: 'ONG', email: 'ong@test.com', organizationName: 'ONG', area: 'tech' };
    validateNgoProfile.mockReturnValue({ values: profileData, errors: {} });
    updateNgoMe.mockRejectedValue(new Error('Server error'));

    // With sequential (await), updateNgoMe fails first; updateUserMe is called because it starts after
    await expect(updateNgoProfileUseCase(profileData)).rejects.toThrow('Server error');
  });

  it('propaga error si updateUserMe falla', async () => {
    const profileData = { name: 'ONG', email: 'ong@test.com', organizationName: 'ONG', area: 'tech' };
    const mockNgo = { id: 'ngo1', ...profileData };
    validateNgoProfile.mockReturnValue({ values: profileData, errors: {} });
    updateNgoMe.mockResolvedValue(mockNgo);
    updateUserMe.mockRejectedValue(new Error('Network error'));

    await expect(updateNgoProfileUseCase(profileData)).rejects.toThrow('Network error');
  });
});