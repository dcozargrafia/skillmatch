import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProjectDetailPage from './ProjectDetailPage';

vi.mock('../../../infrastructure/api/projectApi.js', () => ({
  getProjectById: vi.fn(),
}));

vi.mock('../../../infrastructure/api/applicationApi.js', () => ({
  createApplication: vi.fn(),
  getApplicationsByProject: vi.fn(),
}));

vi.mock('../../../infrastructure/api/skillsApi.js', () => ({
  getAllSkills: vi.fn(),
}));

import { getProjectById } from '../../../infrastructure/api/projectApi.js';
import { createApplication } from '../../../infrastructure/api/applicationApi.js';
import { getAllSkills } from '../../../infrastructure/api/skillsApi.js';

const mockSkills = [
  { id: 's1', name: 'React' },
  { id: 's2', name: 'Node.js' },
];

const mockProject = {
  id: 'p1',
  title: 'App de reciclaje',
  description: 'Desarrollar app para gestión de reciclaje',
  objectives: 'Reducir residuos un 30%',
  estimated_hours: 80,
  deadline: '2026-08-01',
  modality: 'remoto',
  status: 'pending',
  ngo: { name: 'Eco ONG' },
  skills: [
    { skill_id: 's1', required_level: 'intermediate' },
    { skill_id: 's2', required_level: 'basic' },
  ],
};

function renderPage(projectId = 'p1') {
  return render(
    <MemoryRouter initialEntries={[`/student/projects/${projectId}`]}>
      <Routes>
        <Route path="/student/projects/:id" element={<ProjectDetailPage />} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  getProjectById.mockResolvedValue(mockProject);
  createApplication.mockResolvedValue({ id: 'a1', status: 'pending' });
  getAllSkills.mockResolvedValue(mockSkills);
});

describe('ProjectDetailPage', () => {
  it('AC1: carga el proyecto desde getProjectById con el id de la URL', async () => {
    renderPage();
    await waitFor(() => expect(getProjectById).toHaveBeenCalledWith('p1'));
  });

  it('AC2: muestra título, descripción, objetivos, horas, deadline, modalidad, estado y skills', async () => {
    renderPage();
    await screen.findByText('App de reciclaje');

    expect(screen.getByText('Desarrollar app para gestión de reciclaje')).toBeInTheDocument();
    expect(screen.getByText('Reducir residuos un 30%')).toBeInTheDocument();
    expect(screen.getByText('80')).toBeInTheDocument();
    expect(screen.getByText('2026-08-01')).toBeInTheDocument();
    expect(screen.getByText('remoto')).toBeInTheDocument();
    expect(screen.getByText('pending')).toBeInTheDocument();
    expect(screen.getByText(/React/)).toBeInTheDocument();
    expect(screen.getByText(/Node\.js/)).toBeInTheDocument();
  });

  it('AC3: muestra botón Aplicar si el proyecto está en pending y el estudiante no ha aplicado', async () => {
    renderPage();
    await screen.findByText('App de reciclaje');

    expect(screen.getByRole('button', { name: /^aplicar a este proyecto$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^aplicar a este proyecto$/i })).not.toBeDisabled();
  });

  it('AC4: al clic en Aplicar llama a createApplication con el project_id', async () => {
    renderPage();
    await screen.findByText('App de reciclaje');

    fireEvent.click(screen.getByRole('button', { name: /^aplicar a este proyecto$/i }));

    await waitFor(() =>
      expect(createApplication).toHaveBeenCalledWith('p1')
    );
  });

  it('AC5: tras aplicar el botón cambia a "Ya has aplicado" y se deshabilita', async () => {
    renderPage();
    await screen.findByText('App de reciclaje');

    fireEvent.click(screen.getByRole('button', { name: /^aplicar a este proyecto$/i }));

    await screen.findByRole('button', { name: /ya has aplicado/i });
    expect(screen.getByRole('button', { name: /ya has aplicado/i })).toBeDisabled();
  });

  it('AC6: si el backend responde 409 el botón cambia a "Ya has aplicado" deshabilitado', async () => {
    createApplication.mockRejectedValueOnce(
      Object.assign(new Error('Conflict'), { response: { status: 409 } })
    );
    renderPage();
    await screen.findByText('App de reciclaje');

    fireEvent.click(screen.getByRole('button', { name: /^aplicar a este proyecto$/i }));

    await screen.findByRole('button', { name: /ya has aplicado/i });
    expect(screen.getByRole('button', { name: /ya has aplicado/i })).toBeDisabled();
  });

  it('AC7: no muestra el botón Aplicar si el proyecto no está en pending', async () => {
    getProjectById.mockResolvedValue({ ...mockProject, status: 'assigned' });
    renderPage();
    await screen.findByText('App de reciclaje');

    expect(screen.queryByRole('button', { name: /^aplicar a este proyecto$/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /ya has aplicado/i })).not.toBeInTheDocument();
  });

  it('AC8: muestra error visible si createApplication falla con error distinto de 409', async () => {
    createApplication.mockRejectedValueOnce(
      Object.assign(new Error('Server Error'), { response: { status: 500 } })
    );
    renderPage();
    await screen.findByText('App de reciclaje');

    fireEvent.click(screen.getByRole('button', { name: /^aplicar a este proyecto$/i }));

    await screen.findByRole('alert');
  });
});
