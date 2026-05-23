/**
 * Módulo de dominio: aplicaciones a proyectos.
 *
 * Clasificación de estados de aplicación (applied, pending,
 * accepted, rejected, assigned) y guards para determinar
 * si un estudiante ya aplicó o fue aceptado. Los hooks
 * consultan estos guards en vez de comparar strings inline.
 *
 * Sin dependencias de React, Axios ni infraestructura.
 */
const STATUS_LABELS = {
  applied: 'Ya aplicadas',
  pending: 'Pendiente',
  accepted: 'Aceptada',
  rejected: 'Rechazada',
  assigned: 'Asignada',
};

export function isApplied(application) {
  return application?.status === 'applied' || application?.status === 'pending';
}

export function isAccepted(application) {
  return application?.status === 'accepted' || application?.status === 'assigned';
}

export function isRejected(application) {
  return application?.status === 'rejected';
}

export function resolveApplyStatus(application) {
  if (!application?.status) return 'Sin estado';
  return STATUS_LABELS[application.status] ?? application.status;
}