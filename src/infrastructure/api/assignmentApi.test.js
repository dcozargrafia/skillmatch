import {
  createAssignment,
  getAssignmentsByProject,
  getMyAssignments,
  getAssignmentById,
  acceptAssignment,
  getAssignmentsByStatus,
} from './assignmentApi.js';

vi.mock('./client.js', () => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
}));

import { get, post, put } from './client.js';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('assignmentApi', () => {
  it('createAssignment llama a POST /assignments con application_id', () => {
    createAssignment('app-1');
    expect(post).toHaveBeenCalledWith('/assignments', { application_id: 'app-1' });
  });

  it('getAssignmentsByProject llama a GET /assignments con project_id como query param', () => {
    getAssignmentsByProject('proj-1');
    expect(get).toHaveBeenCalledWith('/assignments', { params: { project_id: 'proj-1' } });
  });

  it('getMyAssignments llama a GET /assignments/me', () => {
    getMyAssignments();
    expect(get).toHaveBeenCalledWith('/assignments/me');
  });

  it('getAssignmentById llama a GET /assignments/:id', () => {
    getAssignmentById('assign-1');
    expect(get).toHaveBeenCalledWith('/assignments/assign-1');
  });

  it('acceptAssignment llama a PUT /assignments/:id/accept', () => {
    acceptAssignment('assign-1');
    expect(put).toHaveBeenCalledWith('/assignments/assign-1/accept', {});
  });

  it('getAssignmentsByStatus filtra por project_status cuando se pasan statuses', async () => {
    const mockAssignments = [
      { id: 'a1', project_id: 'p1', status: 'active', project_status: 'in_progress' },
      { id: 'a2', project_id: 'p2', status: 'active', project_status: 'completed' },
      { id: 'a3', project_id: 'p3', status: 'active', project_status: 'cancelled' },
      { id: 'a4', project_id: 'p4', status: 'active', project_status: 'in_progress' },
    ];
    get.mockResolvedValue(mockAssignments);
    const result = await getAssignmentsByStatus(['completed', 'cancelled']);
    expect(result).toHaveLength(2);
    expect(result.map((a) => a.id)).toEqual(['a2', 'a3']);
  });

  it('getAssignmentsByStatus devuelve todos si statuses está vacío', async () => {
    const mockAssignments = [
      { id: 'a1', project_id: 'p1', status: 'active', project_status: 'in_progress' },
      { id: 'a2', project_id: 'p2', status: 'active', project_status: 'completed' },
    ];
    get.mockResolvedValue(mockAssignments);
    const result = await getAssignmentsByStatus([]);
    expect(result).toHaveLength(2);
  });
});
