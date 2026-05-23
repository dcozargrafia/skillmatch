import { describe, expect, it } from 'vitest';
import {
  normalizeSkillLevel,
  resolveSkillName,
  resolveProjectSkillNames,
  isSkillLevelValid,
  removeDuplicateSkill,
} from './Skill.js';

describe('Skill', () => {
  describe('normalizeSkillLevel', () => {
    it('maps básico to basic', () => {
      expect(normalizeSkillLevel('básico')).toBe('basic');
    });

    it('maps intermedio to intermediate', () => {
      expect(normalizeSkillLevel('intermedio')).toBe('intermediate');
    });

    it('maps avanzado to advanced', () => {
      expect(normalizeSkillLevel('avanzado')).toBe('advanced');
    });

    it('passes through API form basic', () => {
      expect(normalizeSkillLevel('basic')).toBe('basic');
    });

    it('passes through API form intermediate', () => {
      expect(normalizeSkillLevel('intermediate')).toBe('intermediate');
    });

    it('passes through API form advanced', () => {
      expect(normalizeSkillLevel('advanced')).toBe('advanced');
    });
  });

  describe('isSkillLevelValid', () => {
    it('returns true for basic', () => {
      expect(isSkillLevelValid('basic')).toBe(true);
    });

    it('returns true for intermediate', () => {
      expect(isSkillLevelValid('intermediate')).toBe(true);
    });

    it('returns true for advanced', () => {
      expect(isSkillLevelValid('advanced')).toBe(true);
    });

    it('returns true for Spanish UI labels', () => {
      expect(isSkillLevelValid('básico')).toBe(true);
      expect(isSkillLevelValid('intermedio')).toBe(true);
      expect(isSkillLevelValid('avanzado')).toBe(true);
    });

    it('returns false for invalid level', () => {
      expect(isSkillLevelValid('expert')).toBe(false);
      expect(isSkillLevelValid('')).toBe(false);
      expect(isSkillLevelValid(null)).toBe(false);
      expect(isSkillLevelValid(undefined)).toBe(false);
    });
  });

  describe('resolveSkillName', () => {
    const catalog = [
      { id: 'skill-1', name: 'JavaScript' },
      { id: 'skill-2', name: 'Python' },
    ];

    it('returns the skill name for a matching ID', () => {
      expect(resolveSkillName('skill-1', catalog)).toBe('JavaScript');
    });

    it('returns the skill name for another matching ID', () => {
      expect(resolveSkillName('skill-2', catalog)).toBe('Python');
    });

    it('returns the ID when skill not found in catalog', () => {
      expect(resolveSkillName('skill-99', catalog)).toBe('skill-99');
    });

    it('returns the ID when catalog is empty', () => {
      expect(resolveSkillName('skill-1', [])).toBe('skill-1');
    });
  });

  describe('resolveProjectSkillNames', () => {
    const catalog = [
      { id: 'skill-1', name: 'JavaScript' },
      { id: 'skill-2', name: 'Python' },
      { id: 'skill-3', name: 'Go' },
    ];

    it('returns enriched array with names', () => {
      const projectSkills = [
        { skill_id: 'skill-1', required_level: 'basic' },
        { skill_id: 'skill-2', required_level: 'intermediate' },
      ];
      const result = resolveProjectSkillNames(projectSkills, catalog);
      expect(result).toEqual([
        { skill_id: 'skill-1', name: 'JavaScript', required_level: 'basic' },
        { skill_id: 'skill-2', name: 'Python', required_level: 'intermediate' },
      ]);
    });

    it('uses skill_id as name fallback when not in catalog', () => {
      const projectSkills = [{ skill_id: 'skill-99', required_level: 'advanced' }];
      const result = resolveProjectSkillNames(projectSkills, catalog);
      expect(result).toEqual([
        { skill_id: 'skill-99', name: 'skill-99', required_level: 'advanced' },
      ]);
    });

    it('returns empty array when given empty array', () => {
      expect(resolveProjectSkillNames([], catalog)).toEqual([]);
    });
  });

  describe('removeDuplicateSkill', () => {
    it('removes a skill by skill_id from the array', () => {
      const currentSkills = [
        { skill_id: 'skill-1', level: 'basic' },
        { skill_id: 'skill-2', level: 'intermediate' },
        { skill_id: 'skill-3', level: 'advanced' },
      ];
      const result = removeDuplicateSkill('skill-2', currentSkills);
      expect(result).toEqual([
        { skill_id: 'skill-1', level: 'basic' },
        { skill_id: 'skill-3', level: 'advanced' },
      ]);
    });

    it('returns the original array when skill_id not found', () => {
      const currentSkills = [{ skill_id: 'skill-1', level: 'basic' }];
      const result = removeDuplicateSkill('skill-99', currentSkills);
      expect(result).toEqual([{ skill_id: 'skill-1', level: 'basic' }]);
    });

    it('returns empty array when removing the only skill', () => {
      const currentSkills = [{ skill_id: 'skill-1', level: 'basic' }];
      const result = removeDuplicateSkill('skill-1', currentSkills);
      expect(result).toEqual([]);
    });
  });
});