/**
 * Caso de uso: actualizar habilidades del estudiante.
 * Normaliza niveles (básico→basic, intermedio→intermediate, avanzado→advanced)
 * antes de enviar a la API.
 */

import { updateStudentSkills } from '../../infrastructure/api/studentApi.js';
import { normalizeSkillLevel } from '../../domain/skill/Skill.js';

/**
 * @param {{ skill_id: string, level: string }[]} skills
 * @returns {Promise<object>}
 */
export async function updateStudentSkillsUseCase(skills) {
  const normalized = skills.map((s) => ({
    skill_id: s.skill_id,
    level: normalizeSkillLevel(s.level),
  }));
  return updateStudentSkills(normalized);
}