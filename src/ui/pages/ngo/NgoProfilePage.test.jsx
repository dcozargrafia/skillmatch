import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import NgoProfilePage from './NgoProfilePage';

vi.mock('../../../ui/hooks/useNgoProfile.jsx', () => ({
  default: vi.fn(),
}));

import useNgoProfile from '../../../ui/hooks/useNgoProfile.jsx';

const mockProfileData = {
  ngo: {
    id: 'n1',
    user_id: 'u1',
    organization_name: 'Fundación Verde',
    area: 'Medio Ambiente',
    verified: true,
  },
  user: {
    id: 'u1',
    name: 'Juan Pérez',
    email: 'verde@ong.org',
  },
};

function setupHookMock(overrides = {}) {
  const defaults = {
    profile: null,
    loading: true,
    error: null,
    successMessage: '',
    handleSave: vi.fn(),
    ...overrides,
  };
  useNgoProfile.mockReturnValue(defaults);
}

beforeEach(() => {
  vi.resetAllMocks();
});

describe('NgoProfilePage — useNgoProfile hook integration', () => {
  it('AC1: carga datos desde el hook al montar', async () => {
    setupHookMock({ profile: mockProfileData, loading: false });
    render(<NgoProfilePage />);
    expect(await screen.findByDisplayValue('Fundación Verde')).toBeInTheDocument();
  });

  it('AC2: muestra nombre, email, organization_name, area e indicador de verificación', async () => {
    setupHookMock({ profile: mockProfileData, loading: false });
    render(<NgoProfilePage />);
    await screen.findByDisplayValue('Fundación Verde');
    expect(screen.getByDisplayValue('Juan Pérez')).toBeInTheDocument();
    expect(screen.getByDisplayValue('verde@ong.org')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Medio Ambiente')).toBeInTheDocument();
    expect(screen.getByText(/verificada/i)).toBeInTheDocument();
  });

  it('AC3: permite editar organization_name y area y llama handleSave', async () => {
    const handleSave = vi.fn();
    setupHookMock({ profile: mockProfileData, loading: false, handleSave });
    render(<NgoProfilePage />);
    await screen.findByDisplayValue('Fundación Verde');

    const orgInput = screen.getByDisplayValue('Fundación Verde');
    fireEvent.change(orgInput, { target: { value: 'Fundación Verde 2' } });

    const areaInput = screen.getByDisplayValue('Medio Ambiente');
    fireEvent.change(areaInput, { target: { value: 'Educación' } });

    fireEvent.click(screen.getByRole('button', { name: /guardar perfil/i }));

    await waitFor(() =>
      expect(handleSave).toHaveBeenCalledWith({
        name: 'Juan Pérez',
        email: 'verde@ong.org',
        organization_name: 'Fundación Verde 2',
        area: 'Educación',
      })
    );
  });

  it('AC4: permite editar name y email y llama handleSave', async () => {
    const handleSave = vi.fn();
    setupHookMock({ profile: mockProfileData, loading: false, handleSave });
    render(<NgoProfilePage />);
    await screen.findByDisplayValue('Fundación Verde');

    const nameInput = screen.getByRole('textbox', { name: /nombre de contacto/i });
    fireEvent.change(nameInput, { target: { value: 'Nuevo Nombre' } });

    const emailInput = screen.getByRole('textbox', { name: /email/i });
    fireEvent.change(emailInput, { target: { value: 'nuevo@ong.org' } });

    fireEvent.click(screen.getByRole('button', { name: /guardar perfil/i }));

    await waitFor(() =>
      expect(handleSave).toHaveBeenCalledWith({
        name: 'Nuevo Nombre',
        email: 'nuevo@ong.org',
        organization_name: 'Fundación Verde',
        area: 'Medio Ambiente',
      })
    );
  });

  it('AC5: muestra mensaje de éxito tras guardar', async () => {
    setupHookMock({ profile: mockProfileData, loading: false, successMessage: 'Perfil actualizado correctamente.' });
    render(<NgoProfilePage />);
    await screen.findByDisplayValue('Fundación Verde');
    fireEvent.click(screen.getByRole('button', { name: /guardar perfil/i }));
    await screen.findByText(/perfil actualizado/i);
  });

  it('AC6a: muestra aviso informativo si la ONG no está verificada', async () => {
    setupHookMock({
      profile: { ...mockProfileData, ngo: { ...mockProfileData.ngo, verified: false } },
      loading: false,
    });
    render(<NgoProfilePage />);
    await screen.findByDisplayValue('Fundación Verde');
    expect(screen.getByRole('status')).toHaveTextContent(/pendiente de verificación/i);
  });

  it('AC6b: no muestra aviso si la ONG está verificada', async () => {
    setupHookMock({ profile: mockProfileData, loading: false });
    render(<NgoProfilePage />);
    await screen.findByDisplayValue('Fundación Verde');
    expect(screen.queryByText(/pendiente de verificación/i)).not.toBeInTheDocument();
  });

  it('AC7a: muestra error si hook reporta error', async () => {
    setupHookMock({ profile: mockProfileData, loading: false, error: 'Error al actualizar el perfil. Intenta de nuevo.' });
    render(<NgoProfilePage />);
    await screen.findByDisplayValue('Fundación Verde');
    fireEvent.click(screen.getByRole('button', { name: /guardar perfil/i }));
    await screen.findByText(/error al actualizar/i);
  });

  it('AC7b: muestra error si getNgoMe falla al cargar', async () => {
    setupHookMock({ loading: false, error: 'No autorizado' });
    render(<NgoProfilePage />);
    await screen.findByText(/no autorizado/i);
  });
});