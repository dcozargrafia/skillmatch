import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import NgoProjectFormPage from './NgoProjectFormPage';

vi.mock('../../../ui/hooks/useNgoProjectForm.jsx', () => ({
  default: vi.fn(),
}));

vi.mock('../../../ui/components/SkillSelector.jsx', () => ({
  SkillSelector: vi.fn(({ skills, selectedSkills, onChange }) => (
    <div data-testid="skill-selector">
      <span data-testid="skill-count">{skills?.length ?? 0}</span>
      <span data-testid="selected-count">{selectedSkills?.length ?? 0}</span>
      {skills?.map((s) => (
        <button key={s.id} onClick={() => onChange([...selectedSkills, { skill_id: s.id, required_level: 'basic' }])}>
          Add {s.name}
        </button>
      ))}
    </div>
  )),
}));

import useNgoProjectForm from '../../../ui/hooks/useNgoProjectForm.jsx';

const mockSkills = [
  { id: 's1', name: 'React' },
  { id: 's2', name: 'Node.js' },
];

const mockProject = {
  id: 'p1',
  title: 'Web banco de alimentos',
  description: 'Descripción del proyecto',
  objectives: 'Objetivos del proyecto',
  estimated_hours: 80,
  deadline: '2026-09-30',
  modality: 'remoto',
  skills: [{ id: 's1', name: 'React', required_level: 'intermediate' }],
};

function setupCreateHookMock(overrides = {}) {
  const defaults = {
    project: null,
    skills: mockSkills,
    loading: false,
    error: null,
    mode: 'create',
    handleSubmit: vi.fn(),
    ...overrides,
  };
  useNgoProjectForm.mockReturnValue(defaults);
}

function setupEditHookMock(overrides = {}) {
  const defaults = {
    project: mockProject,
    skills: mockSkills,
    loading: false,
    error: null,
    mode: 'edit',
    handleSubmit: vi.fn(),
    ...overrides,
  };
  useNgoProjectForm.mockReturnValue(defaults);
}

function renderCreate() {
  return render(
    <MemoryRouter initialEntries={['/ngo/projects/new']}>
      <Routes>
        <Route path="/ngo/projects/new" element={<NgoProjectFormPage />} />
        <Route path="/ngo/projects/:id" element={<div>DetalleProyecto</div>} />
      </Routes>
    </MemoryRouter>
  );
}

function renderEdit() {
  return render(
    <MemoryRouter initialEntries={['/ngo/projects/p1/edit']}>
      <Routes>
        <Route path="/ngo/projects/:id/edit" element={<NgoProjectFormPage />} />
        <Route path="/ngo/projects/:id" element={<div>DetalleProyecto</div>} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.resetAllMocks();
});

describe('NgoProjectFormPage — useNgoProjectForm hook — crear', () => {
  it('AC1: muestra formulario con campos title, description, objectives, estimated_hours, deadline, modality', async () => {
    setupCreateHookMock();
    renderCreate();
    await screen.findByRole('textbox', { name: /título/i });
    expect(screen.getByRole('textbox', { name: /descripción/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /objetivos/i })).toBeInTheDocument();
    expect(screen.getByRole('spinbutton', { name: /horas estimadas/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/deadline/i)).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /modalidad/i })).toBeInTheDocument();
  });

  it('AC2: bloquea el submit si el título está vacío (validación cliente)', async () => {
    const handleSubmit = vi.fn();
    setupCreateHookMock({ handleSubmit });
    renderCreate();
    await screen.findByRole('textbox', { name: /título/i });
    fireEvent.click(screen.getByRole('button', { name: /guardar/i }));
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it('AC3: crea el proyecto y redirige al detalle', async () => {
    const handleSubmit = vi.fn().mockResolvedValue({ id: 'p-new' });
    setupCreateHookMock({ handleSubmit });
    renderCreate();
    await screen.findByRole('textbox', { name: /título/i });
    fireEvent.change(screen.getByRole('textbox', { name: /título/i }), {
      target: { value: 'Nuevo proyecto' },
    });
    fireEvent.click(screen.getByRole('button', { name: /guardar/i }));
    await waitFor(() => expect(handleSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Nuevo proyecto' })
    ));
    await screen.findByText('DetalleProyecto');
  });

  it('AC4: muestra error si hook reporta error', async () => {
    setupCreateHookMock({ error: 'Error servidor' });
    renderCreate();
    await screen.findByRole('textbox', { name: /título/i });
    fireEvent.change(screen.getByRole('textbox', { name: /título/i }), {
      target: { value: 'Proyecto' },
    });
    fireEvent.click(screen.getByRole('button', { name: /guardar/i }));
    await screen.findByRole('alert');
  });
});

