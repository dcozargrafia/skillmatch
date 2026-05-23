import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import NgoProjectsPage from './NgoProjectsPage';

vi.mock('../../../ui/hooks/useNgoProjects.jsx', () => ({
  default: vi.fn(),
}));

import useNgoProjects from '../../../ui/hooks/useNgoProjects.jsx';

const mockProjects = [
  { id: 'p1', title: 'Web banco de alimentos', status: 'in_review', modality: 'remoto', deadline: '2026-09-30' },
  { id: 'p2', title: 'Campaña digital refugio', status: 'pending', modality: 'híbrido', deadline: '2026-08-15' },
];

function setupHookMock(overrides = {}) {
  const defaults = {
    projects: [],
    loading: true,
    error: null,
    refresh: vi.fn(),
    ...overrides,
  };
  useNgoProjects.mockReturnValue(defaults);
}

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/ngo/projects']}>
      <Routes>
        <Route path="/ngo/projects" element={<NgoProjectsPage />} />
        <Route path="/ngo/projects/new" element={<div>NuevoProyecto</div>} />
        <Route path="/ngo/projects/:id" element={<div>Detalle</div>} />
        <Route path="/ngo/projects/:id/edit" element={<div>EditarProyecto</div>} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.resetAllMocks();
  setupHookMock({ projects: mockProjects, loading: false });
});

describe('NgoProjectsPage — useNgoProjects hook integration', () => {
  it('muestra loading cuando el hook está cargando', () => {
    setupHookMock({ loading: true, projects: [] });
    renderPage();
    expect(screen.getByText(/cargando/i)).toBeInTheDocument();
  });

  it('carga proyectos desde el hook', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByText('Web banco de alimentos')).toBeInTheDocument());
  });

  it('muestra título, estado, modalidad y deadline de cada proyecto', async () => {
    renderPage();
    await screen.findByText('Web banco de alimentos');
    expect(screen.getByText('in_review')).toBeInTheDocument();
    expect(screen.getByText('Campaña digital refugio')).toBeInTheDocument();
    expect(screen.getByText('pending')).toBeInTheDocument();
  });

  it('muestra estado vacío si no hay proyectos', async () => {
    setupHookMock({ loading: false, projects: [] });
    renderPage();
    await screen.findByText(/no tienes proyectos/i);
  });

  it('tiene enlace a crear nuevo proyecto', async () => {
    renderPage();
    await screen.findByText('Web banco de alimentos');
    const link = screen.getByRole('link', { name: /nuevo proyecto/i });
    expect(link).toHaveAttribute('href', '/ngo/projects/new');
  });

  it('cada proyecto tiene enlace a su formulario de edición', async () => {
    renderPage();
    await screen.findByText('Web banco de alimentos');
    const editLinks = screen.getAllByRole('link', { name: /editar/i });
    expect(editLinks[0]).toHaveAttribute('href', '/ngo/projects/p1/edit');
  });

  it('cada proyecto tiene enlace a su detalle con href correcto', async () => {
    renderPage();
    await screen.findByText('Web banco de alimentos');
    const detailLinks = screen.getAllByRole('link', { name: /ver detalle/i });
    expect(detailLinks[0]).toHaveAttribute('href', '/ngo/projects/p1');
    expect(detailLinks[1]).toHaveAttribute('href', '/ngo/projects/p2');
  });

  it('no muestra botón de Candidatos en cards de proyecto', async () => {
    renderPage();
    await screen.findByText('Web banco de alimentos');
    expect(screen.queryByRole('link', { name: /candidatos/i })).not.toBeInTheDocument();
  });

  it('estado vacío no muestra enlace a detalle', async () => {
    setupHookMock({ loading: false, projects: [] });
    renderPage();
    await screen.findByText(/no tienes proyectos/i);
    expect(screen.queryByRole('link', { name: /ver detalle/i })).not.toBeInTheDocument();
  });
});