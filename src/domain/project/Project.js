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

export function getProjectStatusMessage(status, deliverables = []) {
  if (status !== 'in_review') return null
  const sorted = [...deliverables].sort((a, b) => {
    const PRIORITY = { pending: 0, in_progress: 1, in_review: 2, approved: 3, rejected: 4 }
    const pa = PRIORITY[a.status] ?? 5
    const pb = PRIORITY[b.status] ?? 5
    if (pa !== pb) return pa - pb
    return new Date(b.created_at) - new Date(a.created_at)
  })
  const top = sorted[0]
  if (!top || top.status !== 'approved') {
    return 'Esperando que la ONG apruebe o rechace el último entregable.'
  }
  return 'Esperando que la ONG marque el proyecto como completado o cree otro entregable.'
}

export const DELIVERABLE_STATUS_PRIORITY = {
  pending: 2,
  in_progress: 1,
  in_review: 0,
  approved: 4,
  rejected: 3,
}

export function sortDeliverables(deliverables = []) {
  return [...deliverables].sort((a, b) => {
    const pa = DELIVERABLE_STATUS_PRIORITY[a.status] ?? 5
    const pb = DELIVERABLE_STATUS_PRIORITY[b.status] ?? 5
    if (pa !== pb) return pa - pb
    return new Date(b.created_at) - new Date(a.created_at)
  })
}

export function validateProject({ title, description, objectives, estimated_hours, deadline, modality }) {
  const values = {
    title: (title ?? '').trim(),
    description: typeof description === 'string' ? description.trim() : description,
    objectives: typeof objectives === 'string' ? objectives.trim() : objectives,
    estimated_hours,
    deadline,
    modality: typeof modality === 'string' ? modality.trim() : modality,
  }
  const errors = {}
  if (!values.title) {
    errors.title = 'El título es obligatorio.'
  }
  return { values, errors }
}
