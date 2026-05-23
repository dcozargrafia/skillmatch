import { describe, expect, it } from 'vitest';
import {
  canAcceptAssignment,
  canStartDeliverable,
  canSubmitDeliverable,
} from './Assignment.js';

describe('Assignment', () => {
  describe('canAcceptAssignment', () => {
    it('returns true when status is assigned', () => {
      expect(canAcceptAssignment({ status: 'assigned' })).toBe(true);
    });

    it('returns false when status is pending', () => {
      expect(canAcceptAssignment({ status: 'pending' })).toBe(false);
    });

    it('returns false when status is in_progress', () => {
      expect(canAcceptAssignment({ status: 'in_progress' })).toBe(false);
    });

    it('returns false when status is completed', () => {
      expect(canAcceptAssignment({ status: 'completed' })).toBe(false);
    });

    it('returns false when no status provided', () => {
      expect(canAcceptAssignment({})).toBe(false);
    });
  });

  describe('canStartDeliverable', () => {
    it('returns true when deliverable is pending and no other active', () => {
      const deliverable = { id: 'd1', status: 'pending' };
      const allDeliverables = [
        { id: 'd1', status: 'pending' },
        { id: 'd2', status: 'approved' },
      ];
      expect(canStartDeliverable(deliverable, allDeliverables)).toBe(true);
    });

    it('returns true when deliverable is rejected and no other active', () => {
      const deliverable = { id: 'd1', status: 'rejected' };
      const allDeliverables = [
        { id: 'd1', status: 'rejected' },
      ];
      expect(canStartDeliverable(deliverable, allDeliverables)).toBe(true);
    });

    it('returns false when another deliverable is in_progress', () => {
      const deliverable = { id: 'd1', status: 'pending' };
      const allDeliverables = [
        { id: 'd1', status: 'pending' },
        { id: 'd2', status: 'in_progress' },
      ];
      expect(canStartDeliverable(deliverable, allDeliverables)).toBe(false);
    });

    it('returns false when another deliverable is pending', () => {
      const deliverable = { id: 'd1', status: 'pending' };
      const allDeliverables = [
        { id: 'd1', status: 'pending' },
        { id: 'd2', status: 'pending' },
      ];
      expect(canStartDeliverable(deliverable, allDeliverables)).toBe(false);
    });

    it('returns false when deliverable is in_progress', () => {
      const deliverable = { id: 'd1', status: 'in_progress' };
      const allDeliverables = [{ id: 'd1', status: 'in_progress' }];
      expect(canStartDeliverable(deliverable, allDeliverables)).toBe(false);
    });

    it('returns false when deliverable is approved', () => {
      const deliverable = { id: 'd1', status: 'approved' };
      const allDeliverables = [{ id: 'd1', status: 'approved' }];
      expect(canStartDeliverable(deliverable, allDeliverables)).toBe(false);
    });
  });

  describe('canSubmitDeliverable', () => {
    it('returns true when status is in_progress and fileUrl is non-empty', () => {
      expect(canSubmitDeliverable({ status: 'in_progress' }, 'https://example.com/file.pdf')).toBe(true);
    });

    it('returns true when status is in_progress and fileUrl is a simple string', () => {
      expect(canSubmitDeliverable({ status: 'in_progress' }, 'file.pdf')).toBe(true);
    });

    it('returns false when status is pending', () => {
      expect(canSubmitDeliverable({ status: 'pending' }, 'https://example.com/file.pdf')).toBe(false);
    });

    it('returns false when status is in_review', () => {
      expect(canSubmitDeliverable({ status: 'in_review' }, 'https://example.com/file.pdf')).toBe(false);
    });

    it('returns false when fileUrl is empty string', () => {
      expect(canSubmitDeliverable({ status: 'in_progress' }, '')).toBe(false);
    });

    it('returns false when fileUrl is only whitespace', () => {
      expect(canSubmitDeliverable({ status: 'in_progress' }, '   ')).toBe(false);
    });

    it('returns false when fileUrl is null', () => {
      expect(canSubmitDeliverable({ status: 'in_progress' }, null)).toBe(false);
    });

    it('returns false when fileUrl is undefined', () => {
      expect(canSubmitDeliverable({ status: 'in_progress' }, undefined)).toBe(false);
    });
  });
});