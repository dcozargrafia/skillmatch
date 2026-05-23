import { describe, expect, it } from 'vitest';
import {
  canDownloadCertificate,
} from './Certificate.js';

describe('Certificate', () => {
  describe('canDownloadCertificate', () => {
    it('returns true when assignment status is completed', () => {
      expect(canDownloadCertificate({ status: 'completed' })).toBe(true);
    });

    it('returns true when certificate_id is present', () => {
      expect(canDownloadCertificate({ status: 'in_progress', certificate_id: 'cert-123' })).toBe(true);
    });

    it('returns true when both status is completed and certificate_id is present', () => {
      expect(canDownloadCertificate({ status: 'completed', certificate_id: 'cert-123' })).toBe(true);
    });

    it('returns false when status is in_progress and no certificate_id', () => {
      expect(canDownloadCertificate({ status: 'in_progress' })).toBe(false);
    });

    it('returns false when status is assigned', () => {
      expect(canDownloadCertificate({ status: 'assigned' })).toBe(false);
    });

    it('returns false when status is rejected', () => {
      expect(canDownloadCertificate({ status: 'rejected' })).toBe(false);
    });

    it('returns false when no status and no certificate_id', () => {
      expect(canDownloadCertificate({})).toBe(false);
    });
  });
});