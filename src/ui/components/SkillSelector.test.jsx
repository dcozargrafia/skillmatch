/**
 * Test: SkillSelector
 * SDD Phase 3, Task 3.1
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SkillSelector } from './SkillSelector.jsx';

const mockSkills = [
  { id: 's1', name: 'React', category: 'Desarrollo' },
  { id: 's2', name: 'Node.js', category: 'Desarrollo' },
  { id: 's3', name: 'Figma', category: 'Diseno' },
  { id: 's4', name: 'WordPress', category: 'CMS' },
  { id: 's5', name: 'Google Ads', category: 'Marketing' },
];

const defaultProps = {
  skills: mockSkills,
  selectedSkills: [],
  onChange: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('SkillSelector', () => {
  it('1. renders grouped by category with headers', () => {
    render(<SkillSelector {...defaultProps} />);

    expect(screen.getByText('Desarrollo')).toBeInTheDocument();
    expect(screen.getByText('Diseño')).toBeInTheDocument();
    expect(screen.getByText('CMS')).toBeInTheDocument();
    expect(screen.getByText('Marketing')).toBeInTheDocument();
  });

  it('2. checkbox toggle adds skill to selectedSkills on check', () => {
    render(<SkillSelector {...defaultProps} />);

    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);

    expect(defaultProps.onChange).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ skill_id: 's1', required_level: 'basic' }),
      ])
    );
  });

  it('3. checkbox toggle removes skill from selectedSkills on uncheck', () => {
    render(<SkillSelector {...defaultProps} skills={mockSkills} selectedSkills={[{ skill_id: 's1', required_level: 'basic' }]} />);

    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);

    expect(defaultProps.onChange).toHaveBeenCalledWith(
      expect.not.arrayContaining([expect.objectContaining({ skill_id: 's1' })])
    );
  });

  it('4. level select changes required_level in onChange', () => {
    render(<SkillSelector {...defaultProps} skills={mockSkills} selectedSkills={[{ skill_id: 's1', required_level: 'basic' }]} />);

    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[0], { target: { value: 'intermediate' } });

    expect(defaultProps.onChange).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ skill_id: 's1', required_level: 'intermediate' }),
      ])
    );
  });

  it('5. default level is basic when checking a skill', () => {
    render(<SkillSelector {...defaultProps} />);

    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);

    const call = defaultProps.onChange.mock.calls[0][0];
    const addedSkill = call.find((s) => s.skill_id === 's1');
    expect(addedSkill.required_level).toBe('basic');
  });

  it('6. preloaded state marks checkboxes as checked and selects show correct values', () => {
    render(
      <SkillSelector
        skills={mockSkills}
        selectedSkills={[
          { skill_id: 's1', required_level: 'intermediate' },
          { skill_id: 's3', required_level: 'advanced' },
        ]}
        onChange={vi.fn()}
      />
    );

    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes[0]).toBeChecked();
    expect(checkboxes[2]).toBeChecked();

    const selects = screen.getAllByRole('combobox');
    expect(selects[0]).toHaveValue('intermediate');
    expect(selects[2]).toHaveValue('advanced');
  });

  it('7. unchecked skill is NOT included in onChange output', () => {
    render(<SkillSelector {...defaultProps} />);

    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);
    fireEvent.click(checkboxes[1]);

    const call = defaultProps.onChange.mock.calls[1][0];
    const s1Entry = call.find((s) => s.skill_id === 's1');
    expect(s1Entry).toBeUndefined();
  });

  it('8. empty skills array renders "No hay habilidades disponibles"', () => {
    render(<SkillSelector skills={[]} selectedSkills={[]} onChange={vi.fn()} />);

    expect(screen.getByText('No hay habilidades disponibles')).toBeInTheDocument();
  });

  it('9. level select is disabled when checkbox is unchecked', () => {
    render(<SkillSelector {...defaultProps} />);

    const selects = screen.getAllByRole('combobox');
    expect(selects[0]).toBeDisabled();
  });

  it('10. level select is enabled when checkbox is checked', () => {
    render(<SkillSelector {...defaultProps} skills={mockSkills} selectedSkills={[{ skill_id: 's1', required_level: 'basic' }]} />);

    const selects = screen.getAllByRole('combobox');
    expect(selects[0]).not.toBeDisabled();
  });
});