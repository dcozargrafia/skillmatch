/**
 * Módulo de dominio: usuario.
 * Validadores puros para auth y registro. Sin imports de React ni infraestructura.
 */

const NETWORK_CODES = new Set(['ERR_NETWORK', 'ERR_CONNECTION_REFUSED', 'ECONNREFUSED', 'ECONNABORTED', 'ERR_INTERNET_DISCONNECTED']);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Valida el formato de un email.
 * @param {string|null|undefined} email
 * @returns {{ isValid: boolean, error?: string }}
 */
export function validateEmail(email) {
  if (!email || typeof email !== 'string' || !EMAIL_RE.test(email.trim())) {
    return { isValid: false, error: 'Email inválido' };
  }
  return { isValid: true };
}

/**
 * Valida que el password tenga al menos 8 caracteres.
 * @param {string|null|undefined} password
 * @returns {{ isValid: boolean, error?: string }}
 */
export function validatePassword(password) {
  if (!password || typeof password !== 'string' || password.length < 8) {
    return { isValid: false, error: 'La contraseña debe tener al menos 8 caracteres' };
  }
  return { isValid: true };
}

/**
 * Valida todos los campos de registro.
 * @param {{ name?: string, email?: string, password?: string }} data
 * @returns {{ isValid: boolean, errors: object }}
 */
export function validateRegistration(data) {
  const errors = {};

  if (!data?.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
    errors.name = 'El nombre es requerido';
  }

  const emailResult = validateEmail(data?.email);
  if (!emailResult.isValid) {
    errors.email = emailResult.error;
  }

  const passwordResult = validatePassword(data?.password);
  if (!passwordResult.isValid) {
    errors.password = passwordResult.error;
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}

/**
 * Valida los campos de reset de password.
 * @param {{ password?: string, confirmPassword?: string }} data
 * @returns {{ isValid: boolean, errors: object }}
 */
export function validateResetPassword({ password, confirmPassword }) {
  const errors = {};

  const passwordResult = validatePassword(password);
  if (!passwordResult.isValid) {
    errors.password = passwordResult.error;
  }

  if (!confirmPassword || typeof confirmPassword !== 'string' || confirmPassword.trim().length === 0) {
    errors.confirmPassword = 'Por favor confirma tu contraseña';
  } else if (password !== confirmPassword) {
    errors.confirmPassword = 'Las contraseñas no coinciden';
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}

/**
 * Normaliza un usuario crudo desde la API.
 * @param {{ id: number, name: string, email: string, role: string, created_at: string, organization_name?: string, area?: string }} rawUser
 * @returns {{ id: number, name: string, email: string, role: string, created_at: string, organization_name?: string, area?: string }}
 */
export function createUser(rawUser) {
  const user = {
    id: rawUser.id,
    name: rawUser.name,
    email: rawUser.email,
    role: rawUser.role,
    created_at: rawUser.created_at,
  };

  if (rawUser.organization_name) {
    user.organization_name = rawUser.organization_name;
  }

  if (rawUser.area) {
    user.area = rawUser.area;
  }

  return user;
}

/**
 * Clasifica si un error es de red (sin respuesta del servidor).
 * @param {unknown} err
 * @returns {boolean}
 */
export function isNetworkError(err) {
  if (!err?.response) return true;
  if (NETWORK_CODES.has(err?.code)) return true;
  return false;
}