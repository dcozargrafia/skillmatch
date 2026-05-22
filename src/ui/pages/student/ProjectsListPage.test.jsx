import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import ProjectsListPage from './ProjectsListPage';

vi.mock('../../../infrastructure/api/projectApi.js', () => ({
  getAllProjects: vi.fn(),
}));

vi.mock('../../../infrastructure/api/skillsApi.js', () => ({
  getAllSkills: vi.fn(),
}));

import { getAllProjects } from '../../../infrastructure/api/projectApi.js';
import { getAllSkills } from '../../../infrastructure/api/skillsApi.js';

const mockProjects = [
  {
    id: 'p1',
    title: 'App de reciclaje',
    description: 'Desarrollar app para gestión de reciclaje',
    ngo: { name: 'Eco ONG' },
    modality: 'remoto',
    deadline: '2026-08-01',
    status: 'pending',
    skills: [{ skill_id: 's1', required_level: 'intermediate' }],
  },
  {
    id: 'p2',
    title: 'Web de donaciones',
    description: 'Portal de donaciones online',
    ngo: { name: 'Ayuda ONG' },
    modality: 'presencial',
    deadline: '2026-09-15',
    status: 'pending',
    skills: [{ skill_id: 's2', required_level: 'basic' }],
  },
];

const mockSkills = [
  { id: 's1', name: 'React' },
  { id: 's2', name: 'Node.js' },
];

function renderPage() {
  return render(
    <MemoryRouter>
      <ProjectsListPage />
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  getAllProjects.mockResolvedValue(mockProjects);
  getAllSkills.mockResolvedValue(mockSkills);
});

describe('ProjectsListPage', () => {
  it('AC1: carga proyectos con status=pending por defecto al montar', async () => {
    renderPage();
    await waitFor(() =>
      expect(getAllProjects).toHaveBeenCalledWith(expect.objectContaining({ status: 'pending' }))
    );
  });

  it('AC2: muestra tarjeta con título, descripción breve, ONG, modalidad, deadline y skills', async () => {
    renderPage();
    await screen.findByText('App de reciclaje');

    expect(screen.getByText('Desarrollar app para gestión de reciclaje')).toBeInTheDocument();
    expect(screen.getByText('Eco ONG')).toBeInTheDocument();
    expect(screen.getByText('remoto')).toBeInTheDocument();
    expect(screen.getByText('2026-08-01')).toBeInTheDocument();
    expect(screen.getAllByText('React').length).toBeGreaterThan(0);
  });

  it('AC3a: filtrar por status llama getAllProjects con el nuevo status', async () => {
    renderPage();
    await screen.findByText('App de reciclaje');

    const statusSelect = screen.getByRole('combobox', { name: /estado/i });
    fireEvent.change(statusSelect, { target: { value: 'assigned' } });

    await waitFor(() =>
      expect(getAllProjects).toHaveBeenCalledWith(expect.objectContaining({ status: 'assigned' }))
    );
  });

  it('AC3b: filtrar por skill llama getAllProjects con skill_id', async () => {
    renderPage();
    await screen.findByText('App de reciclaje');

    const skillSelect = screen.getByRole('combobox', { name: /skill/i });
    fireEvent.change(skillSelect, { target: { value: 's1' } });

    await waitFor(() =>
      expect(getAllProjects).toHaveBeenCalledWith(expect.objectContaining({ skill_id: 's1' }))
    );
  });

  it('AC4: clic en una tarjeta navega al detalle del proyecto', async () => {
    renderPage();
    const card = await screen.findByText('App de reciclaje');
    const link = card.closest('a') ?? screen.getByRole('link', { name: /App de reciclaje/i });
    expect(link).toHaveAttribute('href', '/student/projects/p1');
  });

  it('AC5: muestra estado vacío si no hay proyectos', async () => {
    getAllProjects.mockResolvedValue([]);
    renderPage();
    await screen.findByText(/no hay proyectos/i);
  });

  it('AC6: muestra indicador de carga mientras se obtienen los datos', async () => {
    getAllProjects.mockReturnValue(new Promise(() => {}));
    renderPage();
    expect(screen.getByText(/cargando/i)).toBeInTheDocument();
  });
});
