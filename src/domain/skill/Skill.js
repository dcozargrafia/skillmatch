const SPANISH_LEVELS = {
  básico: 'basic',
  intermedio: 'intermediate',
  avanzado: 'advanced',
};

const VALID_LEVELS = new Set([
  'basic',
  'intermediate',
  'advanced',
  'básico',
  'intermedio',
  'avanzado',
]);

export function normalizeSkillLevel(level) {
  if (!level) return level;
  return SPANISH_LEVELS[level] ?? level;
}

export function isSkillLevelValid(level) {
  return VALID_LEVELS.has(level);
}

export function resolveSkillName(skillId, catalog) {
  const skill = catalog.find((s) => s.id === skillId);
  return skill?.name ?? skillId;
}

export function resolveProjectSkillNames(projectSkills, catalog) {
  if (!projectSkills || projectSkills.length === 0) return [];
  return projectSkills.map((ps) => ({
    ...ps,
    name: resolveSkillName(ps.skill_id, catalog),
  }));
}

export function removeDuplicateSkill(removedSkillId, currentSkills) {
  if (!currentSkills || currentSkills.length === 0) return [];
  return currentSkills.filter((s) => s.skill_id !== removedSkillId);
}