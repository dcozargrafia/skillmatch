import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import StudentAssignmentPage from './StudentAssignmentPage';
import { getStatusLabel, getProjectStatusMessage, sortDeliverables } from '@/domain/project/Project.js';

vi.mock('../../../ui/hooks/useStudentAssignment.jsx', () => ({
  default: vi.fn(),
}));

vi.mock('../../../ui/hooks/useStudentCertificate.jsx', () => ({
  default: vi.fn(),
}));

vi.mock('../../../ui/hooks/useStudentReview.jsx', () => ({
  default: vi.fn(),
}));

vi.mock('../../../ui/components/DeliverableCard.jsx', () => ({
  DeliverableCard: vi.fn(({ deliverable, onStart, onSubmit, highlighted }) => (
    <div data-testid="deliverable-card" data-highlighted={highlighted ? 'true' : 'false'}>
      <div>{deliverable.title} [{deliverable.status}]</div>
      {deliverable.status === 'pending' && onStart && (
        <button onClick={() => onStart(deliverable.id)}>Iniciar</button>
      )}
      {deliverable.status === 'in_progress' && onSubmit && (
        <button onClick={() => onSubmit(deliverable.id, 'https://files.example.com/output.pdf')}>
          Enviar a revisión
        </button>
      )}
      {deliverable.status === 'rejected' && onStart && (
        <button onClick={() => onStart(deliverable.id)}>Reintentar</button>
      )}
    </div>
  )),
}));

import useStudentAssignment from '../../../ui/hooks/useStudentAssignment.jsx';
import useStudentCertificate from '../../../ui/hooks/useStudentCertificate.jsx';
import useStudentReview from '../../../ui/hooks/useStudentReview.jsx';

const mockAssignment = {
  id: 'asgn1',
  project_title: 'Web banco de alimentos',
  student_name: 'Ana García',
  start_date: '2026-05-01',
  project_status: 'assigned',
  certificate_id: 'cert1',
};

const mockDeliverables = [
  { id: 'd1', title: 'Diseño de BD', status: 'pending', description: 'Esquema inicial' },
  { id: 'd2', title: 'Backend API', status: 'in_progress', description: 'Endpoints REST' },
  { id: 'd3', title: 'Frontend', status: 'approved', description: 'UI completa' },
];

const mockDeliverablesWithRejected = [
  { id: 'd4', title: 'Documentación', status: 'rejected', description: 'Corregir feedback' },
];

function setupAssignmentHook(overrides = {}) {
  const defaults = {
    assignment: null,
    deliverables: [],
    loading: true,
    error: null,
    actions: {
      handleStartDeliverable: vi.fn(),
      handleSubmitDeliverable: vi.fn(),
      handleAcceptAssignment: vi.fn(),
    },
  };
  useStudentAssignment.mockReturnValue({ ...defaults, ...overrides });
}

function setupCertificateHook(overrides = {}) {
  const defaults = {
    downloading: false,
    error: null,
    handleDownload: vi.fn(),
  };
  useStudentCertificate.mockReturnValue({ ...defaults, ...overrides });
}

function setupReviewHook(overrides = {}) {
  const defaults = {
    submitting: false,
    reviewSent: false,
    error: null,
    handleSubmitReview: vi.fn(),
  };
  useStudentReview.mockReturnValue({ ...defaults, ...overrides });
}

function renderPage(assignmentId = 'asgn1') {
  return render(
    <MemoryRouter initialEntries={[`/student/assignments/${assignmentId}`]}>
      <Routes>
        <Route path="/student/assignments/:id" element={<StudentAssignmentPage />} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  setupAssignmentHook();
  setupCertificateHook();
  setupReviewHook();
});

