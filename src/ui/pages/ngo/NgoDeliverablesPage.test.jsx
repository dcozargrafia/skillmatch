import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import NgoDeliverablesPage from './NgoDeliverablesPage';

vi.mock('../../../infrastructure/api/deliverableApi.js', () => ({
  getDeliverablesByAssignment: vi.fn(),
  createDeliverable: vi.fn(),
  reviewDeliverable: vi.fn(),
}));

vi.mock('../../../ui/hooks/useProjectDetail.jsx', () => ({
  default: vi.fn(),
}));

import useProjectDetail from '../../../ui/hooks/useProjectDetail.jsx';
import {
  getDeliverablesByAssignment,
  createDeliverable,
  reviewDeliverable,
} from '../../../infrastructure/api/deliverableApi.js';

const mockDeliverables = [
  { id: 'd1', title: 'Diseño de BD', status: 'pending', description: 'Esquema inicial' },
  { id: 'd2', title: 'Backend API', status: 'in_review', description: 'Endpoints REST', file_url: 'https://example.com/api.pdf' },
  { id: 'd3', title: 'Frontend', status: 'approved', description: 'UI completa' },
];

function setupProjectDetailHook(overrides = {}) {
  const defaults = {
    project: { id: 'p1', title: 'Test Project' },
    assignment: { id: 'asgn1' },
    deliverables: mockDeliverables,
    applications: [],
    loading: false,
    error: null,
    actions: {
      handleReview: vi.fn().mockResolvedValue(true),
      handleCreateDeliverable: vi.fn().mockResolvedValue({ id: 'd4', title: 'Nuevo hito', status: 'pending', description: '' }),
      handleSelectCandidate: vi.fn(),
      handleCancelProject: vi.fn(),
      handleMarkCompleted: vi.fn(),
    },
  };
  useProjectDetail.mockReturnValue({ ...defaults, ...overrides });
}

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/ngo/projects/p1/assignments/asgn1/deliverables']}>
      <Routes>
        <Route
          path="/ngo/projects/:projectId/assignments/:assignmentId/deliverables"
          element={<NgoDeliverablesPage />}
        />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  getDeliverablesByAssignment.mockResolvedValue(mockDeliverables);
  createDeliverable.mockResolvedValue({ id: 'd4', title: 'Nuevo hito', status: 'pending', description: '' });
  reviewDeliverable.mockResolvedValue({ id: 'd2', title: 'Backend API', status: 'approved' });
  setupProjectDetailHook();
});

describe('NgoDeliverablesPage', () => {
  it('AC1: carga entregables desde useProjectDetail al montar', async () => {
    renderPage();
    await waitFor(() => expect(useProjectDetail).toHaveBeenCalledWith('p1'));
    expect(await screen.findByText('Diseño de BD')).toBeInTheDocument();
  });

  it('AC2: muestra título y estado de cada entregable con labels en español', async () => {
    renderPage();
    await screen.findByText('Diseño de BD');
    expect(screen.getByText('Backend API')).toBeInTheDocument();
    expect(screen.getByText('Frontend')).toBeInTheDocument();
    // Should show Spanish labels, not raw status
    expect(screen.getByText('Pendiente')).toBeInTheDocument();
    expect(screen.getByText('En revisión')).toBeInTheDocument();
    expect(screen.getByText('Aprobado')).toBeInTheDocument();
  });

  it('AC3: el formulario de nuevo hito llama a handleCreateDeliverable con title y description', async () => {
    renderPage();
    await screen.findByText('Diseño de BD');
    fireEvent.change(screen.getByRole('textbox', { name: /título del hito/i }), {
      target: { value: 'Nuevo hito' },
    });
    fireEvent.click(screen.getByRole('button', { name: /añadir hito/i }));
    await waitFor(() =>
      expect(useProjectDetail().actions.handleCreateDeliverable).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Nuevo hito' })
      )
    );
  });

  it('AC4: el formulario se limpia tras crear un nuevo hito', async () => {
    renderPage();
    await screen.findByText('Diseño de BD');
    const titleInput = screen.getByRole('textbox', { name: /título del hito/i });
    fireEvent.change(titleInput, {
      target: { value: 'Nuevo hito' },
    });
    fireEvent.click(screen.getByRole('button', { name: /añadir hito/i }));
    await waitFor(() => expect(titleInput.value).toBe(''));
  });

  it('AC5: los botones Aprobar y Rechazar solo aparecen en entregables in_review', async () => {
    renderPage();
    await screen.findByText('Backend API');
    expect(screen.getByRole('button', { name: /aprobar/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /rechazar/i })).toBeInTheDocument();
    // pending y approved no tienen botones de revisión
    expect(screen.getAllByRole('button', { name: /aprobar/i })).toHaveLength(1);
  });

  it('AC6: Aprobar llama a handleReview con approved y actualiza estado', async () => {
    renderPage();
    await screen.findByText('Backend API');
    fireEvent.click(screen.getByRole('button', { name: /aprobar/i }));
    await waitFor(() =>
      expect(useProjectDetail().actions.handleReview).toHaveBeenCalledWith('d2', 'approved')
    );
  });

  it('AC7: Rechazar llama a handleReview con rejected', async () => {
    useProjectDetail().actions.handleReview.mockResolvedValueOnce(true);
    renderPage();
    await screen.findByText('Backend API');
    fireEvent.click(screen.getByRole('button', { name: /rechazar/i }));
    await waitFor(() =>
      expect(useProjectDetail().actions.handleReview).toHaveBeenCalledWith('d2', 'rejected')
    );
  });

  it('AC8: muestra error si handleReview falla', async () => {
    useProjectDetail().actions.handleReview.mockResolvedValueOnce(false);
    renderPage();
    await screen.findByText('Backend API');
    fireEvent.click(screen.getByRole('button', { name: /aprobar/i }));
    await screen.findByRole('alert');
  });
});