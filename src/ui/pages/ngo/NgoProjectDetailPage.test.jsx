import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import NgoProjectDetailPage from './NgoProjectDetailPage';

vi.mock('../../../infrastructure/api/projectApi.js', () => ({
  getProjectById: vi.fn(),
}));

vi.mock('../../../infrastructure/api/assignmentApi.js', () => ({
  getAssignmentsByProject: vi.fn(),
}));

import { getProjectById } from '../../../infrastructure/api/projectApi.js';
import { getAssignmentsByProject } from '../../../infrastructure/api/assignmentApi.js';

const mockProject = {
  id: 'p1',
  title: 'Web banco de alimentos',
  status: 'in_review',
  modality: 'remoto',
  deadline: '2026-09-30',
  description: 'Sitio web para banco de alimentos',
};

const mockAssignment = {
  id: 'a1',
  project_id: 'p1',
  student_id: 's1',
  status: 'active',
};

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

beforeEach(() => {
  vi.clearAllMocks();
});

describe('NgoProjectDetailPage', () => {
  it('muestra loading mientras cargan project y assignment', async () => {
    getProjectById.mockImplementation(() => new Promise(() => {})); // nunca resuelve
    getAssignmentsByProject.mockImplementation(() => new Promise(() => {}));
    renderPage();
    expect(screen.getByText(/cargando/i)).toBeInTheDocument();
  });

  it('renderiza error cuando getProjectById falla', async () => {
    getProjectById.mockRejectedValue(new Error('Network error'));
    getAssignmentsByProject.mockResolvedValue([]);
    renderPage();
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(/error/i)
    );
  });

  it('renderiza información del proyecto cuando carga correctamente', async () => {
    getProjectById.mockResolvedValue(mockProject);
    getAssignmentsByProject.mockResolvedValue([mockAssignment]);
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Web banco de alimentos')).toBeInTheDocument();
    });
    expect(screen.getByText('in_review')).toBeInTheDocument();
    expect(screen.getByText('remoto')).toBeInTheDocument();
    expect(screen.getByText('2026-09-30')).toBeInTheDocument();
  });

  it('muestra enlace a entregables cuando assignment existe', async () => {
    getProjectById.mockResolvedValue(mockProject);
    getAssignmentsByProject.mockResolvedValue([mockAssignment]);
    renderPage();
    const link = await screen.findByRole('link', { name: /ver entregables/i });
    expect(link).toHaveAttribute('href', '/ngo/projects/p1/assignments/a1/deliverables');
  });

  it('NO muestra enlace a entregables cuando no hay assignment', async () => {
    getProjectById.mockResolvedValue(mockProject);
    getAssignmentsByProject.mockResolvedValue([]);
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Web banco de alimentos')).toBeInTheDocument();
    });
    expect(screen.queryByRole('link', { name: /ver entregables/i })).not.toBeInTheDocument();
  });
});