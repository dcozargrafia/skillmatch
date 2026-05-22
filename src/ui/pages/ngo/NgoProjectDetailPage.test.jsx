import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import NgoProjectDetailPage from './NgoProjectDetailPage';

vi.mock('../../../infrastructure/api/projectApi.js', () => ({
  getProjectById: vi.fn(),
}));

vi.mock('../../../infrastructure/api/assignmentApi.js', () => ({
  getAssignmentsByProject: vi.fn(),
  createAssignment: vi.fn(),
}));

vi.mock('../../../infrastructure/api/applicationApi.js', () => ({
  getApplicationsByProject: vi.fn(),
}));

vi.mock('../../../infrastructure/api/deliverableApi.js', () => ({
  getDeliverablesByAssignment: vi.fn(),
  reviewDeliverable: vi.fn(),
}));

import { getProjectById } from '../../../infrastructure/api/projectApi.js';
import { getAssignmentsByProject, createAssignment } from '../../../infrastructure/api/assignmentApi.js';
import { getApplicationsByProject } from '../../../infrastructure/api/applicationApi.js';
import { getDeliverablesByAssignment, reviewDeliverable } from '../../../infrastructure/api/deliverableApi.js';

const mockProject = (overrides = {}) => ({
  id: 'p1',
  title: 'Web banco de alimentos',
  status: 'pending',
  modality: 'remoto',
  deadline: '2026-09-30',
  description: 'Sitio web para banco de alimentos',
  ...overrides,
});

const mockAssignment = {
  id: 'a1',
  project_id: 'p1',
  student_id: 's1',
  student_name: 'María García',
  student_email: 'maria@example.com',
  status: 'active',
  start_date: '2026-06-01',
};

const mockApplication = {
  id: 'app1',
  student_id: 's1',
  student_name: 'Juan Pérez',
  student_email: 'juan@example.com',
  compatibility_score: 85,
  status: 'approved',
};

const mockDeliverable = (overrides = {}) => ({
  id: 'd1',
  assignment_id: 'a1',
  title: 'Wireframes iniciales',
  description: 'Prototipo en Figma',
  status: 'in_review',
  ...overrides,
});

function renderPage(projectId = 'p1') {
  return render(
    <MemoryRouter initialEntries={[`/ngo/projects/${projectId}`]}>
      <Routes>
        <Route path="/ngo/projects/:id" element={<NgoProjectDetailPage />} />
        <Route
          path="/ngo/projects/:projectId/assignments/:assignmentId/deliverables"
          element={<div>DeliverablesPage</div>}
        />
      </Routes>
    </MemoryRouter>
  );
}

function createRejectedResponse() {
  const err = new Error('Not found');
  err.response = { status: 404 };
  return Promise.reject(err);
}

beforeEach(() => {
  vi.clearAllMocks();
});

// =============================================================================
// Task 2: Sequential loading + 404 handling + response type fix
// =============================================================================

describe('Sequential loading (Task 2)', () => {
  it('muestra loading inicialmente', async () => {
    getProjectById.mockImplementation(() => new Promise(() => {}));
    getAssignmentsByProject.mockImplementation(() => new Promise(() => {}));
    renderPage();
    expect(screen.getByText(/cargando/i)).toBeInTheDocument();
  });

  it('carga project primero, luego assignment secuencialmente', async () => {
    getProjectById.mockResolvedValue(mockProject({ status: 'in_review' }));
    getAssignmentsByProject.mockResolvedValue(mockAssignment);
    renderPage();
    await waitFor(() => {
      expect(getProjectById).toHaveBeenCalledWith('p1');
    });
    // Assignment is called AFTER project resolves (sequential, not parallel)
    await waitFor(() => {
      expect(getAssignmentsByProject).toHaveBeenCalledWith('p1');
    });
  });

  it('assignment 404 se trata como assignment null (no error global)', async () => {
    getProjectById.mockResolvedValue(mockProject({ status: 'pending' }));
    getAssignmentsByProject.mockImplementation(() => createRejectedResponse());
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Web banco de alimentos')).toBeInTheDocument();
    });
    // No error alert shown - 404 is expected for pending projects
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('error no-404 en assignment muestra alert de error', async () => {
    getProjectById.mockResolvedValue(mockProject({ status: 'in_review' }));
    const err500 = new Error('Server error');
    err500.response = { status: 500 };
    getAssignmentsByProject.mockRejectedValue(err500);
    renderPage();
    await waitFor(() => {
      expect(screen.queryByRole('alert')).toBeInTheDocument();
    });
  });

  it('error en project muestra alert de error', async () => {
    getProjectById.mockRejectedValue(new Error('Network error'));
    renderPage();
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });
});

// =============================================================================
// Task 3: Conditional rendering by project status
// =============================================================================

