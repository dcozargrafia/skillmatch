/**
 * Tests para getNgoProfileUseCase.
 * - Llama a ngoApi.getNgoMe para datos de la ONG
 * - Combina con usersApi.getUserMe para datos del usuario
 * - Retorna perfil combinado { ngo, user }
 * - Propaga error si la API falla
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getNgoMe } from '../../infrastructure/api/ngoApi.js';
import { getUserMe } from '../../infrastructure/api/usersApi.js';

vi.mock('../../infrastructure/api/ngoApi.js', () => ({
  getNgoMe: vi.fn(),
}));

vi.mock('../../infrastructure/api/usersApi.js', () => ({
  getUserMe: vi.fn(),
}));

const { getNgoProfileUseCase } = await import('./getNgoProfileUseCase.js');

beforeEach(() => {
  vi.clearAllMocks();
});

describe('getNgoProfileUseCase', () => {
  it('retorna perfil combinado de ONG y usuario', async () => {
    const mockNgo = { id: 'ngo1', name: 'ONG Test', organizationName: 'ONG Org', area: 'tech' };
    const mockUser = { id: 'u1', name: 'John', email: 'john@test.com' };
    getNgoMe.mockResolvedValue(mockNgo);
    getUserMe.mockResolvedValue(mockUser);

    const result = await getNgoProfileUseCase();

    expect(getNgoMe).toHaveBeenCalled();
    expect(getUserMe).toHaveBeenCalled();
    expect(result).toEqual({ ngo: mockNgo, user: mockUser });
  });

  it('propaga error si getNgoMe falla', async () => {
    getNgoMe.mockRejectedValue(new Error('Server error'));

    await expect(getNgoProfileUseCase()).rejects.toThrow('Server error');
  });

  it('propaga error si getUserMe falla', async () => {
    getNgoMe.mockResolvedValue({ id: 'ngo1' });
    getUserMe.mockRejectedValue(new Error('Network error'));

    await expect(getNgoProfileUseCase()).rejects.toThrow('Network error');
  });
});