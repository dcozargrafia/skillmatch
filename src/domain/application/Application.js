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