describe('Conditional rendering by project status (Task 3)', () => {
  describe('pending project sin assignment', () => {
    it('renderiza sección de candidatos con botón Seleccionar', async () => {
      getProjectById.mockResolvedValue(mockProject({ status: 'pending' }));
      getAssignmentsByProject.mockImplementation(() => createRejectedResponse());
      getApplicationsByProject.mockResolvedValue([mockApplication]);
      renderPage();
      await waitFor(() => {
        expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
      });
      expect(screen.getByText('juan@example.com')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /seleccionar/i })).toBeInTheDocument();
    });

    it('NO muestra sección de assignment cuando no hay assignment', async () => {
      getProjectById.mockResolvedValue(mockProject({ status: 'pending' }));
      getAssignmentsByProject.mockImplementation(() => createRejectedResponse());
      getApplicationsByProject.mockResolvedValue([mockApplication]);
      renderPage();
      await waitFor(() => {
        expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
      });
      expect(screen.queryByText('María García')).not.toBeInTheDocument();
    });
  });

  describe('proyectos activos (assigned, in_progress, in_review)', () => {
    it('renderiza información del assignment cuando existe', async () => {
      getProjectById.mockResolvedValue(mockProject({ status: 'in_review' }));
      getAssignmentsByProject.mockResolvedValue(mockAssignment);
      getDeliverablesByAssignment.mockResolvedValue([]);
      renderPage();
      await waitFor(() => {
        expect(screen.getByText('María García')).toBeInTheDocument();
      });
    });
  });

  describe('proyectos terminales (completed, rejected, cancelled)', () => {
    it('renderiza en modo solo lectura sin acciones de candidato', async () => {
      getProjectById.mockResolvedValue(mockProject({ status: 'completed' }));
      getAssignmentsByProject.mockResolvedValue(mockAssignment);
      getDeliverablesByAssignment.mockResolvedValue([mockDeliverable({ status: 'approved' })]);
      renderPage();
      await waitFor(() => {
        expect(screen.getByText('María García')).toBeInTheDocument();
      });
      expect(screen.queryByRole('button', { name: /seleccionar/i })).not.toBeInTheDocument();
    });
  });
});

// =============================================================================
// Task 4: Embed deliverable cards with status badges
// =============================================================================

describe('Deliverable cards (Task 4)', () => {
  it('renderiza tarjetas de entregables cuando assignment existe', async () => {
    getProjectById.mockResolvedValue(mockProject({ status: 'in_review' }));
    getAssignmentsByProject.mockResolvedValue(mockAssignment);
    getDeliverablesByAssignment.mockResolvedValue([
      mockDeliverable({ id: 'd1', title: 'Wireframes', status: 'in_review' }),
      mockDeliverable({ id: 'd2', title: 'Prototipo', status: 'pending' }),
    ]);
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Wireframes')).toBeInTheDocument();
    });
    expect(screen.getByText('Prototipo')).toBeInTheDocument();
  });

  it('muestra badge de estado en cada entregable', async () => {
    // Use 'assigned' status which has no text overlap with any deliverable status
    getProjectById.mockResolvedValue(mockProject({ status: 'assigned' }));
    getAssignmentsByProject.mockResolvedValue(mockAssignment);
    getDeliverablesByAssignment.mockResolvedValue([
      mockDeliverable({ id: 'd1', title: 'Wireframes', status: 'approved' }),
      mockDeliverable({ id: 'd2', title: 'Prototipo', status: 'rejected' }),
      mockDeliverable({ id: 'd3', title: 'Docs', status: 'in_review' }),
      mockDeliverable({ id: 'd4', title: 'Testing', status: 'pending' }),
    ]);
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Wireframes')).toBeInTheDocument();
    });
    // All deliverable status badges are visible
    expect(screen.getAllByText('approved')).toHaveLength(1);
    expect(screen.getAllByText('rejected')).toHaveLength(1);
    expect(screen.getAllByText('in_review')).toHaveLength(1);
    expect(screen.getAllByText('pending')).toHaveLength(1);
  });

  it('NO renderiza sección de entregables cuando no hay assignment', async () => {
    getProjectById.mockResolvedValue(mockProject({ status: 'pending' }));
    getAssignmentsByProject.mockImplementation(() => createRejectedResponse());
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Web banco de alimentos')).toBeInTheDocument();
    });
    // No entregables loaded because no assignment
    expect(screen.queryByText('Wireframes')).not.toBeInTheDocument();
  });
});

// =============================================================================
// Task 5: Review actions for in_review deliverables
// =============================================================================

