/**
 * Hook: useStudentCertificate
 * SDD Phase 3, Task 3.6
 *
 * Maneja la descarga de certificados.
 * Llama a downloadCertificateUseCase.
 * NUNCA llama a infrastructure APIs directamente.
 */

import { useState, useCallback } from 'react';
import { downloadCertificateUseCase } from '../../application/certificate/downloadCertificateUseCase.js';

/**
 * @returns {{
 *   downloading: boolean,
 *   error: string|null,
 *   handleDownload: (assignment: object) => Promise<void>,
 * }}
 */
export default function useStudentCertificate() {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState(null);

  const handleDownload = useCallback(async (assignment) => {
    setError(null);
    setDownloading(true);
    try {
      const blob = await downloadCertificateUseCase(assignment);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'certificado.pdf';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError('Error al descargar el certificado. Intenta de nuevo.');
    } finally {
      setDownloading(false);
    }
  }, []);

  return {
    downloading,
    error,
    handleDownload,
  };
}