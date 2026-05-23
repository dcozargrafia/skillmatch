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
    { skill_id: 's1', level: 'intermediate' },
    { skill_id: 's2', level: 'advanced' },
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
      handleChangeLevel: vi.fn().mockResolvedValue(undefined),
    });
    renderPage();
    expect(await screen.findByText('Ana López')).toBeInTheDocument();
    expect(screen.getByText('ana@test.com')).toBeInTheDocument();
  });

  it('AC2: muestra disponibilidad marcada, portfolio y skills con nivel en español', async () => {
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
      handleChangeLevel: vi.fn().mockResolvedValue(undefined),
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
      handleChangeLevel: vi.fn().mockResolvedValue(undefined),
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

  it('AC4a: agregar skill llama handleAddSkill con skillId y nivel seleccionado', async () => {
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
      handleChangeLevel: vi.fn().mockResolvedValue(undefined),
    });
    renderPage();
    await screen.findByText('Ana López');

    // Default level is 'basic' (básico displayed), select skill to add
    const skillSelect = screen.getByRole('combobox', { name: /agregar skill/i });
    fireEvent.change(skillSelect, { target: { value: 's3' } });

    await waitFor(() => expect(handleAddSkill).toHaveBeenCalledWith('s3', 'basic'));
  });

  it('AC4b: agregar skill con nivel diferente al default', async () => {
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
      handleChangeLevel: vi.fn().mockResolvedValue(undefined),
    });
    renderPage();
    await screen.findByText('Ana López');

    // Change level to 'advanced'
    const levelSelect = screen.getByRole('combobox', { name: /nivel del nuevo skill/i });
    fireEvent.change(levelSelect, { target: { value: 'advanced' } });

    // Select skill to add - should use advanced level
    const skillSelect = screen.getByRole('combobox', { name: /agregar skill/i });
    fireEvent.change(skillSelect, { target: { value: 's3' } });

    await waitFor(() => expect(handleAddSkill).toHaveBeenCalledWith('s3', 'advanced'));
  });

  it('AC4c: eliminar skill llama handleRemoveSkill', async () => {
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
      handleChangeLevel: vi.fn().mockResolvedValue(undefined),
    });
    renderPage();
    await screen.findByText('Ana López');

    const removeBtns = await screen.findAllByRole('button', { name: /eliminar/i });
    fireEvent.click(removeBtns[0]);

    await waitFor(() => expect(handleRemoveSkill).toHaveBeenCalledWith('s1'));
  });

  it('AC4d: cambiar nivel de skill llama handleChangeLevel con skillId y nuevo nivel', async () => {
    const handleChangeLevel = vi.fn().mockResolvedValue(undefined);
    useStudentProfile.mockReturnValue({
      profile: mockProfile,
      allSkills: mockAllSkills,
      availableSkills: [{ id: 's3', name: 'Python' }],
      loading: false,
      error: null,
      successMessage: '',
      handleSave: vi.fn().mockResolvedValue(undefined),
      handleAddSkill: vi.fn().mockResolvedValue(undefined),
      handleRemoveSkill: vi.fn().mockResolvedValue(undefined),
      handleChangeLevel,
    });
    renderPage();
    await screen.findByText('Ana López');

    // Find the level select for 'React' (skill s1)
    const levelSelect = screen.getByRole('combobox', { name: /nivel de react/i });
    fireEvent.change(levelSelect, { target: { value: 'advanced' } });

    await waitFor(() => expect(handleChangeLevel).toHaveBeenCalledWith('s1', 'advanced'));
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
      handleChangeLevel: vi.fn().mockResolvedValue(undefined),
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
      handleChangeLevel: vi.fn().mockResolvedValue(undefined),
    });
    renderPage();
    await screen.findByText(/error al cargar/i);
  });
});