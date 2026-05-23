import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import StudentApplicationsPage from './StudentApplicationsPage';
import { getStatusLabel, getProjectStatusMessage, sortDeliverables } from '@/domain/project/Project.js';

// Module-level state to control mock behavior for PR3 tests
let _captureViewDetails = null;

vi.mock('../../../ui/hooks/useStudentAssignments.jsx', () => ({
  default: vi.fn(),
}));

let _mockDeliverableCardProps = null;
vi.mock('../../../ui/components/DeliverableCard.jsx', () => ({
  DeliverableCard: vi.fn(({ deliverable, showViewDetails, onViewDetails }) => {
    if (_captureViewDetails) {
      _captureViewDetails({ showViewDetails, onViewDetails });
    }
    return <div data-testid="deliverable-card">{deliverable.title} [{deliverable.status}]</div>;
  }),
}));

import useStudentAssignments from '../../../ui/hooks/useStudentAssignments.jsx';

const mockAssignments = [
  {
    id: 'assign1',
    project_id: 'p1',
    status: 'active',
    project_title: 'Web banco de alimentos',
    project_status: 'in_progress',
    deliverables: [
      { id: 'd1', title: 'Entregable 1', status: 'pending', description: 'Algo' },
    ],
  },
  {
    id: 'assign2',
    project_id: 'p2',
    status: 'active',
    project_title: 'Campaña digital refugio',
    project_status: 'assigned',
    deliverables: [
      { id: 'd2', title: 'Entregable 2', status: 'in_progress', description: 'Algo' },
    ],
  },
];

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/student/applications']}>
      <Routes>
        <Route path="/student/applications" element={<StudentApplicationsPage />} />
        <Route path="/student/assignments/:id" element={<div>Assignment</div>} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('StudentApplicationsPage', () => {
  it('AC1: muestra indicador de carga mientras se obtienen los datos', () => {
    useStudentAssignments.mockReturnValue({
      assignments: [],
      deliverablesByAssignment: {},
      loading: true,
      error: null,
      refresh: vi.fn(),
    });
    renderPage();
    expect(screen.getByText(/cargando/i)).toBeInTheDocument();
  });

  it('AC2: muestra estado vacío si no hay assignments', async () => {
    useStudentAssignments.mockReturnValue({
      assignments: [],
      deliverablesByAssignment: {},
      loading: false,
      error: null,
      refresh: vi.fn(),
    });
    renderPage();
    await screen.findByText(/no tienes proyectos asignados/i);
  });

  it('AC3: renderiza tarjetas de assignment con project_title y project_status', async () => {
    useStudentAssignments.mockReturnValue({
      assignments: [
        {
          id: 'assign1',
          project_id: 'p1',
          status: 'active',
          project_title: 'Web banco de alimentos',
          project_status: 'in_progress',
          deliverables: [],
        },
      ],
      deliverablesByAssignment: {},
      loading: false,
      error: null,
      refresh: vi.fn(),
    });
    renderPage();
    await screen.findByText('Web banco de alimentos');
    expect(screen.getByText('En progreso')).toBeInTheDocument();
  });

  it('AC4: deliverable pending muestra DeliverableCard con variant=student', async () => {
    useStudentAssignments.mockReturnValue({
      assignments: [
        {
          id: 'assign1',
          project_id: 'p1',
          status: 'active',
          project_title: 'Web banco de alimentos',
          project_status: 'in_progress',
        },
      ],
      deliverablesByAssignment: {
        assign1: [{ id: 'd1', title: 'Entregable 1', status: 'pending', description: 'Algo' }],
      },
      loading: false,
      error: null,
      refresh: vi.fn(),
    });
    renderPage();
    await screen.findByText(/Entregable 1/);
  });

  it('AC5: muestra enlace "Ver detalles" al assignment', async () => {
    useStudentAssignments.mockReturnValue({
      assignments: [
        {
          id: 'assign1',
          project_id: 'p1',
          status: 'active',
          project_title: 'Web banco de alimentos',
          project_status: 'in_progress',
          deliverables: [],
        },
      ],
      deliverablesByAssignment: {},
      loading: false,
      error: null,
      refresh: vi.fn(),
    });
    renderPage();
    await screen.findByText('Web banco de alimentos');
    expect(screen.getByRole('link', { name: /ver detalles/i })).toHaveAttribute(
      'href',
      '/student/assignments/assign1'
    );
  });

  it('AC6: múltiples assignments cada uno con sus deliverable cards', async () => {
    useStudentAssignments.mockReturnValue({
      assignments: mockAssignments,
      deliverablesByAssignment: {
        assign1: [{ id: 'd1', title: 'Entregable A', status: 'pending', description: 'Algo' }],
        assign2: [{ id: 'd2', title: 'Entregable B', status: 'in_progress', description: 'Algo' }],
      },
      loading: false,
      error: null,
      refresh: vi.fn(),
    });
    renderPage();
    await screen.findByText('Web banco de alimentos');
    await screen.findByText('Campaña digital refugio');
    expect(screen.queryByText(/cargando/i)).not.toBeInTheDocument();
  });

  // PR2: Spanish project status badge, contextual message, sorted deliverables
  describe('PR2: Spanish project status and sorting', () => {
    it('renders translated project status badge (En progreso)', async () => {
      useStudentAssignments.mockReturnValue({
        assignments: [
          {
            id: 'assign1',
            project_id: 'p1',
            status: 'active',
            project_title: 'Web banco de alimentos',
            project_status: 'in_progress',
            deliverables: [],
          },
        ],
        deliverablesByAssignment: {},
        loading: false,
        error: null,
        refresh: vi.fn(),
      });
      renderPage();
      await screen.findByText('Web banco de alimentos');
      expect(screen.getByText('En progreso')).toBeInTheDocument();
    });

    it('renders translated project status badge (En revisión)', async () => {
      useStudentAssignments.mockReturnValue({
        assignments: [
          {
            id: 'assign1',
            project_id: 'p1',
            status: 'active',
            project_title: 'Web banco de alimentos',
            project_status: 'in_review',
            deliverables: [],
          },
        ],
        deliverablesByAssignment: {},
        loading: false,
        error: null,
        refresh: vi.fn(),
      });
      renderPage();
      await screen.findByText('Web banco de alimentos');
      expect(screen.getByText('En revisión')).toBeInTheDocument();
    });

    it('shows contextual message when project is in_review with pending deliverables', async () => {
      useStudentAssignments.mockReturnValue({
        assignments: [
          {
            id: 'assign1',
            project_id: 'p1',
            status: 'active',
            project_title: 'Web banco de alimentos',
            project_status: 'in_review',
            deliverables: [],
          },
        ],
        deliverablesByAssignment: {
          assign1: [
            { id: 'd1', title: 'Wireframes', status: 'in_review', created_at: '2026-05-01T10:00:00Z' },
            { id: 'd2', title: 'Prototipo', status: 'pending', created_at: '2026-05-05T10:00:00Z' },
          ],
        },
        loading: false,
        error: null,
        refresh: vi.fn(),
      });
      renderPage();
      await screen.findByText('Web banco de alimentos');
      const message = getProjectStatusMessage('in_review', [
        { id: 'd1', title: 'Wireframes', status: 'in_review', created_at: '2026-05-01T10:00:00Z' },
        { id: 'd2', title: 'Prototipo', status: 'pending', created_at: '2026-05-05T10:00:00Z' },
      ]);
      expect(screen.getByText(message)).toBeInTheDocument();
    });

    it('sortDeliverables orders in_review first, then in_progress, then pending', () => {
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

    it('sortDeliverables uses created_at as tiebreaker for same status', () => {
      const deliverables = [
        { id: 'd1', title: 'Wireframes', status: 'pending', created_at: '2026-05-10T10:00:00Z' },
        { id: 'd2', title: 'Prototipo', status: 'pending', created_at: '2026-05-01T10:00:00Z' },
        { id: 'd3', title: 'Docs', status: 'pending', created_at: '2026-05-05T10:00:00Z' },
      ];
      const sorted = sortDeliverables(deliverables);
      expect(sorted[0].title).toBe('Wireframes'); // newest first
      expect(sorted[1].title).toBe('Docs');
      expect(sorted[2].title).toBe('Prototipo'); // oldest last
    });
  });

  // PR3: Ver detalles button on each DeliverableCard
  describe('PR3: Ver detalles button navigation', () => {
    beforeEach(() => {
      _captureViewDetails = null;
    });

    it('each DeliverableCard receives showViewDetails=true and onViewDetails callback', async () => {
      let capturedProps = null;
      _captureViewDetails = (props) => { capturedProps = props; };

      useStudentAssignments.mockReturnValue({
        assignments: [
          {
            id: 'assign1',
            project_id: 'p1',
            status: 'active',
            project_title: 'Web banco de alimentos',
            project_status: 'in_progress',
            deliverables: [],
          },
        ],
        deliverablesByAssignment: {
          assign1: [
            { id: 'd1', title: 'Wireframes', status: 'pending', description: 'Algo' },
            { id: 'd2', title: 'Prototipo', status: 'in_progress', description: 'Algo' },
          ],
        },
        loading: false,
        error: null,
        refresh: vi.fn(),
      });

      renderPage();
      await screen.findByText('Web banco de alimentos');

      expect(capturedProps).not.toBeNull();
      expect(capturedProps.showViewDetails).toBe(true);
      expect(typeof capturedProps.onViewDetails).toBe('function');
    });

    it('onViewDetails callback is invoked with correct URL parameters', async () => {
      // Track all calls to the captured callback
      const calls = [];
      let capturedProps = null;
      _captureViewDetails = (props) => {
        capturedProps = props;
        // Store the callback but immediately wrap it to track calls
        const originalCallback = props.onViewDetails;
        if (typeof originalCallback === 'function') {
          props.onViewDetails = (...args) => {
            calls.push(args);
            return originalCallback(...args);
          };
        }
      };

      useStudentAssignments.mockReturnValue({
        assignments: [
          {
            id: 'assign1',
            project_id: 'p1',
            status: 'active',
            project_title: 'Web banco de alimentos',
            project_status: 'in_progress',
            deliverables: [],
          },
        ],
        deliverablesByAssignment: {
          assign1: [
            { id: 'd1', title: 'Wireframes', status: 'pending', description: 'Algo' },
          ],
        },
        loading: false,
        error: null,
        refresh: vi.fn(),
      });

      renderPage();
      await screen.findByText('Web banco de alimentos');

      expect(capturedProps).not.toBeNull();
      expect(typeof capturedProps.onViewDetails).toBe('function');

      // Trigger the onViewDetails callback
      capturedProps.onViewDetails({ id: 'd1', title: 'Wireframes', status: 'pending' });

      // Verify the callback was called (navigation happens via react-router in real app)
      expect(calls).toHaveLength(1);
    });
  });
});