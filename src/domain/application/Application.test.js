import { describe, expect, it } from 'vitest';
import {
  isApplied,
  isAccepted,
  isRejected,
  resolveApplyStatus,
} from './Application.js';

describe('Application', () => {
  describe('isApplied', () => {
    it('returns true for applied status', () => {
      expect(isApplied({ status: 'applied' })).toBe(true);
    });

    it('returns true for pending status', () => {
      expect(isApplied({ status: 'pending' })).toBe(true);
    });

    it('returns false for accepted status', () => {
      expect(isApplied({ status: 'accepted' })).toBe(false);
    });

    it('returns false for rejected status', () => {
      expect(isApplied({ status: 'rejected' })).toBe(false);
    });

    it('returns false when no status', () => {
      expect(isApplied({})).toBe(false);
    });
  });

  describe('isAccepted', () => {
    it('returns true for accepted status', () => {
      expect(isAccepted({ status: 'accepted' })).toBe(true);
    });

    it('returns true for assigned status', () => {
      expect(isAccepted({ status: 'assigned' })).toBe(true);
    });

    it('returns false for applied status', () => {
      expect(isAccepted({ status: 'applied' })).toBe(false);
    });

    it('returns false for pending status', () => {
      expect(isAccepted({ status: 'pending' })).toBe(false);
    });
  });

  describe('isRejected', () => {
    it('returns true for rejected status', () => {
      expect(isRejected({ status: 'rejected' })).toBe(true);
    });

    it('returns false for accepted status', () => {
      expect(isRejected({ status: 'accepted' })).toBe(false);
    });

    it('returns false for applied status', () => {
      expect(isRejected({ status: 'applied' })).toBe(false);
    });
  });

  describe('resolveApplyStatus', () => {
    it('returns "Ya aplicadas" for applied status', () => {
      expect(resolveApplyStatus({ status: 'applied' })).toBe('Ya aplicadas');
    });

    it('returns "Pendiente" for pending status', () => {
      expect(resolveApplyStatus({ status: 'pending' })).toBe('Pendiente');
    });

    it('returns "Aceptada" for accepted status', () => {
      expect(resolveApplyStatus({ status: 'accepted' })).toBe('Aceptada');
    });

    it('returns "Rechazada" for rejected status', () => {
      expect(resolveApplyStatus({ status: 'rejected' })).toBe('Rechazada');
    });

    it('returns "Asignada" for assigned status', () => {
      expect(resolveApplyStatus({ status: 'assigned' })).toBe('Asignada');
    });

    it('returns original status when not recognized', () => {
      expect(resolveApplyStatus({ status: 'unknown' })).toBe('unknown');
    });

    it('returns "Sin estado" when no status provided', () => {
      expect(resolveApplyStatus({})).toBe('Sin estado');
    });
  });
});