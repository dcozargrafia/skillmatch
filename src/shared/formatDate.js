function isFalsy(value) {
  return value === null || value === undefined || value === '';
}

function createDate(value) {
  if (isFalsy(value)) return null;
  return value.includes('T') ? new Date(value) : new Date(value + 'T00:00:00.000Z');
}

export function formatDate(isoString) {
  if (isFalsy(isoString)) return '—';
  const date = createDate(isoString);
  if (!date) return '—';
  if (isoString.includes('T')) {
    return new Intl.DateTimeFormat('es-ES', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }).format(date);
  }
  return new Intl.DateTimeFormat('es-ES', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }).format(date);
}

export function formatDateShort(isoString) {
  if (isFalsy(isoString)) return '—';
  const date = createDate(isoString);
  if (!date) return '—';
  return new Intl.DateTimeFormat('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'UTC' }).format(date);
}

export function formatDateTime(isoString) {
  if (isFalsy(isoString)) return '—';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('es-ES', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'UTC' }).format(date);
}
