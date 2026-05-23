import { get, put } from './client.js';

export function getMe() {
  return get('/users/me');
}

export function getUserMe() {
  return get('/users/me');
}

export function updateUserMe(data) {
  return put('/users/me', data);
}
