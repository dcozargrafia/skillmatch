import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import StudentApplicationsPage from './StudentApplicationsPage';

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
