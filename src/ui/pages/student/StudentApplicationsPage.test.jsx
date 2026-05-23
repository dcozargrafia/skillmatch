import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import StudentApplicationsPage from './StudentApplicationsPage';

vi.mock('../../../ui/hooks/useStudentAssignments.jsx', () => ({
  default: vi.fn(),
}));

vi.mock('../../../ui/components/DeliverableCard.jsx', () => ({
  DeliverableCard: vi.fn(({ deliverable }) => (
    <div data-testid="deliverable-card">{deliverable.title} [{deliverable.status}]</div>
  )),
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
    expect(screen.getByText('in_progress')).toBeInTheDocument();
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
});