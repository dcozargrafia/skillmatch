export function canDownloadCertificate(assignment) {
  if (!assignment) return false;
  if (assignment.status === 'completed') return true;
  if (assignment.certificate_id) return true;
  return false;
}

export function buildCertificateDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}