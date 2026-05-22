import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import StudentAssignmentPage from './StudentAssignmentPage';

vi.mock('../../../infrastructure/api/assignmentApi.js', () => ({
  getAssignmentById: vi.fn(),
  acceptAssignment: vi.fn(),
}));

vi.mock('../../../infrastructure/api/deliverableApi.js', () => ({
  getDeliverablesByAssignment: vi.fn(),
  startDeliverable: vi.fn(),
  submitDeliverable: vi.fn(),
}));

import { getAssignmentById, acceptAssignment } from '../../../infrastructure/api/assignmentApi.js';
import { getDeliverablesByAssignment, startDeliverable, submitDeliverable } from '../../../infrastructure/api/deliverableApi.js';

const mockAssignment = {
  id: 'asgn1',
  project_title: 'Web banco de alimentos',
  student_name: 'Ana García',
  start_date: '2026-05-01',
  project_status: 'assigned',
};

const mockDeliverables = [
  { id: 'd1', title: 'Diseño de BD', status: 'pending', description: 'Esquema inicial' },
  { id: 'd2', title: 'Backend API', status: 'in_progress', description: 'Endpoints REST' },
  { id: 'd3', title: 'Frontend', status: 'approved', description: 'UI completa' },
];

const mockDeliverablesWithRejected = [
  { id: 'd4', title: 'Documentación', status: 'rejected', description: 'Corregir feedback' },
];

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
  getAssignmentById.mockResolvedValue(mockAssignment);
  getDeliverablesByAssignment.mockResolvedValue(mockDeliverables);
  acceptAssignment.mockResolvedValue({ ...mockAssignment, project_status: 'in_progress' });
  startDeliverable.mockResolvedValue({ id: 'd1', title: 'Diseño de BD', status: 'in_progress' });
  submitDeliverable.mockResolvedValue({ id: 'd2', title: 'Backend API', status: 'in_review' });
});

describe('StudentAssignmentPage', () => {
  it('AC1: carga el assignment y los entregables al montar', async () => {
    renderPage();
    await waitFor(() => expect(getAssignmentById).toHaveBeenCalledWith('asgn1'));
    expect(await screen.findByText('Web banco de alimentos')).toBeInTheDocument();
    expect(getDeliverablesByAssignment).toHaveBeenCalledWith('asgn1');
  });

  it('AC2: muestra los entregables con título y estado', async () => {
    renderPage();
    await screen.findByText('Web banco de alimentos');
    expect(screen.getByText('Diseño de BD')).toBeInTheDocument();
    expect(screen.getByText('Backend API')).toBeInTheDocument();
    expect(screen.getByText('Frontend')).toBeInTheDocument();
    expect(screen.getByText('pending')).toBeInTheDocument();
    expect(screen.getByText('in_progress')).toBeInTheDocument();
    expect(screen.getByText('approved')).toBeInTheDocument();
  });

  it('AC3: muestra botón Aceptar cuando project_status es assigned', async () => {
    renderPage();
    await screen.findByText('Web banco de alimentos');
    expect(screen.getByRole('button', { name: /aceptar/i })).toBeInTheDocument();
  });

  it('AC4: no muestra botón Aceptar cuando project_status no es assigned', async () => {
    getAssignmentById.mockResolvedValue({ ...mockAssignment, project_status: 'in_progress' });
    renderPage();
    await screen.findByText('Web banco de alimentos');
    expect(screen.queryByRole('button', { name: /aceptar/i })).not.toBeInTheDocument();
  });

  it('AC5: Aceptar llama a acceptAssignment y actualiza estado', async () => {
    renderPage();
    await screen.findByText('Web banco de alimentos');
    fireEvent.click(screen.getByRole('button', { name: /aceptar/i }));
    await waitFor(() => expect(acceptAssignment).toHaveBeenCalledWith('asgn1'));
    expect(screen.queryByRole('button', { name: /aceptar/i })).not.toBeInTheDocument();
  });

  it('AC6: Iniciar llama a startDeliverable en un entregable pending', async () => {
    renderPage();
    await screen.findByText('Diseño de BD');
    fireEvent.click(screen.getByRole('button', { name: /iniciar/i }));
    await waitFor(() => expect(startDeliverable).toHaveBeenCalledWith('d1'));
  });

  it('AC7: Enviar a revisión llama a submitDeliverable con file_url', async () => {
    renderPage();
    await screen.findByText('Backend API');
    const input = screen.getByLabelText(/url del archivo/i);
    fireEvent.change(input, { target: { value: 'https://example.com/file.pdf' } });
    fireEvent.click(screen.getByRole('button', { name: /enviar a revisión/i }));
    await waitFor(() =>
      expect(submitDeliverable).toHaveBeenCalledWith('d2', 'https://example.com/file.pdf')
    );
  });

  it('AC8: un entregable rejected muestra acción de reanudación y reutiliza startDeliverable', async () => {
    getDeliverablesByAssignment.mockResolvedValue(mockDeliverablesWithRejected);
    startDeliverable.mockResolvedValue({ id: 'd4', title: 'Documentación', status: 'in_progress' });

    renderPage();
    await screen.findByText('Documentación');

    fireEvent.click(screen.getByRole('button', { name: /reanudar/i }));

    await waitFor(() => expect(startDeliverable).toHaveBeenCalledWith('d4'));
  });
});
