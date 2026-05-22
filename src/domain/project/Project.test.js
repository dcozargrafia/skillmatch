import {
  VALID_TRANSITIONS,
  STATUS_LABELS,
  getNextStatuses,
  isTerminalStatus,
  hasActiveDeliverable,
  getStatusLabel,
} from './Project'

describe('project domain helpers', () => {
  describe('getNextStatuses', () => {
    it('returns valid next statuses for each project status', () => {
      expect(getNextStatuses('pending')).toEqual(['assigned', 'cancelled'])
      expect(getNextStatuses('assigned')).toEqual(['in_progress', 'cancelled'])
      expect(getNextStatuses('in_progress')).toEqual(['in_review', 'cancelled'])
      expect(getNextStatuses('in_review')).toEqual([
        'in_progress',
        'rejected',
        'completed',
        'cancelled',
      ])
      expect(getNextStatuses('rejected')).toEqual([
        'in_progress',
        'in_review',
        'cancelled',
      ])
      expect(getNextStatuses('completed')).toEqual([])
      expect(getNextStatuses('cancelled')).toEqual([])
    })

    it('returns an empty list for unknown status', () => {
      expect(getNextStatuses('unexpected')).toEqual([])
    })
  })

  describe('isTerminalStatus', () => {
    it('returns true for terminal statuses', () => {
      expect(isTerminalStatus('completed')).toBe(true)
      expect(isTerminalStatus('rejected')).toBe(true)
      expect(isTerminalStatus('cancelled')).toBe(true)
    })

    it('returns false for non-terminal statuses', () => {
      expect(isTerminalStatus('pending')).toBe(false)
      expect(isTerminalStatus('assigned')).toBe(false)
      expect(isTerminalStatus('in_progress')).toBe(false)
      expect(isTerminalStatus('in_review')).toBe(false)
    })
  })

  describe('hasActiveDeliverable', () => {
    it('returns true when there is at least one active deliverable', () => {
      expect(
        hasActiveDeliverable([
          { id: 1, status: 'approved' },
          { id: 2, status: 'in_progress' },
        ]),
      ).toBe(true)
    })

    it('returns false when no active deliverable exists', () => {
      expect(
        hasActiveDeliverable([
          { id: 1, status: 'approved' },
          { id: 2, status: 'rejected' },
        ]),
      ).toBe(false)
      expect(hasActiveDeliverable([])).toBe(false)
      expect(hasActiveDeliverable()).toBe(false)
    })
  })

  describe('status label mapping', () => {
    it('exposes consistent transition and label maps', () => {
      expect(VALID_TRANSITIONS).toEqual({
        pending: ['assigned', 'cancelled'],
        assigned: ['in_progress', 'cancelled'],
        in_progress: ['in_review', 'cancelled'],
        in_review: ['in_progress', 'rejected', 'completed', 'cancelled'],
        rejected: ['in_progress', 'in_review', 'cancelled'],
        completed: [],
        cancelled: [],
      })

      expect(STATUS_LABELS).toEqual({
        pending: 'Pendiente',
        assigned: 'Asignado',
        in_progress: 'En progreso',
        in_review: 'En revisión',
        rejected: 'Rechazado',
        completed: 'Completado',
        cancelled: 'Cancelado',
      })
    })

    it('returns a label for known statuses and fallback for unknown statuses', () => {
      expect(getStatusLabel('in_review')).toBe('En revisión')
      expect(getStatusLabel('unknown')).toBe('unknown')
    })
  })
})
