import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import NgoProjectDetailPage from './NgoProjectDetailPage';

// Mock the hook instead of infrastructure APIs
vi.mock('../../../ui/hooks/useProjectDetail.jsx', () => ({
  default: vi.fn(),
}));

import useProjectDetail from '../../../ui/hooks/useProjectDetail.jsx';

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

function setupHookMock(overrides = {}) {
  const defaults = {
    project: null,
    assignment: null,
    deliverables: [],
    applications: [],
    loading: true,
    error: null,
    actions: {
      handleReview: vi.fn(),
      handleCreateDeliverable: vi.fn(),
      handleSelectCandidate: vi.fn(),
      handleCancelProject: vi.fn(),
      handleMarkCompleted: vi.fn(),
    },
    ...overrides,
  };
  useProjectDetail.mockReturnValue(defaults);
}

function renderPage(projectId = 'p1') {
  return render(
    <MemoryRouter initialEntries={[`/ngo/projects/${projectId}`]}>
      <Routes>
        <Route path="/ngo/projects/:id" element={<NgoProjectDetailPage />} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.resetAllMocks();
  setupHookMock();
});

describe('NgoProjectDetailPage — useProjectDetail hook integration', () => {
  it('muestra loading cuando hook está cargando', () => {
    setupHookMock({ loading: true, project: null });
    renderPage();
    expect(screen.getByText(/cargando/i)).toBeInTheDocument();
  });

  it('muestra alert de error cuando hook reporta error sin proyecto', () => {
    setupHookMock({ loading: false, error: 'Error al cargar el proyecto.', project: null });
    renderPage();
    expect(screen.getByRole('alert')).toHaveTextContent('Error al cargar el proyecto.');
  });

  it('muestra alert si hay error aunque el proyecto ya cargó', async () => {
    setupHookMock({ loading: false, error: 'Algo salió mal', project: mockProject() });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Web banco de alimentos')).toBeInTheDocument();
    });
    expect(screen.getByRole('alert')).toHaveTextContent('Algo salió mal');
  });

  it('renderiza título y badges del proyecto', async () => {
    setupHookMock({ loading: false, project: mockProject() });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Web banco de alimentos')).toBeInTheDocument();
    });
    expect(screen.getByText('remoto')).toBeInTheDocument();
    expect(screen.getByText('Pendiente')).toBeInTheDocument();
  });

  it('renderiza sección de candidatos cuando status=pending y no hay assignment', async () => {
    setupHookMock({
      loading: false,
      project: mockProject({ status: 'pending' }),
      assignment: null,
      applications: [mockApplication],
    });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    });
    expect(screen.getByText('juan@example.com')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /seleccionar/i })).toBeInTheDocument();
  });

  it('NO muestra sección de assignment cuando assignment es null', async () => {
    setupHookMock({
      loading: false,
      project: mockProject({ status: 'pending' }),
      assignment: null,
      applications: [mockApplication],
    });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    });
    expect(screen.queryByText('María García')).not.toBeInTheDocument();
  });

  it('renderiza información del assignment cuando existe', async () => {
    setupHookMock({
      loading: false,
      project: mockProject({ status: 'in_review' }),
      assignment: mockAssignment,
      deliverables: [],
    });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('María García')).toBeInTheDocument();
    });
    expect(screen.getByText('maria@example.com')).toBeInTheDocument();
  });

  it('renderiza tarjetas de entregables', async () => {
    setupHookMock({
      loading: false,
      project: mockProject({ status: 'in_review' }),
      assignment: mockAssignment,
      deliverables: [
        mockDeliverable({ id: 'd1', title: 'Wireframes', status: 'in_review' }),
        mockDeliverable({ id: 'd2', title: 'Prototipo', status: 'pending' }),
      ],
    });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Wireframes')).toBeInTheDocument();
    });
    expect(screen.getByText('Prototipo')).toBeInTheDocument();
  });

  it('muestra badges de estado en entregables', async () => {
    setupHookMock({
      loading: false,
      project: mockProject({ status: 'in_review' }),
      assignment: mockAssignment,
      deliverables: [
        mockDeliverable({ id: 'd1', title: 'Wireframes', status: 'approved' }),
        mockDeliverable({ id: 'd2', title: 'Prototipo', status: 'rejected' }),
        mockDeliverable({ id: 'd3', title: 'Docs', status: 'in_review' }),
        mockDeliverable({ id: 'd4', title: 'Testing', status: 'pending' }),
      ],
    });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Wireframes')).toBeInTheDocument();
    });
    // Mock DeliverableCard renders [status], check Spanish labels in mock output
    expect(screen.getAllByText('Aprobado')).toHaveLength(1);
    expect(screen.getAllByText('Rechazado')).toHaveLength(1);
    expect(screen.getAllByText('En revisión')).toHaveLength(2);
    expect(screen.getAllByText('Pendiente')).toHaveLength(1);
  });

  it('muestra botones Aprobar/Rechazar en entregable in_review', async () => {
    const handleReview = vi.fn();
    setupHookMock({
      loading: false,
      project: mockProject({ status: 'in_review' }),
      assignment: mockAssignment,
      deliverables: [mockDeliverable({ status: 'in_review' })],
      actions: { handleReview, handleCreateDeliverable: vi.fn(), handleSelectCandidate: vi.fn(), handleCancelProject: vi.fn(), handleMarkCompleted: vi.fn() },
    });
    renderPage();
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /aprobar/i })).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /rechazar/i })).toBeInTheDocument();
  });

  it('NO muestra botones en entregable approved', async () => {
    setupHookMock({
      loading: false,
      project: mockProject({ status: 'in_review' }),
      assignment: mockAssignment,
      deliverables: [mockDeliverable({ title: 'Wireframes', status: 'approved' })],
    });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Wireframes')).toBeInTheDocument();
    });
    expect(screen.queryByRole('button', { name: /aprobar/i })).not.toBeInTheDocument();
  });

  it('NO muestra botones en entregable in_review de proyecto completed (terminal)', async () => {
    setupHookMock({
      loading: false,
      project: mockProject({ status: 'completed' }),
      assignment: mockAssignment,
      deliverables: [mockDeliverable({ status: 'in_review' })],
    });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Wireframes iniciales')).toBeInTheDocument();
    });
    expect(screen.queryByRole('button', { name: /aprobar/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /rechazar/i })).not.toBeInTheDocument();
  });

  it('handleReview llama a actions.handleReview del hook', async () => {
    const handleReview = vi.fn();
    setupHookMock({
      loading: false,
      project: mockProject({ status: 'in_review' }),
      assignment: mockAssignment,
      deliverables: [mockDeliverable({ status: 'in_review' })],
      actions: { handleReview, handleCreateDeliverable: vi.fn(), handleSelectCandidate: vi.fn(), handleCancelProject: vi.fn(), handleMarkCompleted: vi.fn() },
    });
    renderPage();
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /aprobar/i })).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('button', { name: /aprobar/i }));
    await waitFor(() => {
      expect(handleReview).toHaveBeenCalledWith('d1', 'approved');
    });
  });

  it('handleReview para rechazar llama con status rejected', async () => {
    const handleReview = vi.fn();
    setupHookMock({
      loading: false,
      project: mockProject({ status: 'in_review' }),
      assignment: mockAssignment,
      deliverables: [mockDeliverable({ status: 'in_review' })],
      actions: { handleReview, handleCreateDeliverable: vi.fn(), handleSelectCandidate: vi.fn(), handleCancelProject: vi.fn(), handleMarkCompleted: vi.fn() },
    });
    renderPage();
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /rechazar/i })).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('button', { name: /rechazar/i }));
    await waitFor(() => {
      expect(handleReview).toHaveBeenCalledWith('d1', 'rejected');
    });
  });

  it('seleccionar candidato llama a actions.handleSelectCandidate', async () => {
    const handleSelectCandidate = vi.fn();
    setupHookMock({
      loading: false,
      project: mockProject({ status: 'pending' }),
      assignment: null,
      applications: [mockApplication],
      actions: { handleReview: vi.fn(), handleCreateDeliverable: vi.fn(), handleSelectCandidate, handleCancelProject: vi.fn(), handleMarkCompleted: vi.fn() },
    });
    renderPage();
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /seleccionar/i })).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('button', { name: /seleccionar/i }));
    await waitFor(() => {
      expect(handleSelectCandidate).toHaveBeenCalledWith('app1');
    });
  });

  it('muestra botón Marcar como completado cuando conditions se cumplen', async () => {
    const handleMarkCompleted = vi.fn();
    setupHookMock({
      loading: false,
      project: mockProject({ status: 'in_review' }),
      assignment: mockAssignment,
      deliverables: [
        mockDeliverable({ id: 'd1', status: 'approved' }),
        mockDeliverable({ id: 'd2', status: 'approved' }),
      ],
      actions: { handleReview: vi.fn(), handleCreateDeliverable: vi.fn(), handleSelectCandidate: vi.fn(), handleCancelProject: vi.fn(), handleMarkCompleted },
    });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('María García')).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /marcar como completado/i })).toBeInTheDocument();
  });

  it('NO muestra botón completar si hay entregables no aprobados', async () => {
    setupHookMock({
      loading: false,
      project: mockProject({ status: 'in_review' }),
      assignment: mockAssignment,
      deliverables: [
        mockDeliverable({ id: 'd1', status: 'approved' }),
        mockDeliverable({ id: 'd2', status: 'in_review' }),
      ],
    });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('María García')).toBeInTheDocument();
    });
    expect(screen.queryByRole('button', { name: /marcar como completado/i })).not.toBeInTheDocument();
  });

  it('marcar completado llama a actions.handleMarkCompleted', async () => {
    const handleMarkCompleted = vi.fn();
    setupHookMock({
      loading: false,
      project: mockProject({ status: 'in_review' }),
      assignment: mockAssignment,
      deliverables: [mockDeliverable({ status: 'approved' })],
      actions: { handleReview: vi.fn(), handleCreateDeliverable: vi.fn(), handleSelectCandidate: vi.fn(), handleCancelProject: vi.fn(), handleMarkCompleted },
    });
    renderPage();
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /marcar como completado/i })).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('button', { name: /marcar como completado/i }));
    await waitFor(() => {
      expect(handleMarkCompleted).toHaveBeenCalled();
    });
  });

  it('muestra formulario de entregable cuando assignment existe y no hay entregable activo', async () => {
    setupHookMock({
      loading: false,
      project: mockProject({ status: 'in_progress' }),
      assignment: mockAssignment,
      deliverables: [mockDeliverable({ status: 'approved' })],
    });
    renderPage();
    await waitFor(() => {
      expect(screen.getByLabelText(/título del entregable/i)).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /crear entregable/i })).toBeInTheDocument();
  });

  it('oculta formulario cuando existe entregable activo (in_review)', async () => {
    setupHookMock({
      loading: false,
      project: mockProject({ status: 'in_progress' }),
      assignment: mockAssignment,
      deliverables: [mockDeliverable({ status: 'in_review' })],
    });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Wireframes iniciales')).toBeInTheDocument();
    });
    expect(screen.queryByLabelText(/título del entregable/i)).not.toBeInTheDocument();
  });

  it('crear entregable llama a actions.handleCreateDeliverable con datos del formulario', async () => {
    const handleCreateDeliverable = vi.fn().mockResolvedValue(true);
    setupHookMock({
      loading: false,
      project: mockProject({ status: 'in_progress' }),
      assignment: mockAssignment,
      deliverables: [mockDeliverable({ status: 'approved' })],
      actions: { handleReview: vi.fn(), handleCreateDeliverable, handleSelectCandidate: vi.fn(), handleCancelProject: vi.fn(), handleMarkCompleted: vi.fn() },
    });
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
      expect(handleCreateDeliverable).toHaveBeenCalledWith({
        title: 'Backend API',
        description: 'Implementar endpoints',
      });
    });
  });

  it('cancelar proyecto llama a actions.handleCancelProject', async () => {
    const handleCancelProject = vi.fn();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    setupHookMock({
      loading: false,
      project: mockProject({ status: 'in_progress' }),
      assignment: mockAssignment,
      deliverables: [],
      actions: { handleReview: vi.fn(), handleCreateDeliverable: vi.fn(), handleSelectCandidate: vi.fn(), handleCancelProject, handleMarkCompleted: vi.fn() },
    });
    renderPage();
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /cancelar proyecto/i })).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('button', { name: /cancelar proyecto/i }));
    await waitFor(() => {
      expect(handleCancelProject).toHaveBeenCalled();
    });
  });

  it('proyecto terminal no muestra botones de acción', async () => {
    setupHookMock({
      loading: false,
      project: mockProject({ status: 'completed' }),
      assignment: mockAssignment,
      deliverables: [mockDeliverable({ status: 'approved' })],
    });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('María García')).toBeInTheDocument();
    });
    expect(screen.queryByLabelText(/título del entregable/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /cancelar proyecto/i })).not.toBeInTheDocument();
  });

  it('rejected project es modo solo lectura', async () => {
    setupHookMock({
      loading: false,
      project: mockProject({ status: 'rejected' }),
      assignment: mockAssignment,
      deliverables: [mockDeliverable({ status: 'rejected' })],
    });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Web banco de alimentos')).toBeInTheDocument();
    });
    expect(screen.queryByRole('button', { name: /seleccionar/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /aprobar/i })).not.toBeInTheDocument();
  });

});
