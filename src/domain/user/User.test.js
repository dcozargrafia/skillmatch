/**
 * Tests para User.js — validadores puros de dominio.
 *
 * Criterios de aceptación (SDD spec):
 * - validateEmail retorna { isValid, error }
 * - validatePassword retorna { isValid, error }
 * - validateRegistration retorna { isValid, errors }
 * - validateResetPassword retorna { isValid, errors }
 * - createUser normaliza el objeto de usuario
 * - isNetworkError clasifica errores de red correctamente
 */

import { describe, it, expect } from 'vitest';
import {
  validateEmail,
  validatePassword,
  validateRegistration,
  validateResetPassword,
  createUser,
  isNetworkError,
} from './User.js';

describe('User.js domain validators', () => {
  describe('validateEmail', () => {
    it('retorna isValid=true para email con formato válido', () => {
      const result = validateEmail('usuario@mail.com');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('retorna isValid=false para email sin @', () => {
      const result = validateEmail('usuario-sin-arroba.com');
      expect(result.isValid).toBe(false);
      expect(result.error).toBeTruthy();
    });

    it('retorna isValid=false para email sin dominio', () => {
      const result = validateEmail('usuario@');
      expect(result.isValid).toBe(false);
      expect(result.error).toBeTruthy();
    });

    it('retorna isValid=false para email vacío', () => {
      const result = validateEmail('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBeTruthy();
    });

    it('retorna isValid=false para email nulo', () => {
      const result = validateEmail(null);
      expect(result.isValid).toBe(false);
      expect(result.error).toBeTruthy();
    });
  });

  describe('validatePassword', () => {
    it('retorna isValid=true para password de 8+ caracteres', () => {
      const result = validatePassword('password123');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('retorna isValid=true para password exactamente 8 caracteres', () => {
      const result = validatePassword('12345678');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('retorna isValid=false para password de 7 caracteres', () => {
      const result = validatePassword('1234567');
      expect(result.isValid).toBe(false);
      expect(result.error).toBeTruthy();
    });

    it('retorna isValid=false para password vacío', () => {
      const result = validatePassword('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBeTruthy();
    });

    it('retorna isValid=false para password nulo', () => {
      const result = validatePassword(null);
      expect(result.isValid).toBe(false);
      expect(result.error).toBeTruthy();
    });
  });

  describe('validateRegistration', () => {
    it('retorna isValid=true sin errores para datos válidos', () => {
      const data = { name: 'Carlos', email: 'carlos@test.com', password: 'password123' };
      const result = validateRegistration(data);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('retorna isValid=false con errores para email inválido', () => {
      const data = { name: 'Carlos', email: 'no-es-email', password: 'password123' };
      const result = validateRegistration(data);
      expect(result.isValid).toBe(false);
      expect(result.errors.email).toBeTruthy();
    });

    it('retorna isValid=false con errores para password débil', () => {
      const data = { name: 'Carlos', email: 'carlos@test.com', password: 'short' };
      const result = validateRegistration(data);
      expect(result.isValid).toBe(false);
      expect(result.errors.password).toBeTruthy();
    });

    it('retorna isValid=false con errores para name vacío', () => {
      const data = { name: '', email: 'carlos@test.com', password: 'password123' };
      const result = validateRegistration(data);
      expect(result.isValid).toBe(false);
      expect(result.errors.name).toBeTruthy();
    });

    it('retorna todos los errores cuando múltiples campos son inválidos', () => {
      const data = { name: '', email: 'invalid', password: 'x' };
      const result = validateRegistration(data);
      expect(result.isValid).toBe(false);
      expect(result.errors.name).toBeTruthy();
      expect(result.errors.email).toBeTruthy();
      expect(result.errors.password).toBeTruthy();
    });
  });

  describe('validateResetPassword', () => {
    it('retorna isValid=true cuando passwords coinciden y son válidos', () => {
      const result = validateResetPassword({ password: 'password123', confirmPassword: 'password123' });
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('retorna isValid=false cuando passwords no coinciden', () => {
      const result = validateResetPassword({ password: 'password123', confirmPassword: 'otracontrasena' });
      expect(result.isValid).toBe(false);
      expect(result.errors.confirmPassword).toBeTruthy();
    });

    it('retorna isValid=false cuando password es débil', () => {
      const result = validateResetPassword({ password: 'short', confirmPassword: 'short' });
      expect(result.isValid).toBe(false);
      expect(result.errors.password).toBeTruthy();
    });

    it('retorna isValid=false cuando confirmPassword está vacío', () => {
      const result = validateResetPassword({ password: 'password123', confirmPassword: '' });
      expect(result.isValid).toBe(false);
      expect(result.errors.confirmPassword).toBeTruthy();
    });
  });

  describe('createUser', () => {
    it('retorna objeto normalizado con campos requeridos', () => {
      const raw = { id: 1, name: 'Ana', email: 'ana@test.com', role: 'student', created_at: '2025-01-01' };
      const result = createUser(raw);
      expect(result).toEqual({ id: 1, name: 'Ana', email: 'ana@test.com', role: 'student', created_at: '2025-01-01' });
    });

    it('incluye organization_name si está presente', () => {
      const raw = { id: 2, name: 'ONG Verde', email: 'ong@verde.com', role: 'ngo', created_at: '2025-01-02', organization_name: 'ONG Verde' };
      const result = createUser(raw);
      expect(result.organization_name).toBe('ONG Verde');
    });

    it('incluye area si está presente', () => {
      const raw = { id: 3, name: 'Pedro', email: 'pedro@test.com', role: 'student', created_at: '2025-01-03', area: 'technology' };
      const result = createUser(raw);
      expect(result.area).toBe('technology');
    });

    it('no incluye campos undefined', () => {
      const raw = { id: 4, name: 'Luis', email: 'luis@test.com', role: 'admin', created_at: '2025-01-04' };
      const result = createUser(raw);
      expect(result.organization_name).toBeUndefined();
      expect(result.area).toBeUndefined();
    });
  });

  describe('isNetworkError', () => {
    it('retorna true cuando error.response es undefined (error de red)', () => {
      const error = new Error('Network Error');
      expect(isNetworkError(error)).toBe(true);
    });

    it('retorna true para códigos de error de red conocidos', () => {
      const error = { code: 'ERR_NETWORK', response: undefined };
      expect(isNetworkError(error)).toBe(true);
    });

    it('retorna false para errores HTTP con respuesta', () => {
      const error = { response: { status: 401 }, code: undefined };
      expect(isNetworkError(error)).toBe(false);
    });

    it('retorna false para errores con código que no es de red', () => {
      const error = { code: 'ERR_BAD_REQUEST', response: { status: 400 } };
      expect(isNetworkError(error)).toBe(false);
    });
  });
});