/**
 * Módulo de dominio: ONG.
 *
 * Validación de perfil de ONG y reglas de negocio que gobiernan
 * qué acciones puede realizar una ONG sobre sus proyectos
 * (editar, cancelar). Depende de Project.isTerminalStatus para
 * determinar si un proyecto está en estado terminal.
 *
 * Sin dependencias de React, Axios ni infraestructura.
 */
import { isTerminalStatus } from '../project/Project.js'

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function validateNgoProfile({ name, email, organizationName, area }) {
  const values = {
    name: (name ?? '').trim(),
    email: (email ?? '').trim(),
    organizationName: (organizationName ?? '').trim(),
    area: (area ?? '').trim(),
  }

  const errors = {}

  if (!values.name) {
    errors.name = 'Name is required'
  }

  if (!values.email) {
    errors.email = 'Email is required'
  } else if (!isValidEmail(values.email)) {
    errors.email = 'Invalid email format'
  }

  if (!values.organizationName) {
    errors.organizationName = 'Organization name is required'
  }

  if (!values.area) {
    errors.area = 'Area is required'
  }

  return { values, errors }
}

export function canEditProject(project, ngoUserId) {
  return project.ngo_user_id === ngoUserId && !isTerminalStatus(project.status)
}

export function canCancelProject(status) {
  return !isTerminalStatus(status)
}