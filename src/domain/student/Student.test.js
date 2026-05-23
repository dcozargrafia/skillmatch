import { describe, expect, it } from 'vitest';
import {
  normalizeStudentProfile,
  normalizeInboundStudentProfile,
  validateStudentProfile,
  canEditProfile,
} from './Student.js';

describe('Student', () => {
  describe('normalizeStudentProfile', () => {
    it('maps disponibilidad to availability', () => {
      const result = normalizeStudentProfile({ disponibilidad: true, portfolio_url: '', skills: [] });
      expect(result.availability).toBe(true);
    });

    it('maps disponibilidad false', () => {
      const result = normalizeStudentProfile({ disponibilidad: false, portfolio_url: '', skills: [] });
      expect(result.availability).toBe(false);
    });

    it('passes portfolio_url through', () => {
      const result = normalizeStudentProfile({ disponibilidad: true, portfolio_url: 'https://example.com', skills: [] });
      expect(result.portfolio_url).toBe('https://example.com');
    });

    it('passes skills through', () => {
      const skills = [{ skill_id: 's1', level: 'basic' }];
      const result = normalizeStudentProfile({ disponibilidad: true, portfolio_url: '', skills });
      expect(result.skills).toEqual(skills);
    });

    it('handles undefined disponibilidad as false', () => {
      const result = normalizeStudentProfile({ disponibilidad: undefined, portfolio_url: '', skills: [] });
      expect(result.availability).toBe(false);
    });
  });

  describe('normalizeInboundStudentProfile', () => {
    it('maps availability to disponibilidad', () => {
      const result = normalizeInboundStudentProfile({ id: 's1', name: 'Ana', availability: true, portfolio_url: '', skills: [] });
      expect(result.disponibilidad).toBe(true);
      expect(result.availability).toBe(true);
    });

    it('defaults disponibilidad to false when availability is missing', () => {
      const result = normalizeInboundStudentProfile({ id: 's1', name: 'Ana', portfolio_url: '' });
      expect(result.disponibilidad).toBe(false);
    });

    it('preserves all other fields', () => {
      const profile = { id: 's1', name: 'Ana', email: 'ana@dev.io', availability: false, portfolio_url: 'https://dev.io', skills: [{ skill_id: 'sk1', level: 'basic' }] };
      const result = normalizeInboundStudentProfile(profile);
      expect(result.id).toBe('s1');
      expect(result.name).toBe('Ana');
      expect(result.email).toBe('ana@dev.io');
      expect(result.skills).toEqual([{ skill_id: 'sk1', level: 'basic' }]);
    });

    it('returns null for null input', () => {
      expect(normalizeInboundStudentProfile(null)).toBeNull();
    });

    it('keeps skill levels in English', () => {
      const result = normalizeInboundStudentProfile({ id: 's1', availability: true, skills: [{ skill_id: 'sk1', level: 'intermediate' }] });
      expect(result.skills[0].level).toBe('intermediate');
    });
  });

  describe('validateStudentProfile', () => {
    it('returns valid for a complete profile', () => {
      const result = validateStudentProfile({
        disponibilidad: true,
        portfolioUrl: 'https://portfolio.dev',
        skills: [{ id: 's1', level: 'básico' }],
      });
      expect(result.errors).toEqual({});
    });

    it('returns valid with empty portfolio URL', () => {
      const result = validateStudentProfile({
        disponibilidad: false,
        portfolioUrl: '',
        skills: [],
      });
      expect(result.errors).toEqual({});
    });

    it('returns error for invalid portfolio URL format', () => {
      const result = validateStudentProfile({
        disponibilidad: false,
        portfolioUrl: 'not-a-url',
        skills: [],
      });
      expect(result.errors.portfolioUrl).toBeDefined();
    });

    it('returns error for portfolio URL with only spaces', () => {
      const result = validateStudentProfile({
        disponibilidad: false,
        portfolioUrl: '   ',
        skills: [],
      });
      expect(result.errors.portfolioUrl).toBeDefined();
    });

    it('normalizes portfolio URL in values', () => {
      const result = validateStudentProfile({
        disponibilidad: false,
        portfolioUrl: '  https://example.com  ',
        skills: [],
      });
      expect(result.values.portfolio_url).toBe('https://example.com');
    });

    it('allows URLs without protocol', () => {
      const result = validateStudentProfile({
        disponibilidad: false,
        portfolioUrl: 'example.com',
        skills: [],
      });
      expect(result.errors.portfolioUrl).toBeUndefined();
    });
  });

  describe('canEditProfile', () => {
    it('returns true when student has profile', () => {
      expect(canEditProfile({ name: 'Ana' })).toBe(true);
    });

    it('returns false when student is null', () => {
      expect(canEditProfile(null)).toBe(false);
    });

    it('returns false when student is undefined', () => {
      expect(canEditProfile(undefined)).toBe(false);
    });

    it('returns false when student has no name property', () => {
      expect(canEditProfile({})).toBe(false);
    });
  });
});