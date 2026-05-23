/**
 * Módulo de dominio: asignaciones y entregables.
 *
 * Guards de negocio para verificar si una asignación puede
 * ser aceptada, si un entregable puede iniciarse o enviarse.
 * Los hooks de entregables consultan estos guards en vez
 * de duplicar lógica de estado en componentes de UI.
 *
 * Sin dependencias de React, Axios ni infraestructura.
 */
const ACTIVE_STATUSES = new Set(['in_progress', 'pending']);

export function canAcceptAssignment(assignment) {
  return assignment?.status === 'assigned';
}

export function canStartDeliverable(deliverable, allDeliverables) {
  if (!deliverable) return false;
  const status = deliverable.status;
  if (status !== 'pending' && status !== 'rejected') return false;

  // Check no OTHER deliverable is active (exclude this deliverable)
  return !allDeliverables.some(
    (d) => d.id !== deliverable.id && ACTIVE_STATUSES.has(d.status)
  );
}

export function canSubmitDeliverable(deliverable, fileUrl) {
  if (deliverable?.status !== 'in_progress') return false;
  if (!fileUrl || typeof fileUrl !== 'string' || !fileUrl.trim()) return false;
  return true;
}