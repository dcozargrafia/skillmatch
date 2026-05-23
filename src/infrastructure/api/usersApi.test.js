import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as client from './client.js';

vi.mock('./client.js', () => ({
  get: vi.fn(),
  put: vi.fn(),
}));

import { getUserMe, updateUserMe, getMe } from './usersApi.js';

beforeEach(() => vi.clearAllMocks());

describe('usersApi', () => {
  it('getUserMe llama a GET /users/me', async () => {
    client.get.mockResolvedValue({ id: 'u1', name: 'Ana', email: 'ana@test.com' });
    const result = await getUserMe();
    expect(client.get).toHaveBeenCalledWith('/users/me');
    expect(result.name).toBe('Ana');
  });

  it('updateUserMe llama a PUT /users/me con los datos', async () => {
    client.put.mockResolvedValue({ id: 'u1', name: 'Ana Nueva', email: 'nueva@test.com' });
    const result = await updateUserMe({ name: 'Ana Nueva', email: 'nueva@test.com' });
    expect(client.put).toHaveBeenCalledWith('/users/me', { name: 'Ana Nueva', email: 'nueva@test.com' });
    expect(result.name).toBe('Ana Nueva');
  });

  it('getMe llama a GET /users/me', async () => {
    client.get.mockResolvedValue({ id: 'u1', name: 'Ana', email: 'ana@test.com' });
    const result = await getMe();
    expect(client.get).toHaveBeenCalledWith('/users/me');
    expect(result.name).toBe('Ana');
  });
});
