import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import StudentProfilePage from './StudentProfilePage';

vi.mock('../../../infrastructure/api/studentApi.js', () => ({
  getStudentMe: vi.fn(),
  updateStudentMe: vi.fn(),
  updateStudentSkills: vi.fn(),
}));

vi.mock('../../../infrastructure/api/skillsApi.js', () => ({
  getAllSkills: vi.fn(),
}));

import { getStudentMe, updateStudentMe, updateStudentSkills } from '../../../infrastructure/api/studentApi.js';
import { getAllSkills } from '../../../infrastructure/api/skillsApi.js';

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

beforeEach(() => {
  vi.clearAllMocks();
  getStudentMe.mockResolvedValue(mockProfile);
  getAllSkills.mockResolvedValue(mockAllSkills);
  updateStudentMe.mockResolvedValue({ ...mockProfile });
  updateStudentSkills.mockResolvedValue({ skills: mockProfile.skills });
});

describe('StudentProfilePage', () => {
  it('AC1: carga y muestra datos del perfil desde getStudentMe al montar', async () => {
    render(<StudentProfilePage />);
    await waitFor(() => expect(getStudentMe).toHaveBeenCalledTimes(1));
    expect(await screen.findByText('Ana López')).toBeInTheDocument();
    expect(screen.getByText('ana@test.com')).toBeInTheDocument();
  });

  it('AC2: muestra nombre, email, disponibilidad, portfolio y skills con nivel', async () => {
    render(<StudentProfilePage />);
    await screen.findByText('Ana López');

    expect(screen.getByText('ana@test.com')).toBeInTheDocument();

    const toggle = screen.getByRole('checkbox', { name: /disponibilidad/i });
    expect(toggle).toBeChecked();

    expect(screen.getByDisplayValue('https://portfolio.dev')).toBeInTheDocument();

    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getAllByText('intermedio').length).toBeGreaterThan(0);
    expect(screen.getByText('Node.js')).toBeInTheDocument();
    expect(screen.getAllByText('avanzado').length).toBeGreaterThan(0);
  });

  it('AC3: permite editar disponibilidad y portfolio_url y llama updateStudentMe al guardar', async () => {
    render(<StudentProfilePage />);
    await screen.findByText('Ana López');

    const toggle = screen.getByRole('checkbox', { name: /disponibilidad/i });
    fireEvent.click(toggle);

    const portfolioInput = screen.getByDisplayValue('https://portfolio.dev');
    fireEvent.change(portfolioInput, { target: { value: 'https://new-portfolio.dev' } });

    const saveBtn = screen.getByRole('button', { name: /guardar perfil/i });
    fireEvent.click(saveBtn);

    await waitFor(() =>
      expect(updateStudentMe).toHaveBeenCalledWith({
        disponibilidad: false,
        portfolio_url: 'https://new-portfolio.dev',
      })
    );
  });

  it('AC4a: permite agregar una skill desde el catálogo y llama updateStudentSkills', async () => {
    render(<StudentProfilePage />);
    await screen.findByText('Ana López');

    const skillSelect = screen.getByRole('combobox', { name: /agregar skill/i });
    fireEvent.change(skillSelect, { target: { value: 's3' } });

    const levelSelect = screen.getByRole('combobox', { name: /^nivel$/i });
    fireEvent.change(levelSelect, { target: { value: 'básico' } });

    const addBtn = screen.getByRole('button', { name: /agregar/i });
    fireEvent.click(addBtn);

    await waitFor(() =>
      expect(updateStudentSkills).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ skill_id: 's1' }),
          expect.objectContaining({ skill_id: 's2' }),
          expect.objectContaining({ skill_id: 's3', level: 'básico' }),
        ])
      )
    );
  });

  it('AC4b: permite eliminar una skill y llama updateStudentSkills', async () => {
    render(<StudentProfilePage />);
    await screen.findByText('Ana López');

    const removeBtns = await screen.findAllByRole('button', { name: /eliminar/i });
    fireEvent.click(removeBtns[0]);

    await waitFor(() =>
      expect(updateStudentSkills).toHaveBeenCalledWith([
        expect.objectContaining({ skill_id: 's2' }),
      ])
    );
  });

  it('AC4c: permite cambiar el nivel de una skill existente y llama updateStudentSkills', async () => {
    render(<StudentProfilePage />);
    await screen.findByText('Ana López');

    const levelSelects = await screen.findAllByRole('combobox', { name: /nivel de/i });
    fireEvent.change(levelSelects[0], { target: { value: 'avanzado' } });

    await waitFor(() =>
      expect(updateStudentSkills).toHaveBeenCalledWith([
        { skill_id: 's1', level: 'avanzado' },
        { skill_id: 's2', level: 'avanzado' },
      ])
    );
  });

  it('AC5: muestra mensaje de éxito después de guardar perfil', async () => {
    render(<StudentProfilePage />);
    await screen.findByText('Ana López');

    fireEvent.click(screen.getByRole('button', { name: /guardar perfil/i }));

    await screen.findByText(/perfil actualizado/i);
  });

  it('AC6: muestra error visible si updateStudentMe falla', async () => {
    updateStudentMe.mockRejectedValueOnce(new Error('Error de red'));
    render(<StudentProfilePage />);
    await screen.findByText('Ana López');

    fireEvent.click(screen.getByRole('button', { name: /guardar perfil/i }));

    await screen.findByText(/error al actualizar/i);
  });

  it('AC6b: muestra error visible si getStudentMe falla', async () => {
    getStudentMe.mockRejectedValueOnce(new Error('No autorizado'));
    render(<StudentProfilePage />);

    await screen.findByText(/error al cargar/i);
  });
});
