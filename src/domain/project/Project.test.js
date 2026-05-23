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
  sortDeliverables,
  validateProject,
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

  describe('sortDeliverables', () => {
    it('places active deliverables before approved/rejected ones', () => {
      const deliverables = [
        { id: 1, status: 'approved', created_at: '2025-01-01' },
        { id: 2, status: 'pending', created_at: '2025-01-02' },
        { id: 3, status: 'in_progress', created_at: '2025-01-03' },
        { id: 4, status: 'in_review', created_at: '2025-01-04' },
        { id: 5, status: 'rejected', created_at: '2025-01-05' },
      ]
      const sorted = sortDeliverables(deliverables)
      const statuses = sorted.map((d) => d.status)
      expect(statuses).toEqual(['in_review', 'in_progress', 'pending', 'rejected', 'approved'])
    })

    it('sorts same-status items by created_at descending (newest first)', () => {
      const deliverables = [
        { id: 1, status: 'pending', created_at: '2025-01-01' },
        { id: 2, status: 'pending', created_at: '2025-01-03' },
        { id: 3, status: 'pending', created_at: '2025-01-02' },
      ]
      const sorted = sortDeliverables(deliverables)
      expect(sorted.map((d) => d.id)).toEqual([2, 3, 1])
    })

    it('returns an empty array for undefined or empty input', () => {
      expect(sortDeliverables(undefined)).toEqual([])
      expect(sortDeliverables([])).toEqual([])
    })
  })

  describe('validateProject', () => {
    it('valid payload returns trimmed values + empty errors', () => {
      const input = {
        title: '  My Project  ',
        description: '  A description  ',
        objectives: '  Goals here  ',
        estimated_hours: 10,
        deadline: '2026-06-01',
        modality: '  online  ',
      }
      const result = validateProject(input)
      expect(result.errors).toEqual({})
      expect(result.values.title).toBe('My Project')
      expect(result.values.description).toBe('A description')
      expect(result.values.objectives).toBe('Goals here')
      expect(result.values.estimated_hours).toBe(10)
      expect(result.values.deadline).toBe('2026-06-01')
      expect(result.values.modality).toBe('online')
    })

    it('blank/empty title returns errors.title = "El título es obligatorio."', () => {
      const result = validateProject({ title: '' })
      expect(result.errors.title).toBe('El título es obligatorio.')
    })

    it('whitespace-only title triggers error', () => {
      const result = validateProject({ title: '   ' })
      expect(result.errors.title).toBe('El título es obligatorio.')
    })

    it('omitted optional fields succeed with no errors', () => {
      const result = validateProject({ title: 'Valid Title' })
      expect(result.errors).toEqual({})
      expect(result.values.title).toBe('Valid Title')
      expect(result.values.description).toBeUndefined()
      expect(result.values.objectives).toBeUndefined()
      expect(result.values.estimated_hours).toBeUndefined()
      expect(result.values.deadline).toBeUndefined()
      expect(result.values.modality).toBeUndefined()
    })

    it('string fields are trimmed, non-string optionals pass through unchanged', () => {
      const input = {
        title: '  Title  ',
        description: '  Desc  ',
        objectives: '  Obj  ',
        estimated_hours: null,
        deadline: null,
        modality: '  remote  ',
      }
      const result = validateProject(input)
      expect(result.values.title).toBe('Title')
      expect(result.values.description).toBe('Desc')
      expect(result.values.objectives).toBe('Obj')
      expect(result.values.estimated_hours).toBe(null)
      expect(result.values.deadline).toBe(null)
      expect(result.values.modality).toBe('remote')
    })
  })
})
