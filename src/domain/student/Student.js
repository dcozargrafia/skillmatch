/**
 * Módulo de dominio: estudiante.
 *
 * Normalización de perfil (disponibilidad↔availability) y
 * validación de portfolio URL. Los hooks de estudiante delegan
 * aquí la sanitización y validación antes de enviar a la API.
 *
 * Sin dependencias de React, Axios ni infraestructura.
 */
function isValidUrl(url) {
  if (!url) return true; // empty is valid
  const trimmed = url.trim();
  if (!trimmed) return false;
  // Allow URLs with or without protocol
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$|^(https?:\/\/)?[^\s@]+\.[^\s@]+/.test(trimmed);
}

export function normalizeStudentProfile({ disponibilidad, portfolio_url, skills }) {
  return {
    availability: disponibilidad ?? false,
    portfolio_url: portfolio_url ?? '',
    skills: skills ?? [],
  };
}

export function validateStudentProfile({ disponibilidad, portfolioUrl, skills }) {
  const values = {
    disponibilidad: disponibilidad ?? false,
    portfolio_url: portfolioUrl?.trim() ?? '',
    skills: skills ?? [],
  };

  const errors = {};

  if (portfolioUrl && !isValidUrl(portfolioUrl)) {
    errors.portfolioUrl = 'Invalid portfolio URL format';
  }

  return { values, errors };
}

export function canEditProfile(student) {
  if (!student) return false;
  return Boolean(student.name);
}