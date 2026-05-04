import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import NgoProjectAssignmentPage from './NgoProjectAssignmentPage';

vi.mock('../../../infrastructure/api/applicationApi.js', () => ({
  getApplicationsByProject: vi.fn(),
}));

vi.mock('../../../infrastructure/api/assignmentApi.js', () => ({
  getAssignmentsByProject: vi.fn(),
  createAssignment: vi.fn(),
}));

import { getApplicationsByProject } from '../../../infrastructure/api/applicationApi.js';
import { getAssignmentsByProject, createAssignment } from '../../../infrastructure/api/assignmentApi.js';

const mockApplicationsApproved = [
  {
    id: 'a1',
    status: 'approved',
    compatibility_score: 90,
    student_name: 'Ana García',
    student_email: 'ana@example.com',
  },
  {
    id: 'a2',
    status: 'approved',
    compatibility_score: 75,
    student_name: 'Carlos López',
    student_email: 'carlos@example.com',
  },
];

const mockAssignment = {
  id: 'asgn1',
  student_name: 'Ana García',
  student_email: 'ana@example.com',
  start_date: '2026-05-01',
  end_date: null,
};

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/ngo/projects/p1/assignment']}>
      <Routes>
        <Route path="/ngo/projects/:id/assignment" element={<NgoProjectAssignmentPage />} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  getAssignmentsByProject.mockResolvedValue(null);
  getApplicationsByProject.mockResolvedValue(mockApplicationsApproved);
  createAssignment.mockResolvedValue(mockAssignment);
});

describe('NgoProjectAssignmentPage', () => {
  it('AC1: carga el assignment existente desde getAssignmentsByProject al montar', async () => {
    getAssignmentsByProject.mockResolvedValue(mockAssignment);
    renderPage();
    await waitFor(() => expect(getAssignmentsByProject).toHaveBeenCalledWith('p1'));
    expect(await screen.findByText('Ana García')).toBeInTheDocument();
  });

  it('AC2: si hay assignment, no muestra botones de selección', async () => {
    getAssignmentsByProject.mockResolvedValue(mockAssignment);
    renderPage();
    await screen.findByText('Ana García');
    expect(screen.queryByRole('button', { name: /seleccionar/i })).not.toBeInTheDocument();
  });

  it('AC3: si no hay assignment, muestra candidatos aprobados con botón Seleccionar', async () => {
    renderPage();
    await screen.findByText('Ana García');
    expect(screen.getAllByRole('button', { name: /seleccionar/i })).toHaveLength(2);
  });

  it('AC4: solo muestra candidatos con status approved', async () => {
    getApplicationsByProject.mockResolvedValue([
      { id: 'a1', status: 'approved', compatibility_score: 90, student_name: 'Ana García', student_email: 'ana@example.com' },
      { id: 'a2', status: 'pending', compatibility_score: 60, student_name: 'Carlos López', student_email: 'carlos@example.com' },
      { id: 'a3', status: 'rejected', compatibility_score: 50, student_name: 'Pedro Díaz', student_email: 'pedro@example.com' },
    ]);
    renderPage();
    await screen.findByText('Ana García');
    expect(screen.queryByText('Carlos López')).not.toBeInTheDocument();
    expect(screen.queryByText('Pedro Díaz')).not.toBeInTheDocument();
  });

  it('AC5: el botón Seleccionar llama a createAssignment con el application_id', async () => {
    renderPage();
    await screen.findByText('Ana García');
    const buttons = screen.getAllByRole('button', { name: /seleccionar/i });
    fireEvent.click(buttons[0]);
    await waitFor(() => expect(createAssignment).toHaveBeenCalledWith('a1'));
  });

  it('AC6: tras crear el assignment, muestra los datos del assignment y oculta los botones', async () => {
    renderPage();
    await screen.findByText('Ana García');
    const buttons = screen.getAllByRole('button', { name: /seleccionar/i });
    fireEvent.click(buttons[0]);
    await waitFor(() => expect(createAssignment).toHaveBeenCalled());
    expect(screen.queryByRole('button', { name: /seleccionar/i })).not.toBeInTheDocument();
  });

  it('AC7: muestra estado vacío si no hay candidatos aprobados y no hay assignment', async () => {
    getApplicationsByProject.mockResolvedValue([]);
    renderPage();
    await screen.findByText(/no hay candidatos aprobados/i);
  });
});
