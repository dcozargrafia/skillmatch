/**
 * Módulo de dominio: proyecto.
 *
 * Define la máquina de estados del ciclo de vida de un proyecto
 * (pending → assigned → in_progress → in_review → completed/rejected/cancelled)
 * y las reglas de negocio que gobiernan las transiciones.
 *
 * Los componentes de UI y los hooks consultan este módulo para
 * determinar qué acciones están habilitadas (crear entregable,
 * completar proyecto, etc.) sin duplicar lógica.
 *
 * Sin dependencias de React, Axios ni infraestructura.
 */
export const VALID_TRANSITIONS = {
  pending: ['assigned', 'cancelled'],
  assigned: ['in_progress', 'cancelled'],
  in_progress: ['in_review', 'cancelled'],
  in_review: ['in_progress', 'rejected', 'completed', 'cancelled'],
  rejected: ['in_progress', 'in_review', 'cancelled'],
  completed: [],
  cancelled: [],
}

export const TERMINAL_STATUSES = new Set(['completed', 'rejected', 'cancelled'])

export const ACTIVE_DELIVERABLE_STATUSES = new Set([
  'pending',
  'in_progress',
  'in_review',
])

export const STATUS_LABELS = {
  pending: 'Pendiente',
  assigned: 'Asignado',
  in_progress: 'En progreso',
  in_review: 'En revisión',
  rejected: 'Rechazado',
  completed: 'Completado',
  cancelled: 'Cancelado',
}

export function getNextStatuses(currentStatus) {
  return VALID_TRANSITIONS[currentStatus] ?? []
}

export function isTerminalStatus(status) {
  return TERMINAL_STATUSES.has(status)
}

export function hasActiveDeliverable(deliverables = []) {
  return deliverables.some((deliverable) =>
    ACTIVE_DELIVERABLE_STATUSES.has(deliverable?.status),
  )
}

export function getStatusLabel(status) {
  return STATUS_LABELS[status] ?? status
}

export function canCompleteProject(project, deliverables = []) {
  if (project.status !== 'in_review') return false
  if (deliverables.length === 0) return false
  return deliverables.every((d) => d.status === 'approved')
}

export function canCreateDeliverable(project, deliverables = []) {
  if (!project.assignment_id) return false
  if (isTerminalStatus(project.status)) return false
  if (hasActiveDeliverable(deliverables)) return false
  return true
}

export const DELIVERABLE_STATUS_LABELS = {
  pending: 'Pendiente',
  in_progress: 'En progreso',
  in_review: 'En revisión',
  approved: 'Aprobado',
  rejected: 'Rechazado',
}

export function getDeliverableStatusLabel(status) {
  return DELIVERABLE_STATUS_LABELS[status] ?? status
}
