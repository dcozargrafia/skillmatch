import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProjectDetailPage from './ProjectDetailPage';

vi.mock('../../../ui/hooks/useStudentProjectDetail.jsx', () => ({
  default: vi.fn(),
}));

import useStudentProjectDetail from '../../../ui/hooks/useStudentProjectDetail.jsx';

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
});

describe('ProjectDetailPage', () => {
  it('AC1: carga el proyecto con el id de la URL', async () => {
    useStudentProjectDetail.mockReturnValue({
      project: mockProject,
      skills: mockSkills,
      applied: false,
      loading: false,
      error: null,
      successMessage: '',
      handleApply: vi.fn(),
    });
    renderPage();
    await screen.findByText('App de reciclaje');
    expect(screen.getByText('App de reciclaje')).toBeInTheDocument();
  });

  it('AC2: muestra título, descripción, objetivos, horas, deadline, modalidad, estado y skills', async () => {
    useStudentProjectDetail.mockReturnValue({
      project: mockProject,
      skills: mockSkills,
      applied: false,
      loading: false,
      error: null,
      successMessage: '',
      handleApply: vi.fn(),
    });
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

  it('AC3: muestra botón Aplicar si el proyecto está en pending y no ha aplicado', async () => {
    useStudentProjectDetail.mockReturnValue({
      project: mockProject,
      skills: mockSkills,
      applied: false,
      loading: false,
      error: null,
      successMessage: '',
      handleApply: vi.fn(),
    });
    renderPage();
    await screen.findByText('App de reciclaje');
    expect(screen.getByRole('button', { name: /^aplicar a este proyecto$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^aplicar a este proyecto$/i })).not.toBeDisabled();
  });

  it('AC4: al clic en Aplicar llama a handleApply', async () => {
    const handleApply = vi.fn().mockResolvedValue(undefined);
    useStudentProjectDetail.mockReturnValue({
      project: mockProject,
      skills: mockSkills,
      applied: false,
      loading: false,
      error: null,
      successMessage: '',
      handleApply,
    });
    renderPage();
    await screen.findByText('App de reciclaje');
    fireEvent.click(screen.getByRole('button', { name: /^aplicar a este proyecto$/i }));
    await waitFor(() => expect(handleApply).toHaveBeenCalled());
  });

  it('AC5: tras aplicar el botón cambia a "Ya has aplicado" y se deshabilita', async () => {
    useStudentProjectDetail.mockReturnValue({
      project: mockProject,
      skills: mockSkills,
      applied: true,
      loading: false,
      error: null,
      successMessage: 'Te has postulado al proyecto correctamente.',
      handleApply: vi.fn(),
    });
    renderPage();
    await screen.findByText('App de reciclaje');
    expect(screen.getByRole('button', { name: /ya has aplicado/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ya has aplicado/i })).toBeDisabled();
  });

  it('AC6: muestra mensaje de éxito tras aplicar', async () => {
    useStudentProjectDetail.mockReturnValue({
      project: mockProject,
      skills: mockSkills,
      applied: true,
      loading: false,
      error: null,
      successMessage: 'Te has postulado al proyecto correctamente.',
      handleApply: vi.fn(),
    });
    renderPage();
    await screen.findByText(/te has postulado/i);
  });

  it('AC7: no muestra el botón Aplicar si el proyecto no está en pending', async () => {
    useStudentProjectDetail.mockReturnValue({
      project: { ...mockProject, status: 'assigned' },
      skills: mockSkills,
      applied: false,
      loading: false,
      error: null,
      successMessage: '',
      handleApply: vi.fn(),
    });
    renderPage();
    await screen.findByText('App de reciclaje');
    expect(screen.queryByRole('button', { name: /^aplicar a este proyecto$/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /ya has aplicado/i })).not.toBeInTheDocument();
  });

  it('AC8: muestra error visible si handleApply falla', async () => {
    useStudentProjectDetail.mockReturnValue({
      project: mockProject,
      skills: mockSkills,
      applied: false,
      loading: false,
      error: 'Error al aplicarse al proyecto. Intenta de nuevo.',
      successMessage: '',
      handleApply: vi.fn(),
    });
    renderPage();
    await screen.findByText('App de reciclaje');
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
});