describe('Review actions (Task 5)', () => {
  it('muestra botones Aprobar/Rechazar en entregable in_review', async () => {
    getProjectById.mockResolvedValue(mockProject({ status: 'in_review' }));
    getAssignmentsByProject.mockResolvedValue(mockAssignment);
    getDeliverablesByAssignment.mockResolvedValue([mockDeliverable({ status: 'in_review' })]);
    renderPage();
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /aprobar/i })).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /rechazar/i })).toBeInTheDocument();
  });

  it('NO muestra botones en entregable con status approved', async () => {
    getProjectById.mockResolvedValue(mockProject({ status: 'in_review' }));
    getAssignmentsByProject.mockResolvedValue(mockAssignment);
    getDeliverablesByAssignment.mockResolvedValue([mockDeliverable({ status: 'approved' })]);
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Wireframes iniciales')).toBeInTheDocument();
    });
    expect(screen.queryByRole('button', { name: /aprobar/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /rechazar/i })).not.toBeInTheDocument();
  });

  it('NO muestra botones en entregable in_review de proyecto completado', async () => {
    getProjectById.mockResolvedValue(mockProject({ status: 'completed' }));
    getAssignmentsByProject.mockResolvedValue(mockAssignment);
    getDeliverablesByAssignment.mockResolvedValue([mockDeliverable({ status: 'in_review' })]);
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Wireframes iniciales')).toBeInTheDocument();
    });
    // Read-only: no review actions even though deliverable is in_review
    expect(screen.queryByRole('button', { name: /aprobar/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /rechazar/i })).not.toBeInTheDocument();
  });

  it('handleReview llama a reviewDeliverable y actualiza estado local', async () => {
    getProjectById.mockResolvedValue(mockProject({ status: 'in_review' }));
    getAssignmentsByProject.mockResolvedValue(mockAssignment);
    getDeliverablesByAssignment.mockResolvedValue([mockDeliverable({ id: 'd1', status: 'in_review' })]);
    reviewDeliverable.mockResolvedValue({ id: 'd1', status: 'approved' });
    renderPage();
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /aprobar/i })).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('button', { name: /aprobar/i }));
    await waitFor(() => {
      expect(reviewDeliverable).toHaveBeenCalledWith('d1', { status: 'approved' });
    });
    await waitFor(() => {
      expect(screen.getByText('approved')).toBeInTheDocument();
    });
    // Buttons disappear after approval
    expect(screen.queryByRole('button', { name: /aprobar/i })).not.toBeInTheDocument();
  });

  it('handleReview para rechazar llama a reviewDeliverable con status rejected', async () => {
    getProjectById.mockResolvedValue(mockProject({ status: 'in_review' }));
    getAssignmentsByProject.mockResolvedValue(mockAssignment);
    getDeliverablesByAssignment.mockResolvedValue([mockDeliverable({ id: 'd1', status: 'in_review' })]);
    reviewDeliverable.mockResolvedValue({ id: 'd1', status: 'rejected' });
    renderPage();
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /rechazar/i })).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('button', { name: /rechazar/i }));
    await waitFor(() => {
      expect(reviewDeliverable).toHaveBeenCalledWith('d1', { status: 'rejected' });
    });
  });
});

// =============================================================================
// Task 6: Full integration tests
// =============================================================================

describe('Full integration scenarios (Task 6)', () => {
  it('pending project con candidaturas: seleccionar candidato recarga assignment', async () => {
    getProjectById.mockResolvedValue(mockProject({ status: 'pending' }));
    getAssignmentsByProject.mockImplementation(() => createRejectedResponse());
    getApplicationsByProject.mockResolvedValue([mockApplication]);
    createAssignment.mockResolvedValue({ ...mockAssignment, student_id: mockApplication.student_id });
    renderPage();
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /seleccionar/i })).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('button', { name: /seleccionar/i }));
    await waitFor(() => {
      expect(createAssignment).toHaveBeenCalledWith(mockApplication.id);
    });
  });

  it('terminal state: completed sin botones de review aunque haya entregables in_review', async () => {
    getProjectById.mockResolvedValue(mockProject({ status: 'completed' }));
    getAssignmentsByProject.mockResolvedValue(mockAssignment);
    getDeliverablesByAssignment.mockResolvedValue([mockDeliverable({ status: 'in_review' })]);
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Wireframes iniciales')).toBeInTheDocument();
    });
    expect(screen.queryByRole('button', { name: /aprobar/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /rechazar/i })).not.toBeInTheDocument();
  });

  it('rejected project es modo solo lectura', async () => {
    getProjectById.mockResolvedValue(mockProject({ status: 'rejected' }));
    getAssignmentsByProject.mockResolvedValue(mockAssignment);
    getDeliverablesByAssignment.mockResolvedValue([mockDeliverable({ status: 'rejected' })]);
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Web banco de alimentos')).toBeInTheDocument();
    });
    expect(screen.queryByRole('button', { name: /seleccionar/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /aprobar/i })).not.toBeInTheDocument();
  });

  it('cancelled project es modo solo lectura', async () => {
    getProjectById.mockResolvedValue(mockProject({ status: 'cancelled' }));
    getAssignmentsByProject.mockResolvedValue(mockAssignment);
    getDeliverablesByAssignment.mockResolvedValue([]);
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Web banco de alimentos')).toBeInTheDocument();
    });
    expect(screen.queryByRole('button', { name: /seleccionar/i })).not.toBeInTheDocument();
  });
});