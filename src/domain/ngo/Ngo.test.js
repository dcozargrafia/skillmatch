import { validateNgoProfile, canEditProject, canCancelProject } from './Ngo'

describe('Ngo domain', () => {
  describe('validateNgoProfile', () => {
    it('returns trimmed values and no errors for valid input', () => {
      const result = validateNgoProfile({
        name: '  María García  ',
        email: '  maria@ong.org  ',
        organizationName: '  ONG Solidaria  ',
        area: '  Education  ',
      })

      expect(result.values).toEqual({
        name: 'María García',
        email: 'maria@ong.org',
        organizationName: 'ONG Solidaria',
        area: 'Education',
      })
      expect(result.errors).toEqual({})
    })

    it('returns errors for missing required fields', () => {
      const result = validateNgoProfile({
        name: '',
        email: '',
        organizationName: '',
        area: '',
      })

      expect(result.values).toEqual({
        name: '',
        email: '',
        organizationName: '',
        area: '',
      })
      expect(result.errors).toHaveProperty('name')
      expect(result.errors).toHaveProperty('email')
      expect(result.errors).toHaveProperty('organizationName')
      expect(result.errors).toHaveProperty('area')
    })

    it('returns error for invalid email format', () => {
      const result = validateNgoProfile({
        name: 'María',
        email: 'not-an-email',
        organizationName: 'ONG',
        area: 'Education',
      })

      expect(result.errors).toHaveProperty('email')
    })

    it('returns error for name that is only whitespace after trim', () => {
      const result = validateNgoProfile({
        name: '   ',
        email: 'maria@ong.org',
        organizationName: 'ONG',
        area: 'Education',
      })

      expect(result.errors).toHaveProperty('name')
    })
  })

  describe('canEditProject', () => {
    it('returns true when NGO owns the project and status is non-terminal', () => {
      const project = { id: 1, ngo_user_id: 10, status: 'in_progress' }
      expect(canEditProject(project, 10)).toBe(true)
    })

    it('returns false when NGO does not own the project', () => {
      const project = { id: 1, ngo_user_id: 10, status: 'in_progress' }
      expect(canEditProject(project, 99)).toBe(false)
    })

    it('returns false when project status is terminal', () => {
      const project = { id: 1, ngo_user_id: 10, status: 'completed' }
      expect(canEditProject(project, 10)).toBe(false)
    })

    it('returns false when NGO owns but status is cancelled', () => {
      const project = { id: 1, ngo_user_id: 10, status: 'cancelled' }
      expect(canEditProject(project, 10)).toBe(false)
    })
  })

  describe('canCancelProject', () => {
    it('returns true for non-terminal status', () => {
      expect(canCancelProject('in_progress')).toBe(true)
      expect(canCancelProject('pending')).toBe(true)
      expect(canCancelProject('in_review')).toBe(true)
    })

    it('returns false for completed status', () => {
      expect(canCancelProject('completed')).toBe(false)
    })

    it('returns false for cancelled status', () => {
      expect(canCancelProject('cancelled')).toBe(false)
    })
  })
})