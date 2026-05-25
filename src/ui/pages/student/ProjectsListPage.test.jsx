import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import ProjectsListPage from './ProjectsListPage';

vi.mock('../../../ui/hooks/useStudentProjects.jsx', () => ({
  default: vi.fn(),
}));

import useStudentProjects from '../../../ui/hooks/useStudentProjects.jsx';

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
});

describe('ProjectsListPage', () => {
  it('AC1: carga proyectos sin filtro de status al montar', async () => {
    useStudentProjects.mockReturnValue({
      projects: mockProjects,
      skills: mockSkills,
      loading: false,
      error: null,
      selectedSkillId: '',
      setSelectedSkillId: vi.fn(),
      refresh: vi.fn(),
    });
    renderPage();
    await screen.findByText('App de reciclaje');
    expect(screen.getByText('App de reciclaje')).toBeInTheDocument();
  });

  it('AC2: muestra tarjeta con título, descripción, ONG, modalidad, deadline y skills', async () => {
    useStudentProjects.mockReturnValue({
      projects: mockProjects,
      skills: mockSkills,
      loading: false,
      error: null,
      selectedSkillId: '',
      setSelectedSkillId: vi.fn(),
      refresh: vi.fn(),
    });
    renderPage();
    await screen.findByText('App de reciclaje');
    expect(screen.getByText('Desarrollar app para gestión de reciclaje')).toBeInTheDocument();
    expect(screen.getByText('Eco ONG')).toBeInTheDocument();
    expect(screen.getByText('remoto')).toBeInTheDocument();
    expect(screen.getByText('01/08/2026')).toBeInTheDocument();
    expect(screen.getAllByText('React').length).toBeGreaterThan(0);
  });

  it('AC3b: filtrar por skill llama setSelectedSkillId', async () => {
    const setSelectedSkillId = vi.fn();
    useStudentProjects.mockReturnValue({
      projects: mockProjects,
      skills: mockSkills,
      loading: false,
      error: null,
      selectedSkillId: '',
      setSelectedSkillId,
      refresh: vi.fn(),
    });
    renderPage();
    await screen.findByText('App de reciclaje');

    const skillSelect = screen.getByRole('combobox', { name: /skill/i });
    fireEvent.change(skillSelect, { target: { value: 's1' } });

    expect(setSelectedSkillId).toHaveBeenCalledWith('s1');
  });

  it('AC4: clic en una tarjeta navega al detalle del proyecto', async () => {
    useStudentProjects.mockReturnValue({
      projects: mockProjects,
      skills: mockSkills,
      loading: false,
      error: null,
      selectedSkillId: '',
      setSelectedSkillId: vi.fn(),
      refresh: vi.fn(),
    });
    renderPage();
    const card = await screen.findByText('App de reciclaje');
    const link = card.closest('a') ?? screen.getByRole('link', { name: /App de reciclaje/i });
    expect(link).toHaveAttribute('href', '/student/projects/p1');
  });

  it('AC5: muestra estado vacío si no hay proyectos', async () => {
    useStudentProjects.mockReturnValue({
      projects: [],
      skills: mockSkills,
      loading: false,
      error: null,
      selectedSkillId: '',
      setSelectedSkillId: vi.fn(),
      refresh: vi.fn(),
    });
    renderPage();
    await screen.findByText(/no hay proyectos/i);
  });

});
