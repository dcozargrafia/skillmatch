import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import NgoProjectCandidatesPage from './NgoProjectCandidatesPage';

vi.mock('../../../infrastructure/api/applicationApi.js', () => ({
  getApplicationsByProject: vi.fn(),
  updateApplicationStatus: vi.fn(),
}));

import { getApplicationsByProject, updateApplicationStatus } from '../../../infrastructure/api/applicationApi.js';

const mockApplications = [
  {
    id: 'a1',
    status: 'pending',
    compatibility_score: 85,
    student_name: 'Ana García',
    student_email: 'ana@example.com',
  },
  {
    id: 'a2',
    status: 'approved',
    compatibility_score: 70,
    student_name: 'Carlos López',
    student_email: 'carlos@example.com',
  },
];

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/ngo/projects/p1/candidates']}>
      <Routes>
        <Route path="/ngo/projects/:id/candidates" element={<NgoProjectCandidatesPage />} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  getApplicationsByProject.mockResolvedValue(mockApplications);
  updateApplicationStatus.mockResolvedValue({ id: 'a1', status: 'approved' });
});

describe('NgoProjectCandidatesPage', () => {
  it('AC1: carga candidatos del proyecto al montar', async () => {
    renderPage();
    await waitFor(() => expect(getApplicationsByProject).toHaveBeenCalledWith('p1'));
    expect(await screen.findByText('Ana García')).toBeInTheDocument();
  });

  it('AC2: muestra nombre, email, score y estado de cada candidato', async () => {
    renderPage();
    await screen.findByText('Ana García');
    expect(screen.getByText('ana@example.com')).toBeInTheDocument();
    expect(screen.getByText('85')).toBeInTheDocument();
    expect(screen.getByText('pending')).toBeInTheDocument();
    expect(screen.getByText('Carlos López')).toBeInTheDocument();
    expect(screen.getByText('carlos@example.com')).toBeInTheDocument();
    expect(screen.getByText('70')).toBeInTheDocument();
    expect(screen.getByText('approved')).toBeInTheDocument();
  });

  it('AC3: muestra estado vacío si no hay candidatos', async () => {
    getApplicationsByProject.mockResolvedValue([]);
    renderPage();
    await screen.findByText(/no hay candidatos/i);
  });

  it('AC4: el botón aprobar llama a updateApplicationStatus con approved', async () => {
    renderPage();
    await screen.findByText('Ana García');
    const approveButtons = screen.getAllByRole('button', { name: /aprobar/i });
    fireEvent.click(approveButtons[0]);
    await waitFor(() =>
      expect(updateApplicationStatus).toHaveBeenCalledWith('a1', 'approved')
    );
  });

  it('AC5: el botón rechazar llama a updateApplicationStatus con rejected', async () => {
    renderPage();
    await screen.findByText('Ana García');
    const rejectButtons = screen.getAllByRole('button', { name: /rechazar/i });
    fireEvent.click(rejectButtons[0]);
    await waitFor(() =>
      expect(updateApplicationStatus).toHaveBeenCalledWith('a1', 'rejected')
    );
  });

  it('AC6: el estado del candidato se actualiza en la UI sin recargar', async () => {
    updateApplicationStatus.mockResolvedValue({ id: 'a1', status: 'approved' });
    renderPage();
    await screen.findByText('Ana García');
    const approveButtons = screen.getAllByRole('button', { name: /aprobar/i });
    fireEvent.click(approveButtons[0]);
    await waitFor(() =>
      expect(updateApplicationStatus).toHaveBeenCalledWith('a1', 'approved')
    );
    const statuses = await screen.findAllByText('approved');
    expect(statuses.length).toBeGreaterThanOrEqual(1);
  });

  it('AC7: muestra error si updateApplicationStatus responde 403', async () => {
    updateApplicationStatus.mockRejectedValueOnce(
      Object.assign(new Error('Forbidden'), { response: { status: 403 } })
    );
    renderPage();
    await screen.findByText('Ana García');
    const rejectButtons = screen.getAllByRole('button', { name: /rechazar/i });
    fireEvent.click(rejectButtons[0]);
    await screen.findByRole('alert');
    expect(screen.getByRole('alert')).toHaveTextContent(/no tienes permiso/i);
  });
});
