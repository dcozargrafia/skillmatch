/**
 * Test: useStudentCertificate
 * SDD Phase 3, Task 3.6
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';

vi.mock('../../application/certificate/downloadCertificateUseCase.js', () => ({
  downloadCertificateUseCase: vi.fn(),
}));

const { downloadCertificateUseCase } = await import('../../application/certificate/downloadCertificateUseCase.js');

const { default: useStudentCertificate } = await import('./useStudentCertificate.jsx');

const mockAnchor = {
  href: '',
  download: '',
  click: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
  // Only mock document.createElement for 'a' tags, not all elements
  const originalCreateElement = document.createElement.bind(document);
  document.createElement = vi.fn((tagName) => {
    if (tagName === 'a') return mockAnchor;
    return originalCreateElement(tagName);
  });
  URL.createObjectURL = vi.fn(() => 'blob:mock-url');
  URL.revokeObjectURL = vi.fn();
});

afterEach(() => {
  // Restore original document.createElement
  document.createElement = document.createElement.bind(document);
});

describe('useStudentCertificate', () => {
  it('initial state: downloading=false, error=null', async () => {
    downloadCertificateUseCase.mockImplementation(() => new Promise(() => {})); // pending forever

    const { result } = renderHook(() => useStudentCertificate());

    expect(result.current.downloading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('handleDownload calls downloadCertificateUseCase and triggers download', async () => {
    const mockBlob = new Blob(['PDF content'], { type: 'application/pdf' });
    downloadCertificateUseCase.mockResolvedValue(mockBlob);

    const { result } = renderHook(() => useStudentCertificate());

    await act(async () => {
      await result.current.handleDownload({ id: 'asgn-1', certificate_id: 'cert-1' });
    });

    expect(downloadCertificateUseCase).toHaveBeenCalledWith({ id: 'asgn-1', certificate_id: 'cert-1' });
    expect(result.current.downloading).toBe(false);
    expect(URL.createObjectURL).toHaveBeenCalledWith(mockBlob);
  });

  it('handleDownload sets error on failure', async () => {
    downloadCertificateUseCase.mockRejectedValue(new Error('Download failed'));

    const { result } = renderHook(() => useStudentCertificate());

    await act(async () => {
      await result.current.handleDownload({ id: 'asgn-1', certificate_id: 'cert-1' });
    });

    expect(result.current.error).toBe('Error al descargar el certificado. Intenta de nuevo.');
    expect(result.current.downloading).toBe(false);
  });

  it('error is cleared before new download attempt', async () => {
    downloadCertificateUseCase.mockRejectedValue(new Error('fail'));

    const { result } = renderHook(() => useStudentCertificate());

    await act(async () => {
      await result.current.handleDownload({ id: 'asgn-1', certificate_id: 'cert-1' });
    });
    expect(result.current.error).toBeTruthy();

    downloadCertificateUseCase.mockResolvedValue(new Blob(['PDF'], { type: 'application/pdf' }));

    await act(async () => {
      await result.current.handleDownload({ id: 'asgn-1', certificate_id: 'cert-1' });
    });

    expect(result.current.error || '').toBe('');
  });
});