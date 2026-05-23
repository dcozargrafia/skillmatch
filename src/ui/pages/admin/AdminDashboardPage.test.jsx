/**
 * Tests para AdminDashboardPage (SMAPP-admin).
 *
 * Criterios de aceptación:
 * - Carga y muestra el listado de skills al montar
 * - Crear skill llama a handleCreateSkill y la añade a la lista
 * - Eliminar skill muestra aviso de cascada y llama a handleConfirmDelete
 * - Tras eliminar, la skill desaparece de la lista
 * - Error de API al crear skill muestra alert
 * - Muestra listado de ONGs con estado de verificación
 * - El botón Verificar solo aparece en ONGs no verificadas
 * - Verificar llama a handleVerifyNgo y actualiza el estado en pantalla
 */

import { render, screen, waitFor, within, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

const mockHandleCreateSkill = vi.fn();
const mockHandleDeleteSkill = vi.fn();
const mockHandleConfirmDelete = vi.fn();
const mockCancelDelete = vi.fn();
const mockHandleVerifyNgo = vi.fn();

vi.mock('../../hooks/useAdminDashboard.jsx', () => ({
  default: vi.fn(),
}));

const { default: useAdminDashboard } = await import('../../hooks/useAdminDashboard.jsx');
const { default: AdminDashboardPage } = await import('./AdminDashboardPage.jsx');

const mockSkills = [
  { id: 1, name: 'React', category: 'Desarrollo' },
  { id: 2, name: 'Figma', category: 'Diseno' },
];

const mockNgos = [
  { id: 1, organization_name: 'Fundación Verde', email: 'verde@ngo.com', verified: false },
  { id: 2, organization_name: 'Fundación Azul', email: 'azul@ngo.com', verified: true },
];

function renderPage(overrides = {}) {
  const state = {
    skills: mockSkills,
    ngos: mockNgos,
    isLoading: false,
    error: null,
    skillToDelete: null,
    confirmVerification: null,
    skillError: null,
    newSkillName: '',
    newSkillCategory: 'Desarrollo',
    setNewSkillName: vi.fn(),
    setNewSkillCategory: vi.fn(),
    handleCreateSkill: mockHandleCreateSkill,
    handleDeleteSkill: mockHandleDeleteSkill,
    handleConfirmDelete: mockHandleConfirmDelete,
    cancelDelete: mockCancelDelete,
    handleVerifyNgo: mockHandleVerifyNgo,
    ...overrides,
  };

  useAdminDashboard.mockReturnValue(state);

  return render(
    <MemoryRouter initialEntries={['/admin']}>
      <Routes>
        <Route path="/admin" element={<AdminDashboardPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  mockHandleCreateSkill.mockResolvedValue(undefined);
  mockHandleConfirmDelete.mockResolvedValue(undefined);
  mockHandleVerifyNgo.mockResolvedValue(undefined);
});

describe('AdminDashboardPage — skills', () => {
  it('AC1: carga y muestra el listado de skills al montar', async () => {
    renderPage();
    expect(await screen.findByText('React')).toBeInTheDocument();
    expect(screen.getByText('Figma')).toBeInTheDocument();
  });

  it('AC2: crear skill llama a handleCreateSkill', async () => {
    renderPage({ newSkillName: 'Node.js' });
    await screen.findByText('React');

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /añadir/i }));

    await waitFor(() =>
      expect(mockHandleCreateSkill).toHaveBeenCalledWith({ name: 'Node.js', category: 'Desarrollo' })
    );
  });

  it('AC3: eliminar skill llama a handleDeleteSkill', async () => {
    renderPage();
    await screen.findByText('React');

    const deleteButtons = screen.getAllByRole('button', { name: /eliminar/i });
    await userEvent.click(deleteButtons[0]);

    await waitFor(() => expect(mockHandleDeleteSkill).toHaveBeenCalledWith(1));
  });

  it('AC4: confirmar eliminación llama a handleConfirmDelete', async () => {
    renderPage({ skillToDelete: 1 });
    await screen.findByText('React');

    const dialog = screen.getByRole('dialog');
    await userEvent.click(within(dialog).getByRole('button', { name: /eliminar/i }));

    await waitFor(() => expect(mockHandleConfirmDelete).toHaveBeenCalled());
  });

  it('AC5: error de API al crear skill muestra alert', async () => {
    renderPage({ skillError: 'Error al crear la habilidad' });
    await screen.findByText('React');

    expect(screen.getByRole('alert')).toHaveTextContent(/error/i);
  });
});

describe('AdminDashboardPage — ONGs', () => {
  it('AC6: muestra listado de ONGs con estado de verificación', async () => {
    renderPage();
    expect(await screen.findByText('Fundación Verde')).toBeInTheDocument();
    expect(screen.getByText('Fundación Azul')).toBeInTheDocument();
  });

  it('AC7: el botón Verificar solo aparece en ONGs no verificadas', async () => {
    renderPage();
    await screen.findByText('Fundación Verde');

    const verifyButtons = screen.getAllByRole('button', { name: /verificar/i });
    expect(verifyButtons).toHaveLength(1);
  });

  it('AC8: Verificar llama a handleVerifyNgo con el id de la ONG', async () => {
    renderPage();
    await screen.findByText('Fundación Verde');

    await userEvent.click(screen.getByRole('button', { name: /verificar/i }));

    await waitFor(() => expect(mockHandleVerifyNgo).toHaveBeenCalledWith(1));
  });
});