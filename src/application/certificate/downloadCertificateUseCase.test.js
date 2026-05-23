/**
 * Tests para downloadCertificateUseCase.
 * Domain guard: canDownloadCertificate. Returns blob.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { downloadCertificate } from '../../infrastructure/api/certificateApi.js';
import { canDownloadCertificate } from '../../domain/certificate/Certificate.js';

vi.mock('../../infrastructure/api/certificateApi.js', () => ({
  downloadCertificate: vi.fn(),
}));

const { downloadCertificateUseCase } = await import('./downloadCertificateUseCase.js');

beforeEach(() => {
  vi.clearAllMocks();
});

describe('downloadCertificateUseCase', () => {
  it('calls downloadCertificate API when domain guard passes', async () => {
    const assignment = { id: 'a1', status: 'completed' };
    const mockBlob = new Blob(['pdf content'], { type: 'application/pdf' });
    downloadCertificate.mockResolvedValue(mockBlob);

    const result = await downloadCertificateUseCase(assignment);

    expect(downloadCertificate).toHaveBeenCalledWith('a1');
    expect(result).toBe(mockBlob);
  });

  it('throws error when assignment is not completed and has no certificate_id', async () => {
    const assignment = { id: 'a1', status: 'assigned' };

    await expect(downloadCertificateUseCase(assignment)).rejects.toThrow(
      'Cannot download certificate',
    );
    expect(downloadCertificate).not.toHaveBeenCalled();
  });

  it('allows download when certificate_id is present', async () => {
    const assignment = { id: 'a1', status: 'assigned', certificate_id: 'cert123' };
    const mockBlob = new Blob(['pdf content'], { type: 'application/pdf' });
    downloadCertificate.mockResolvedValue(mockBlob);

    const result = await downloadCertificateUseCase(assignment);

    expect(downloadCertificate).toHaveBeenCalledWith('a1');
    expect(result).toBe(mockBlob);
  });

  it('propaga error si downloadCertificate API falla', async () => {
    const assignment = { id: 'a1', status: 'completed' };
    downloadCertificate.mockRejectedValue(new Error('Not found'));

    await expect(downloadCertificateUseCase(assignment)).rejects.toThrow('Not found');
  });
});