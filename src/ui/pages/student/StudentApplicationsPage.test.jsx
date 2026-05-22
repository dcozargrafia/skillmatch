import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import StudentApplicationsPage from './StudentApplicationsPage';

vi.mock('../../../infrastructure/api/applicationApi.js', () => ({
  getOwnApplications: vi.fn(),
}));

vi.mock('../../../infrastructure/api/assignmentApi.js', () => ({
  getMyAssignments: vi.fn(),
}));

import { getOwnApplications } from '../../../infrastructure/api/applicationApi.js';
import { getMyAssignments } from '../../../infrastructure/api/assignmentApi.js';

const mockApplications = [
  {
    id: 'a1',
    status: 'pending',
    compatibility_score: 85,
    created_at: '2026-04-01T10:00:00Z',
    project_id: 'p1',
    project_title: 'Web banco de alimentos',
    project_status: 'in_review',
  },
  {
    id: 'a2',
    status: 'approved',
    compatibility_score: 92,
    created_at: '2026-04-10T08:30:00Z',
    project_id: 'p2',
    project_title: 'Campaña digital refugio',
    project_status: 'pending',
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

const mockAssignments = [
  {
    id: 'assign1',
    project_id: 'p1',
    status: 'active',
  },
  {
    id: 'assign2',
    project_id: 'p2',
    status: 'active',
  },
];

beforeEach(() => {
  vi.clearAllMocks();
  getOwnApplications.mockResolvedValue(mockApplications);
  getMyAssignments.mockResolvedValue(mockAssignments);
});

describe('StudentApplicationsPage', () => {
  it('AC1: carga aplicaciones desde getOwnApplications al montar', async () => {
    renderPage();
    expect(await screen.findByText('Web banco de alimentos')).toBeInTheDocument();
    expect(getOwnApplications).toHaveBeenCalledTimes(1);
  });

  it('AC2: muestra título del proyecto, fecha, score y estado de cada aplicación', async () => {
    renderPage();
    await screen.findByText('Web banco de alimentos');
    expect(screen.getByText('Campaña digital refugio')).toBeInTheDocument();
    expect(screen.getByText('85')).toBeInTheDocument();
    expect(screen.getByText('92')).toBeInTheDocument();
    expect(screen.getByText('pending')).toBeInTheDocument();
    expect(screen.getByText('approved')).toBeInTheDocument();
  });

  it('AC3: muestra un indicador de carga mientras se obtienen los datos', () => {
    getOwnApplications.mockReturnValue(new Promise(() => {}));
    getMyAssignments.mockReturnValue(new Promise(() => {}));
    renderPage();
    expect(screen.getByText(/cargando/i)).toBeInTheDocument();
  });

  it('AC4: muestra estado vacío si no hay aplicaciones', async () => {
    getOwnApplications.mockResolvedValue([]);
    getMyAssignments.mockResolvedValue([]);
    renderPage();
    await screen.findByText(/no has aplicado/i);
  });

  it('AC5: muestra enlace al assignment cuando el estado es approved', async () => {
    renderPage();
    await screen.findByText('Campaña digital refugio');
    const assignmentLink = screen.getByRole('link', { name: /ver assignment/i });
    expect(assignmentLink).toHaveAttribute('href', '/student/assignments/assign2');
  });

  it('AC6: no muestra enlace al assignment cuando el estado es pending', async () => {
    renderPage();
    await screen.findByText('Web banco de alimentos');
    const links = screen.queryAllByRole('link', { name: /ver assignment/i });
    expect(links).toHaveLength(1);
  });

  it('AC7: approved con assignment sin matching project no muestra link', async () => {
    const appsWithNoMatchingAssignment = [
      {
        id: 'a3',
        status: 'approved',
        compatibility_score: 80,
        created_at: '2026-04-15T08:30:00Z',
        project_id: 'p999',
        project_title: 'Proyecto sin assignment',
        project_status: 'active',
      },
    ];
    getOwnApplications.mockResolvedValue(appsWithNoMatchingAssignment);
    getMyAssignments.mockResolvedValue(mockAssignments); // only has p1, p2
    renderPage();
    await screen.findByText('Proyecto sin assignment');
    const links = screen.queryAllByRole('link', { name: /ver assignment/i });
    expect(links).toHaveLength(0);
  });

  it('AC8: pending nunca muestra link aunque exista assignment', async () => {
    const appsPendingWithAssignment = [
      {
        id: 'a4',
        status: 'pending',
        compatibility_score: 75,
        created_at: '2026-04-16T09:00:00Z',
        project_id: 'p1',
        project_title: 'App pendiente con assignment',
        project_status: 'in_review',
      },
    ];
    getOwnApplications.mockResolvedValue(appsPendingWithAssignment);
    getMyAssignments.mockResolvedValue(mockAssignments); // has assignment for p1
    renderPage();
    await screen.findByText('App pendiente con assignment');
    const links = screen.queryAllByRole('link', { name: /ver assignment/i });
    expect(links).toHaveLength(0);
  });

  it('AC9: getMyAssignments es llamado junto con getOwnApplications', async () => {
    renderPage();
    await screen.findByText('Web banco de alimentos');
    expect(getMyAssignments).toHaveBeenCalledTimes(1);
  });
});