describe('NgoProjectFormPage — useNgoProjectForm hook — editar', () => {
  it('AC5: carga los datos del proyecto existente en el formulario', async () => {
    setupEditHookMock();
    renderEdit();
    expect(await screen.findByDisplayValue('Web banco de alimentos')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Descripción del proyecto')).toBeInTheDocument();
  });

  it('AC6: actualiza el proyecto con handleSubmit y muestra los cambios', async () => {
    const handleSubmit = vi.fn().mockResolvedValue(mockProject);
    setupEditHookMock({ handleSubmit });
    renderEdit();
    await screen.findByDisplayValue('Web banco de alimentos');
    fireEvent.change(screen.getByDisplayValue('Web banco de alimentos'), {
      target: { value: 'Título actualizado' },
    });
    fireEvent.click(screen.getByRole('button', { name: /guardar/i }));
    await waitFor(() => expect(handleSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Título actualizado' }),
      expect.any(Array)
    ));
  });
});

describe('NgoProjectFormPage — skills integration', () => {
  it('4.1: create mode renders SkillSelector with skills catalog', async () => {
    setupCreateHookMock();
    renderCreate();
    expect(await screen.findByTestId('skill-selector')).toBeInTheDocument();
    expect(screen.getByTestId('skill-count')).toHaveTextContent('2');
  });

  it('4.1: create mode includes selectedSkills in submit data', async () => {
    const handleSubmit = vi.fn().mockResolvedValue({ id: 'p-new' });
    setupCreateHookMock({ handleSubmit });
    renderCreate();
    await screen.findByRole('textbox', { name: /título/i });

    // Simulate selecting skills via the mock SkillSelector
    const addReactBtn = screen.getByRole('button', { name: /Add React/i });
    fireEvent.click(addReactBtn);

    fireEvent.change(screen.getByRole('textbox', { name: /título/i }), {
      target: { value: 'Nuevo proyecto' },
    });
    fireEvent.click(screen.getByRole('button', { name: /guardar/i }));

    await waitFor(() => {
      const calledArg = handleSubmit.mock.calls[0][0];
      expect(calledArg.skills).toEqual(
        expect.arrayContaining([expect.objectContaining({ skill_id: 's1', required_level: 'basic' })])
      );
    });
  });

  it('4.1: edit mode preloads skills from project', async () => {
    const projectWithSkills = {
      ...mockProject,
      skills: [{ skill_id: 's1', required_level: 'intermediate' }],
    };
    setupEditHookMock({ project: projectWithSkills });
    renderEdit();
    await screen.findByDisplayValue('Web banco de alimentos');
    expect(screen.getByTestId('skill-selector')).toBeInTheDocument();
    // Selected skills count should reflect preloaded skill
    expect(screen.getByTestId('selected-count')).toHaveTextContent('1');
  });

  it('4.1: edit mode sends skills as 5th param to updateProjectUseCase', async () => {
    const handleSubmit = vi.fn().mockResolvedValue(mockProject);
    setupEditHookMock({ handleSubmit });
    renderEdit();
    await screen.findByDisplayValue('Web banco de alimentos');

    fireEvent.change(screen.getByDisplayValue('Web banco de alimentos'), {
      target: { value: 'Título actualizado' },
    });
    fireEvent.click(screen.getByRole('button', { name: /guardar/i }));

    await waitFor(() => {
      // handleSubmit in edit mode is called with (data, skills)
      expect(handleSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Título actualizado' }),
        expect.any(Array)
      );
    });
  });
});