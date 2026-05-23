import {
  VALID_TRANSITIONS,
  STATUS_LABELS,
  getNextStatuses,
  isTerminalStatus,
  hasActiveDeliverable,
  getStatusLabel,
  canCompleteProject,
  canCreateDeliverable,
  DELIVERABLE_STATUS_LABELS,
  getDeliverableStatusLabel,
  getProjectStatusMessage,
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

  describe('canCompleteProject', () => {
    it('returns true when status is in_review and all deliverables are approved', () => {
      const project = { id: 1, status: 'in_review' }
      const deliverables = [
        { id: 1, status: 'approved' },
        { id: 2, status: 'approved' },
      ]
      expect(canCompleteProject(project, deliverables)).toBe(true)
    })

    it('returns false when status is not in_review', () => {
      const project = { id: 1, status: 'in_progress' }
      const deliverables = [{ id: 1, status: 'approved' }]
      expect(canCompleteProject(project, deliverables)).toBe(false)
    })

    it('returns false when any deliverable is not approved', () => {
      const project = { id: 1, status: 'in_review' }
      const deliverables = [
        { id: 1, status: 'approved' },
        { id: 2, status: 'in_progress' },
      ]
      expect(canCompleteProject(project, deliverables)).toBe(false)
    })

    it('returns false when deliverables array is empty', () => {
      const project = { id: 1, status: 'in_review' }
      expect(canCompleteProject(project, [])).toBe(false)
    })
  })

  describe('canCreateDeliverable', () => {
    it('returns true when project has assignment, is non-terminal, and no active deliverable', () => {
      const project = { id: 1, assignment_id: 5, status: 'in_progress' }
      const deliverables = [{ id: 1, status: 'approved' }]
      expect(canCreateDeliverable(project, deliverables)).toBe(true)
    })

    it('returns false when project has no assignment', () => {
      const project = { id: 1, assignment_id: null, status: 'in_progress' }
      const deliverables = []
      expect(canCreateDeliverable(project, deliverables)).toBe(false)
    })

    it('returns false when project status is terminal', () => {
      const project = { id: 1, assignment_id: 5, status: 'completed' }
      const deliverables = []
      expect(canCreateDeliverable(project, deliverables)).toBe(false)
    })

    it('returns false when there is already an active deliverable', () => {
      const project = { id: 1, assignment_id: 5, status: 'in_progress' }
      const deliverables = [{ id: 1, status: 'pending' }]
      expect(canCreateDeliverable(project, deliverables)).toBe(false)
    })

    it('returns false when there is an in_progress deliverable', () => {
      const project = { id: 1, assignment_id: 5, status: 'in_progress' }
      const deliverables = [{ id: 1, status: 'in_progress' }]
      expect(canCreateDeliverable(project, deliverables)).toBe(false)
    })
  })

  describe('DELIVERABLE_STATUS_LABELS', () => {
    it('exposes mapping for all five deliverable statuses', () => {
      expect(DELIVERABLE_STATUS_LABELS).toEqual({
        pending: 'Pendiente',
        in_progress: 'En progreso',
        in_review: 'En revisión',
        approved: 'Aprobado',
        rejected: 'Rechazado',
      })
    })
  })

  describe('getDeliverableStatusLabel', () => {
    it('returns Spanish label for known deliverable statuses', () => {
      expect(getDeliverableStatusLabel('pending')).toBe('Pendiente')
      expect(getDeliverableStatusLabel('in_progress')).toBe('En progreso')
      expect(getDeliverableStatusLabel('in_review')).toBe('En revisión')
      expect(getDeliverableStatusLabel('approved')).toBe('Aprobado')
      expect(getDeliverableStatusLabel('rejected')).toBe('Rechazado')
    })

    it('returns the raw status value for unknown statuses', () => {
      expect(getDeliverableStatusLabel('unknown_status')).toBe('unknown_status')
    })
  })

  describe('getProjectStatusMessage', () => {
    it('returns NGO-waiting copy when status is in_review and a deliverable is not approved', () => {
      const message = getProjectStatusMessage('in_review', [
        { id: 1, status: 'approved' },
        { id: 2, status: 'in_review' },
      ])
      expect(message).toBe('Esperando que la ONG apruebe o rechace el último entregable.')
    })

    it('returns completion-or-new copy when status is in_review and all deliverables are approved', () => {
      const message = getProjectStatusMessage('in_review', [
        { id: 1, status: 'approved' },
        { id: 2, status: 'approved' },
      ])
      expect(message).toBe(
        'Esperando que la ONG marque el proyecto como completado o cree otro entregable.',
      )
    })

    it('returns null for non-in_review statuses', () => {
      expect(getProjectStatusMessage('pending', [])).toBeNull()
      expect(getProjectStatusMessage('assigned', [])).toBeNull()
      expect(getProjectStatusMessage('in_progress', [])).toBeNull()
      expect(getProjectStatusMessage('completed', [])).toBeNull()
      expect(getProjectStatusMessage('rejected', [])).toBeNull()
      expect(getProjectStatusMessage('cancelled', [])).toBeNull()
    })
  })
})
