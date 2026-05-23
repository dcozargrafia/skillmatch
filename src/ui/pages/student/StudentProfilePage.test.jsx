import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import StudentProfilePage from './StudentProfilePage';

vi.mock('../../../ui/hooks/useStudentProfile.jsx', () => ({
  default: vi.fn(),
}));

import useStudentProfile from '../../../ui/hooks/useStudentProfile.jsx';

const mockProfile = {
  id: 'u1',
  name: 'Ana López',
  email: 'ana@test.com',
  disponibilidad: true,
  portfolio_url: 'https://portfolio.dev',
  skills: [
    { skill_id: 's1', level: 'intermedio' },
    { skill_id: 's2', level: 'avanzado' },
  ],
};

const mockAllSkills = [
  { id: 's1', name: 'React' },
  { id: 's2', name: 'Node.js' },
  { id: 's3', name: 'Python' },
];

const mockAvailableSkills = [
  { id: 's3', name: 'Python' },
];

function renderPage() {
  return render(<StudentProfilePage />);
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('StudentProfilePage', () => {
  it('AC1: carga y muestra datos del perfil al montar', async () => {
    useStudentProfile.mockReturnValue({
      profile: mockProfile,
      allSkills: mockAllSkills,
      availableSkills: mockAvailableSkills,
      loading: false,
      error: null,
      successMessage: '',
      handleSave: vi.fn().mockResolvedValue(undefined),
      handleAddSkill: vi.fn().mockResolvedValue(undefined),
      handleRemoveSkill: vi.fn().mockResolvedValue(undefined),
    });
    renderPage();
    expect(await screen.findByText('Ana López')).toBeInTheDocument();
    expect(screen.getByText('ana@test.com')).toBeInTheDocument();
  });

  it('AC2: muestra disponibilidad marcada, portfolio y skills con nivel', async () => {
    useStudentProfile.mockReturnValue({
      profile: mockProfile,
      allSkills: mockAllSkills,
      availableSkills: mockAvailableSkills,
      loading: false,
      error: null,
      successMessage: '',
      handleSave: vi.fn().mockResolvedValue(undefined),
      handleAddSkill: vi.fn().mockResolvedValue(undefined),
      handleRemoveSkill: vi.fn().mockResolvedValue(undefined),
    });
    renderPage();
    await screen.findByText('Ana López');

    const toggle = screen.getByRole('checkbox', { name: /disponibilidad/i });
    expect(toggle).toBeChecked();
    expect(screen.getByDisplayValue('https://portfolio.dev')).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getAllByText('intermedio').length).toBeGreaterThan(0);
    expect(screen.getByText('Node.js')).toBeInTheDocument();
    expect(screen.getAllByText('avanzado').length).toBeGreaterThan(0);
  });

  it('AC3: editar disponibilidad y portfolio y llamar handleSave al guardar', async () => {
    const handleSave = vi.fn().mockResolvedValue(undefined);
    useStudentProfile.mockReturnValue({
      profile: mockProfile,
      allSkills: mockAllSkills,
      availableSkills: mockAvailableSkills,
      loading: false,
      error: null,
      successMessage: '',
      handleSave,
      handleAddSkill: vi.fn().mockResolvedValue(undefined),
      handleRemoveSkill: vi.fn().mockResolvedValue(undefined),
    });
    renderPage();
    await screen.findByText('Ana López');

    const toggle = screen.getByRole('checkbox', { name: /disponibilidad/i });
    fireEvent.click(toggle);

    const portfolioInput = screen.getByDisplayValue('https://portfolio.dev');
    fireEvent.change(portfolioInput, { target: { value: 'https://new-portfolio.dev' } });

    const saveBtn = screen.getByRole('button', { name: /guardar perfil/i });
    fireEvent.click(saveBtn);

    await waitFor(() =>
      expect(handleSave).toHaveBeenCalledWith({
        disponibilidad: false,
        portfolio_url: 'https://new-portfolio.dev',
      })
    );
  });

  it('AC4a: agregar skill llama handleAddSkill con skillId y nivel', async () => {
    const handleAddSkill = vi.fn().mockResolvedValue(undefined);
    useStudentProfile.mockReturnValue({
      profile: mockProfile,
      allSkills: mockAllSkills,
      availableSkills: [{ id: 's3', name: 'Python' }],
      loading: false,
      error: null,
      successMessage: '',
      handleSave: vi.fn().mockResolvedValue(undefined),
      handleAddSkill,
      handleRemoveSkill: vi.fn().mockResolvedValue(undefined),
    });
    renderPage();
    await screen.findByText('Ana López');

    const skillSelect = screen.getByRole('combobox', { name: /agregar skill/i });
    fireEvent.change(skillSelect, { target: { value: 's3' } });

    await waitFor(() => expect(handleAddSkill).toHaveBeenCalledWith('s3', 'básico'));
  });

  it('AC4b: eliminar skill llama handleRemoveSkill', async () => {
    const handleRemoveSkill = vi.fn().mockResolvedValue(undefined);
    useStudentProfile.mockReturnValue({
      profile: mockProfile,
      allSkills: mockAllSkills,
      availableSkills: [{ id: 's3', name: 'Python' }],
      loading: false,
      error: null,
      successMessage: '',
      handleSave: vi.fn().mockResolvedValue(undefined),
      handleAddSkill: vi.fn().mockResolvedValue(undefined),
      handleRemoveSkill,
    });
    renderPage();
    await screen.findByText('Ana López');

    const removeBtns = await screen.findAllByRole('button', { name: /eliminar/i });
    fireEvent.click(removeBtns[0]);

    await waitFor(() => expect(handleRemoveSkill).toHaveBeenCalledWith('s1'));
  });

  it('AC5: muestra mensaje de éxito cuando successMessage no está vacío', async () => {
    useStudentProfile.mockReturnValue({
      profile: mockProfile,
      allSkills: mockAllSkills,
      availableSkills: mockAvailableSkills,
      loading: false,
      error: null,
      successMessage: 'Perfil actualizado correctamente.',
      handleSave: vi.fn().mockResolvedValue(undefined),
      handleAddSkill: vi.fn().mockResolvedValue(undefined),
      handleRemoveSkill: vi.fn().mockResolvedValue(undefined),
    });
    renderPage();
    await screen.findByText(/perfil actualizado/i);
  });

  it('AC6: muestra error cuando error no está vacío', async () => {
    useStudentProfile.mockReturnValue({
      profile: null,
      allSkills: [],
      availableSkills: [],
      loading: false,
      error: 'Error al cargar el perfil. Intenta de nuevo.',
      successMessage: '',
      handleSave: vi.fn().mockResolvedValue(undefined),
      handleAddSkill: vi.fn().mockResolvedValue(undefined),
      handleRemoveSkill: vi.fn().mockResolvedValue(undefined),
    });
    renderPage();
    await screen.findByText(/error al cargar/i);
  });
});