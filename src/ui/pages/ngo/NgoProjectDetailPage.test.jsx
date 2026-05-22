import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import NgoProjectDetailPage from './NgoProjectDetailPage';

vi.mock('../../../infrastructure/api/projectApi.js', () => ({
  getProjectById: vi.fn(),
  updateProjectStatus: vi.fn(),
  cancelProject: vi.fn(),
}));

vi.mock('../../../infrastructure/api/assignmentApi.js', () => ({
  getAssignmentsByProject: vi.fn(),
  createAssignment: vi.fn(),
}));

vi.mock('../../../infrastructure/api/applicationApi.js', () => ({
  getApplicationsByProject: vi.fn(),
}));

vi.mock('../../../infrastructure/api/deliverableApi.js', () => ({
  createDeliverable: vi.fn(),
  getDeliverablesByAssignment: vi.fn(),
  reviewDeliverable: vi.fn(),
}));

import { getProjectById, updateProjectStatus, cancelProject } from '../../../infrastructure/api/projectApi.js';
import { getAssignmentsByProject, createAssignment } from '../../../infrastructure/api/assignmentApi.js';
import { getApplicationsByProject } from '../../../infrastructure/api/applicationApi.js';
import {
  createDeliverable,
  getDeliverablesByAssignment,
  reviewDeliverable,
} from '../../../infrastructure/api/deliverableApi.js';

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
  vi.resetAllMocks();
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

  it('handleReview aprueba y re-sincroniza proyecto/asignación/entregables', async () => {
    getProjectById.mockResolvedValue(mockProject({ status: 'in_review' }));
    getAssignmentsByProject.mockResolvedValue(mockAssignment);
    getDeliverablesByAssignment
      .mockResolvedValueOnce([mockDeliverable({ id: 'd1', status: 'in_review' })])
      .mockResolvedValue([mockDeliverable({ id: 'd1', status: 'approved' })]);
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
      expect(getProjectById).toHaveBeenCalledTimes(2);
    });
    await waitFor(() => {
      expect(getAssignmentsByProject).toHaveBeenCalledTimes(2);
    });
    await waitFor(() => {
      expect(getDeliverablesByAssignment).toHaveBeenCalledTimes(2);
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
    await waitFor(() => {
      expect(getProjectById).toHaveBeenCalledTimes(2);
    });
    await waitFor(() => {
      expect(getDeliverablesByAssignment).toHaveBeenCalledTimes(2);
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

describe('NGO status and deliverable controls (Slice 2)', () => {
  it('muestra acción explícita para completar proyecto cuando entregables están aprobados en revisión', async () => {
    getProjectById.mockResolvedValue(mockProject({ status: 'in_review' }));
    getAssignmentsByProject.mockResolvedValue(mockAssignment);
    getDeliverablesByAssignment.mockResolvedValue([
      mockDeliverable({ id: 'd1', status: 'approved' }),
      mockDeliverable({ id: 'd2', status: 'approved' }),
    ]);

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('María García')).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /marcar como completado/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /iniciar proyecto/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /enviar a revisión/i })).not.toBeInTheDocument();
  });

  it('oculta acción de completar si no todos los entregables están aprobados', async () => {
    getProjectById.mockResolvedValue(mockProject({ status: 'in_review' }));
    getAssignmentsByProject.mockResolvedValue(mockAssignment);
    getDeliverablesByAssignment.mockResolvedValue([
      mockDeliverable({ id: 'd1', status: 'approved' }),
      mockDeliverable({ id: 'd2', status: 'in_review' }),
    ]);

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('María García')).toBeInTheDocument();
    });

    expect(screen.queryByRole('button', { name: /marcar como completado/i })).not.toBeInTheDocument();
  });

  it('marca proyecto como completado y re-sincroniza estado', async () => {
    getProjectById
      .mockResolvedValueOnce(mockProject({ status: 'in_review' }))
      .mockResolvedValueOnce(mockProject({ status: 'completed' }));
    getAssignmentsByProject.mockResolvedValue(mockAssignment);
    getDeliverablesByAssignment.mockResolvedValue([mockDeliverable({ status: 'approved' })]);
    updateProjectStatus.mockResolvedValue({});

    renderPage();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /marcar como completado/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /marcar como completado/i }));

    await waitFor(() => {
      expect(updateProjectStatus).toHaveBeenCalledWith('p1', 'completed');
    });
    await waitFor(() => {
      expect(getProjectById).toHaveBeenCalledTimes(2);
    });
    await waitFor(() => {
      expect(screen.getByText('completed')).toBeInTheDocument();
    });
  });

  it('muestra formulario de entregable cuando assignment existe y no hay entregable activo', async () => {
    getProjectById.mockResolvedValue(mockProject({ status: 'in_progress' }));
    getAssignmentsByProject.mockResolvedValue(mockAssignment);
    getDeliverablesByAssignment.mockResolvedValue([mockDeliverable({ status: 'approved' })]);

    renderPage();

    await waitFor(() => {
      expect(screen.getByLabelText(/título del entregable/i)).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /crear entregable/i })).toBeInTheDocument();
  });

  it('oculta formulario cuando existe entregable activo', async () => {
    getProjectById.mockResolvedValue(mockProject({ status: 'in_progress' }));
    getAssignmentsByProject.mockResolvedValue(mockAssignment);
    getDeliverablesByAssignment.mockResolvedValue([mockDeliverable({ status: 'in_review' })]);

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Wireframes iniciales')).toBeInTheDocument();
    });
    expect(screen.queryByLabelText(/título del entregable/i)).not.toBeInTheDocument();
  });

  it('oculta formulario y acciones de estado en estado terminal', async () => {
    getProjectById.mockResolvedValue(mockProject({ status: 'completed' }));
    getAssignmentsByProject.mockResolvedValue(mockAssignment);
    getDeliverablesByAssignment.mockResolvedValue([mockDeliverable({ status: 'approved' })]);

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('María García')).toBeInTheDocument();
    });
    expect(screen.queryByLabelText(/título del entregable/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /enviar a revisión/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /cancelar proyecto/i })).not.toBeInTheDocument();
  });

  it('oculta acciones de transición de proyecto en el header para NGO', async () => {
    getProjectById.mockResolvedValue(mockProject({ status: 'assigned' }));
    getAssignmentsByProject.mockResolvedValue(mockAssignment);
    getDeliverablesByAssignment.mockResolvedValue([]);

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Web banco de alimentos')).toBeInTheDocument();
    });

    expect(screen.queryByRole('button', { name: /iniciar proyecto/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /enviar a revisión/i })).not.toBeInTheDocument();
  });

  it('pide confirmación para cancelar y cancela al confirmar', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    getProjectById
      .mockResolvedValueOnce(mockProject({ status: 'in_progress' }))
      .mockResolvedValueOnce(mockProject({ status: 'cancelled' }));
    getAssignmentsByProject.mockResolvedValue(mockAssignment);
    getDeliverablesByAssignment.mockResolvedValue([]);
    cancelProject.mockResolvedValue({});

    renderPage();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /cancelar proyecto/i })).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('button', { name: /cancelar proyecto/i }));

    await waitFor(() => {
      expect(confirmSpy).toHaveBeenCalled();
    });
    await waitFor(() => {
      expect(cancelProject).toHaveBeenCalledWith('p1');
    });

    confirmSpy.mockRestore();
  });

  it('crea entregable y recarga proyecto/asignación/entregables', async () => {
    getProjectById
      .mockResolvedValueOnce(mockProject({ status: 'in_progress' }))
      .mockResolvedValueOnce(mockProject({ status: 'in_review' }));
    getAssignmentsByProject.mockResolvedValue(mockAssignment);
    getDeliverablesByAssignment
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([mockDeliverable({ id: 'd2', title: 'Backend API', status: 'pending' })]);
    createDeliverable.mockResolvedValue({ id: 'd2' });

    renderPage();

    await waitFor(() => {
      expect(screen.getByLabelText(/título del entregable/i)).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/título del entregable/i), {
      target: { value: 'Backend API' },
    });
    fireEvent.change(screen.getByLabelText(/descripción del entregable/i), {
      target: { value: 'Implementar endpoints' },
    });
    fireEvent.click(screen.getByRole('button', { name: /crear entregable/i }));

    await waitFor(() => {
      expect(createDeliverable).toHaveBeenCalledWith({
        assignment_id: 'a1',
        title: 'Backend API',
        description: 'Implementar endpoints',
      });
    });
    await waitFor(() => {
      expect(getProjectById).toHaveBeenCalledTimes(2);
    });
    await waitFor(() => {
      expect(screen.getByText('Backend API')).toBeInTheDocument();
    });
  });

  it('oculta acciones de transición de proyecto también en in_progress', async () => {
    getProjectById.mockResolvedValue(mockProject({ status: 'in_progress' }));
    getAssignmentsByProject.mockResolvedValue(mockAssignment);
    getDeliverablesByAssignment.mockResolvedValue([]);

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Web banco de alimentos')).toBeInTheDocument();
    });

    expect(screen.queryByRole('button', { name: /iniciar proyecto/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /enviar a revisión/i })).not.toBeInTheDocument();
  });
});
