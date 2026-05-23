/**
 * Caso de uso: actualizar perfil del estudiante.
 * Normaliza disponibilidad → availability antes de enviar a la API.
 */

import { updateStudentMe } from '../../infrastructure/api/studentApi.js';
import { normalizeStudentProfile } from '../../domain/student/Student.js';

/**
 * @param {object} profileData - Campos a actualizar (disponibilidad, portfolio_url, etc.)
 * @returns {Promise<object>}
 */
export async function updateStudentProfileUseCase(profileData) {
  const normalized = normalizeStudentProfile(profileData);
  return updateStudentMe(normalized);
}