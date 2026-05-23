/**
 * Módulo de dominio: certificados.
 *
 * Reglas de negocio para verificar si un estudiante puede
 * descargar su certificado. canDownloadCertificate es una
 * guardia pura sin dependencias externas.
 *
 * Nota: buildCertificateDownload fue eliminada porque manipulaba
 * el DOM (document.createElement) dentro del dominio. La descarga
 * del PDF se maneja en el hook useStudentCertificate, que es la
 * capa correcta para side-effects de UI.
 */
export function canDownloadCertificate(assignment) {
  if (!assignment) return false;
  if (assignment.status === 'completed') return true;
  if (assignment.certificate_id) return true;
  return false;
}

