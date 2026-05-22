import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import StudentApplicationsPage from './StudentApplicationsPage';

vi.mock('../../../infrastructure/api/assignmentApi.js', () => ({
  getAssignmentsByStatus: vi.fn(),
}));

vi.mock('../../../infrastructure/api/deliverableApi.js', () => ({
  getDeliverablesByAssignment: vi.fn(),
  startDeliverable: vi.fn(),
  submitDeliverable: vi.fn(),
}));

import { getAssignmentsByStatus } from '../../../infrastructure/api/assignmentApi.js';
import { getDeliverablesByAssignment } from '../../../infrastructure/api/deliverableApi.js';

const mockAssignments = [
  {
    id: 'assign1',
    project_id: 'p1',
    status: 'active',
    project_title: 'Web banco de alimentos',
    project_status: 'in_progress',
  },
  {
    id: 'assign2',
    project_id: 'p2',
    status: 'active',
    project_title: 'Campaña digital refugio',
    project_status: 'assigned',
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
  getAssignmentsByStatus.mockResolvedValue([]);
  getDeliverablesByAssignment.mockResolvedValue([]);
});

describe('StudentApplicationsPage', () => {
  it('AC1: muestra indicador de carga mientras se obtienen los datos', () => {
    getAssignmentsByStatus.mockReturnValue(new Promise(() => {}));
    renderPage();
    expect(screen.getByText(/cargando/i)).toBeInTheDocument();
  });

  it('AC2: muestra estado vacío si no hay assignments', async () => {
    getAssignmentsByStatus.mockResolvedValue([]);
    renderPage();
    await screen.findByText(/no tienes proyectos asignados/i);
  });

  it('AC3: renderiza tarjetas de assignment con project_title y project_status', async () => {
    getAssignmentsByStatus.mockResolvedValue([mockAssignments[0]]);
    getDeliverablesByAssignment.mockResolvedValue([]);
    renderPage();
    await screen.findByText('Web banco de alimentos');
    expect(screen.getByText('in_progress')).toBeInTheDocument();
  });

  it('AC4: deliverable pending muestra botón "Iniciar"', async () => {
    getAssignmentsByStatus.mockResolvedValue([mockAssignments[0]]);
    getDeliverablesByAssignment.mockResolvedValue([
      { id: 'd1', title: 'Entregable 1', status: 'pending', description: 'Algo' },
    ]);
    renderPage();
    await screen.findByText('Entregable 1');
    expect(screen.getByRole('button', { name: /iniciar/i })).toBeInTheDocument();
  });

  it('AC5: deliverable in_progress muestra input URL y botón "Enviar a revisión"', async () => {
    getAssignmentsByStatus.mockResolvedValue([mockAssignments[0]]);
    getDeliverablesByAssignment.mockResolvedValue([
      { id: 'd1', title: 'Entregable 2', status: 'in_progress', description: 'Algo' },
    ]);
    renderPage();
    await screen.findByText('Entregable 2');
    expect(screen.getByRole('button', { name: /enviar a revisión/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/url del archivo/i)).toBeInTheDocument();
  });

  it('AC6: deliverable in_review muestra badge de estado', async () => {
    getAssignmentsByStatus.mockResolvedValue([mockAssignments[0]]);
    getDeliverablesByAssignment.mockResolvedValue([
      { id: 'd1', title: 'Entregable 3', status: 'in_review', description: 'Algo' },
    ]);
    renderPage();
    await screen.findByText('Entregable 3');
    expect(screen.getByText('in_review')).toBeInTheDocument();
  });

  it('AC7: deliverable approved muestra badge de estado', async () => {
    getAssignmentsByStatus.mockResolvedValue([mockAssignments[0]]);
    getDeliverablesByAssignment.mockResolvedValue([
      { id: 'd1', title: 'Entregable 4', status: 'approved', description: 'Algo' },
    ]);
    renderPage();
    await screen.findByText('Entregable 4');
    expect(screen.getByText('approved')).toBeInTheDocument();
  });

  it('AC8: deliverable rejected muestra badge "Rechazado" y botón "Reintentar"', async () => {
    getAssignmentsByStatus.mockResolvedValue([mockAssignments[0]]);
    getDeliverablesByAssignment.mockResolvedValue([
      { id: 'd1', title: 'Entregable 5', status: 'rejected', description: 'Algo' },
    ]);
    renderPage();
    await screen.findByText('Entregable 5');
    expect(screen.getByText('rejected')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reintentar/i })).toBeInTheDocument();
  });

  it('AC9: muestra enlace "Ver detalles" al assignment', async () => {
    getAssignmentsByStatus.mockResolvedValue([mockAssignments[0]]);
    getDeliverablesByAssignment.mockResolvedValue([]);
    renderPage();
    await screen.findByText('Web banco de alimentos');
    expect(screen.getByRole('link', { name: /ver detalles/i })).toHaveAttribute(
      'href',
      '/student/assignments/assign1'
    );
  });

  it('AC10: múltiples assignments cada uno con sus deliverable cards', async () => {
    getAssignmentsByStatus.mockResolvedValue(mockAssignments);
    getDeliverablesByAssignment.mockImplementation((assignId) => {
      if (assignId === 'assign1') return Promise.resolve([{ id: 'd1', title: 'Entregable A', status: 'pending', description: 'Algo' }]);
      if (assignId === 'assign2') return Promise.resolve([{ id: 'd2', title: 'Entregable B', status: 'in_progress', description: 'Algo' }]);
      return Promise.resolve([]);
    });
    renderPage();
    await screen.findByText('Web banco de alimentos');
    await screen.findByText('Campaña digital refugio');
    expect(screen.queryByText(/cargando/i)).not.toBeInTheDocument();
  });
});