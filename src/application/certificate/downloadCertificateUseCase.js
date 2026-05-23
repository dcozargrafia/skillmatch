/**
 * Caso de uso: descargar certificado.
 * Domain guard: canDownloadCertificate.
 */

import { downloadCertificate } from '../../infrastructure/api/certificateApi.js';
import { canDownloadCertificate } from '../../domain/certificate/Certificate.js';

/**
 * @param {object} assignment
 * @returns {Promise<Blob>}
 * @throws {Error} Si el certificado no puede ser descargado
 */
export async function downloadCertificateUseCase(assignment) {
  if (!canDownloadCertificate(assignment)) {
    throw new Error('Cannot download certificate');
  }
  return downloadCertificate(assignment.id);
}