import PropTypes from 'prop-types';
import './SkillSelector.css';

const CATEGORY_ORDER = ['Desarrollo', 'Diseño', 'CMS', 'Marketing'];
const CATEGORY_LABELS = {
  Desarrollo: 'Desarrollo',
  Diseño: 'Diseño',
  Diseno: 'Diseño',
  CMS: 'CMS',
  Marketing: 'Marketing',
};

// Normalize category key: 'Diseno' → 'Diseño' for lookup
const normalizeCategory = (cat) => {
  if (cat === 'Diseno') return 'Diseño';
  return cat;
};
const LEVEL_OPTIONS = [
  { value: 'basic', label: 'Básico' },
  { value: 'intermediate', label: 'Intermedio' },
  { value: 'advanced', label: 'Avanzado' },
];

export function SkillSelector({ skills, selectedSkills, onChange }) {
  if (!skills || skills.length === 0) {
    return <p>No hay habilidades disponibles</p>;
  }

  // Group skills by category in defined order
  const grouped = {};
  for (const cat of CATEGORY_ORDER) {
    grouped[cat] = skills.filter((s) => normalizeCategory(s.category) === cat);
  }

  const isSelected = (skillId) =>
    selectedSkills.some((s) => s.skill_id === skillId);

  const getSelectedLevel = (skillId) => {
    const entry = selectedSkills.find((s) => s.skill_id === skillId);
    return entry ? entry.required_level : 'basic';
  };

  const handleCheckboxChange = (skillId, checked) => {
    if (checked) {
      onChange([...selectedSkills, { skill_id: skillId, required_level: 'basic' }]);
    } else {
      onChange(selectedSkills.filter((s) => s.skill_id !== skillId));
    }
  };

  const handleLevelChange = (skillId, level) => {
    const updated = selectedSkills.map((s) =>
      s.skill_id === skillId ? { ...s, required_level: level } : s
    );
    onChange(updated);
  };

  return (
    <div className="skill-selector">
      {CATEGORY_ORDER.map((cat) => {
        const catSkills = grouped[cat];
        if (!catSkills || catSkills.length === 0) return null;
        return (
          <div key={cat} className="skill-selector__category">
            <h4 className="skill-selector__category-title">
              {CATEGORY_LABELS[cat] || cat}
            </h4>
            {catSkills.map((skill) => {
              const checked = isSelected(skill.id);
              const level = getSelectedLevel(skill.id);
              return (
                <div key={skill.id} className="skill-selector__row">
                  <label className="form-checkbox">
                    <input
                      type="checkbox"
                      className="form-checkbox__input"
                      checked={checked}
                      onChange={(e) => handleCheckboxChange(skill.id, e.target.checked)}
                    />
                    <span className="form-checkbox__label">{skill.name}</span>
                  </label>
                  <select
                    className="form-select"
                    value={level}
                    disabled={!checked}
                    onChange={(e) => handleLevelChange(skill.id, e.target.value)}
                  >
                    {LEVEL_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

SkillSelector.propTypes = {
  skills: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      category: PropTypes.string.isRequired,
    })
  ).isRequired,
  selectedSkills: PropTypes.arrayOf(
    PropTypes.shape({
      skill_id: PropTypes.string.isRequired,
      required_level: PropTypes.oneOf(['basic', 'intermediate', 'advanced']).isRequired,
    })
  ).isRequired,
  onChange: PropTypes.func.isRequired,
};