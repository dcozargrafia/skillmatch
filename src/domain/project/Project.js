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