describe('StudentAssignmentPage', () => {
  it('AC1: carga el assignment y los entregables al montar', async () => {
    setupAssignmentHook({
      assignment: mockAssignment,
      deliverables: mockDeliverables,
      loading: false,
      error: null,
    });
    renderPage();
    await screen.findByText('Web banco de alimentos');
    expect(screen.getByText('Web banco de alimentos')).toBeInTheDocument();
  });

  it('AC2: muestra los entregables con título y estado', async () => {
    setupAssignmentHook({
      assignment: mockAssignment,
      deliverables: mockDeliverables,
      loading: false,
      error: null,
    });
    renderPage();
    await screen.findByText('Web banco de alimentos');
    expect(await screen.findByText(/Diseño de BD/)).toBeInTheDocument();
    expect(await screen.findByText(/Backend API/)).toBeInTheDocument();
    expect(await screen.findByText(/Frontend/)).toBeInTheDocument();
    // AC2: verify the mock renders raw status in brackets (existing behavior)
    expect(await screen.findByText(/pending/)).toBeInTheDocument();
    expect(await screen.findByText(/in_progress/)).toBeInTheDocument();
    expect(await screen.findByText(/approved/)).toBeInTheDocument();
  });

  it('AC3: muestra botón Aceptar cuando project_status es assigned', async () => {
    setupAssignmentHook({
      assignment: mockAssignment,
      deliverables: mockDeliverables,
      loading: false,
      error: null,
    });
    renderPage();
    await screen.findByText('Web banco de alimentos');
    expect(screen.getByRole('button', { name: /aceptar/i })).toBeInTheDocument();
  });

  it('AC4: no muestra botón Aceptar cuando project_status no es assigned', async () => {
    setupAssignmentHook({
      assignment: { ...mockAssignment, project_status: 'in_progress' },
      deliverables: mockDeliverables,
      loading: false,
      error: null,
    });
    renderPage();
    await screen.findByText('Web banco de alimentos');
    expect(screen.queryByRole('button', { name: /aceptar/i })).not.toBeInTheDocument();
  });

  it('AC5: Aceptar llama a handleAcceptAssignment y actualiza estado', async () => {
    const handleAcceptAssignment = vi.fn().mockResolvedValue(undefined);
    let capturedAssignment = { ...mockAssignment };
    setupAssignmentHook({
      get assignment() { return capturedAssignment; },
      deliverables: mockDeliverables,
      loading: false,
      error: null,
      actions: {
        handleStartDeliverable: vi.fn(),
        handleSubmitDeliverable: vi.fn(),
        handleAcceptAssignment: async () => {
          capturedAssignment = { ...capturedAssignment, project_status: 'in_progress' };
          await handleAcceptAssignment();
        },
      },
    });
    renderPage();
    await screen.findByText('Web banco de alimentos');
    fireEvent.click(screen.getByRole('button', { name: /aceptar/i }));
    await waitFor(() => expect(handleAcceptAssignment).toHaveBeenCalled());
  });

  it('AC6: Iniciar llama a handleStartDeliverable en un entregable pending', async () => {
    const handleStartDeliverable = vi.fn().mockResolvedValue(undefined);
    setupAssignmentHook({
      assignment: mockAssignment,
      deliverables: mockDeliverables,
      loading: false,
      error: null,
      actions: {
        handleStartDeliverable,
        handleSubmitDeliverable: vi.fn(),
        handleAcceptAssignment: vi.fn(),
      },
    });
    renderPage();
    fireEvent.click(await screen.findByRole('button', { name: /iniciar/i }));
    await waitFor(() => expect(handleStartDeliverable).toHaveBeenCalledWith(mockDeliverables[0], mockDeliverables));
  });

  it('AC7: Enviar a revisión llama a handleSubmitDeliverable con file_url', async () => {
    const handleSubmitDeliverable = vi.fn().mockResolvedValue(undefined);
    setupAssignmentHook({
      assignment: mockAssignment,
      deliverables: mockDeliverables,
      loading: false,
      error: null,
      actions: {
        handleStartDeliverable: vi.fn(),
        handleSubmitDeliverable,
        handleAcceptAssignment: vi.fn(),
      },
    });
    renderPage();
    fireEvent.click(await screen.findByRole('button', { name: /enviar a revisión/i }));
    await waitFor(() =>
      expect(handleSubmitDeliverable).toHaveBeenCalledWith(
        mockDeliverables[1],
        'https://files.example.com/output.pdf'
      )
    );
  });

  it('AC8: un entregable rejected muestra acción de reanudación', async () => {
    const handleStartDeliverable = vi.fn().mockResolvedValue(undefined);
    setupAssignmentHook({
      assignment: { ...mockAssignment, project_status: 'in_progress' },
      deliverables: [{ id: 'd4', title: 'Doc revisada', status: 'rejected', description: 'Corregir feedback' }],
      loading: false,
      error: null,
      actions: {
        handleStartDeliverable,
        handleSubmitDeliverable: vi.fn(),
        handleAcceptAssignment: vi.fn(),
      },
    });
    renderPage();
    fireEvent.click(await screen.findByRole('button', { name: /reintentar/i }));
    await waitFor(() =>
      expect(handleStartDeliverable).toHaveBeenCalledWith(
        { id: 'd4', title: 'Doc revisada', status: 'rejected', description: 'Corregir feedback' },
        [{ id: 'd4', title: 'Doc revisada', status: 'rejected', description: 'Corregir feedback' }]
      )
    );
  });

  it('AC9: muestra botón Descargar certificado cuando assignment tiene certificate_id y status completed', async () => {
    setupAssignmentHook({
      assignment: { ...mockAssignment, project_status: 'completed', certificate_id: 'cert1' },
      deliverables: mockDeliverables,
      loading: false,
      error: null,
    });
    setupCertificateHook({ handleDownload: vi.fn() });
    renderPage();
    await screen.findByText('Web banco de alimentos');
    expect(screen.getByRole('button', { name: /descargar certificado/i })).toBeInTheDocument();
  });

  it('AC10: muestra formulario de valoración cuando status completed y reviewSent es false', async () => {
    setupAssignmentHook({
      assignment: { ...mockAssignment, project_status: 'completed' },
      deliverables: mockDeliverables,
      loading: false,
      error: null,
    });
    setupReviewHook({ reviewSent: false, handleSubmitReview: vi.fn() });
    renderPage();
    await screen.findByText('Web banco de alimentos');
    expect(screen.getByRole('button', { name: /enviar valoración/i })).toBeInTheDocument();
  });

  it('AC11: no muestra formulario de valoración cuando reviewSent es true', async () => {
    setupAssignmentHook({
      assignment: { ...mockAssignment, project_status: 'completed' },
      deliverables: mockDeliverables,
      loading: false,
      error: null,
    });
    setupReviewHook({ reviewSent: true });
    renderPage();
    await screen.findByText('Web banco de alimentos');
    expect(screen.queryByRole('button', { name: /enviar valoración/i })).not.toBeInTheDocument();
  });

  // PR2: Spanish project badge, message, and sorting
  describe('PR2: Spanish project status and sorting', () => {
    it('renders translated project status badge (En progreso)', async () => {
      setupAssignmentHook({
        assignment: { ...mockAssignment, project_status: 'in_progress' },
        deliverables: mockDeliverables,
        loading: false,
        error: null,
      });
      renderPage();
      await screen.findByText('Web banco de alimentos');
      expect(screen.getByText('En progreso')).toBeInTheDocument();
    });

    it('shows contextual message when project is in_review with deliverables', async () => {
      const deliverablesWithReview = [
        { id: 'd1', title: 'Wireframes', status: 'in_review', created_at: '2026-05-01T10:00:00Z' },
        { id: 'd2', title: 'Prototipo', status: 'pending', created_at: '2026-05-05T10:00:00Z' },
      ];
      setupAssignmentHook({
        assignment: { ...mockAssignment, project_status: 'in_review' },
        deliverables: deliverablesWithReview,
        loading: false,
        error: null,
      });
      renderPage();
      await screen.findByText('Web banco de alimentos');
      const message = getProjectStatusMessage('in_review', deliverablesWithReview);
      expect(screen.getByText(message)).toBeInTheDocument();
    });

    it('sortDeliverables orders in_review first then in_progress then pending', () => {
      const deliverables = [
        { id: 'd1', title: 'Wireframes', status: 'pending', created_at: '2026-05-01T10:00:00Z' },
        { id: 'd2', title: 'Prototipo', status: 'in_review', created_at: '2026-05-02T10:00:00Z' },
        { id: 'd3', title: 'Docs', status: 'approved', created_at: '2026-05-03T10:00:00Z' },
        { id: 'd4', title: 'Testing', status: 'in_progress', created_at: '2026-05-04T10:00:00Z' },
      ];
      const sorted = sortDeliverables(deliverables);
      expect(sorted[0].status).toBe('in_review');
      expect(sorted[1].status).toBe('in_progress');
      expect(sorted[2].status).toBe('pending');
      expect(sorted[3].status).toBe('approved');
    });
  });

  // PR3: deliverable query param highlighting
  describe('PR3: deliverable query param highlighting', () => {
    it('renders with ?deliverable= query param and passes highlightedDeliverableId to DeliverableCard', async () => {
      setupAssignmentHook({
        assignment: { ...mockAssignment, project_status: 'in_progress' },
        deliverables: [
          { id: 'd1', title: 'Wireframes', status: 'pending', description: 'Algo' },
          { id: 'd2', title: 'Prototipo', status: 'in_progress', description: 'Algo' },
        ],
        loading: false,
        error: null,
      });
      setupCertificateHook();
      setupReviewHook();

      // Render with ?deliverable=d1 in URL
      render(
        <MemoryRouter initialEntries={['/student/assignments/asgn1?deliverable=d1']}>
          <Routes>
            <Route path="/student/assignments/:id" element={<StudentAssignmentPage />} />
          </Routes>
        </MemoryRouter>
      );

      await screen.findByText('Web banco de alimentos');

      const cards = screen.getAllByTestId('deliverable-card');
      expect(cards).toHaveLength(2);
      const wireframesCard = cards.find((card) => card.textContent?.includes('Wireframes'));
      const prototipoCard = cards.find((card) => card.textContent?.includes('Prototipo'));
      expect(wireframesCard).toHaveAttribute('data-highlighted', 'true');
      expect(prototipoCard).toHaveAttribute('data-highlighted', 'false');
    });
  });
});
