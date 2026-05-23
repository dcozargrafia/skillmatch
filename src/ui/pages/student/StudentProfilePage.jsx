import { useState } from 'react';
import useStudentProfile from '../../hooks/useStudentProfile.jsx';
import { PageHeader } from '../../components/PageHeader.jsx';

/** Opciones de nivel: valor en inglés (matching API) → label en español (display). */
const LEVEL_OPTIONS = [
  { value: 'basic', label: 'básico' },
  { value: 'intermediate', label: 'intermedio' },
  { value: 'advanced', label: 'avanzado' },
];

const DEFAULT_LEVEL = LEVEL_OPTIONS[0].value;

function StudentProfilePage() {
  const {
    profile,
    allSkills,
    availableSkills,
    error,
    successMessage,
    handleSave,
    handleAddSkill,
    handleRemoveSkill,
    handleChangeLevel,
  } = useStudentProfile();

  const [newSkillLevel, setNewSkillLevel] = useState(DEFAULT_LEVEL);

  if (error && !profile) return <div className="alert alert--error">{error}</div>;
  if (!profile) return <p className="loading">Cargando...</p>;

  return (
    <div>
      <PageHeader title="Mi perfil" />

      <div className="card card--elevated section">
        <div className="card__header">
          <div>
            <h2 className="card__title">{profile.name}</h2>
            <p className="card__subtitle">{profile.email}</p>
          </div>
        </div>
        <ProfileForm
          initialDisponibilidad={profile.disponibilidad}
          initialPortfolioUrl={profile.portfolio_url}
          onSave={handleSave}
          successMessage={successMessage}
          errorMessage={error}
        />
      </div>

      <div className="section">
        <div className="section__header">
          <h2 className="section__title">Skills</h2>
        </div>

        <div className="item-list" style={{ marginBottom: 'var(--space-5)' }}>
          {(profile.skills ?? []).map((ps) => {
            const match = allSkills.find((as) => as.id === ps.skill_id);
            const name = match?.name ?? ps.skill_id;
            return (
              <div key={ps.skill_id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', padding: 'var(--space-3) var(--space-4)' }}>
                <span className="skill-tag skill-tag--accent">{name}</span>
                <select
                  aria-label={`Nivel de ${name}`}
                  className="form-select"
                  style={{ maxWidth: '160px' }}
                  value={ps.level}
                  onChange={(e) => handleChangeLevel(ps.skill_id, e.target.value)}
                >
                  {LEVEL_OPTIONS.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                <button type="button" className="btn btn--danger btn--sm" onClick={() => handleRemoveSkill(ps.skill_id)}>
                  Eliminar
                </button>
              </div>
            );
          })}
        </div>

        <div className="card" style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap', alignItems: 'flex-end', padding: 'var(--space-4) var(--space-5)' }}>
          <div className="toolbar__group">
            <label className="form-label">Agregar skill</label>
            <select
              aria-label="Agregar skill"
              className="form-select"
              value=""
              onChange={(e) => {
                if (e.target.value) {
                  handleAddSkill(e.target.value, newSkillLevel);
                  setNewSkillLevel(DEFAULT_LEVEL);
                }
              }}
            >
              <option value="">-- selecciona --</option>
              {availableSkills.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="toolbar__group">
            <label className="form-label">Nivel</label>
            <select
              aria-label="Nivel del nuevo skill"
              className="form-select"
              value={newSkillLevel}
              onChange={(e) => setNewSkillLevel(e.target.value)}
            >
              {LEVEL_OPTIONS.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileForm({ initialDisponibilidad, initialPortfolioUrl, onSave, successMessage, errorMessage }) {
  const [disponibilidad, setDisponibilidad] = useState(initialDisponibilidad ?? false);
  const [portfolioUrl, setPortfolioUrl] = useState(initialPortfolioUrl ?? '');

  async function handleSubmit() {
    try {
      await onSave({ disponibilidad, portfolio_url: portfolioUrl });
    } catch {
      // error handled by hook
    }
  }

  return (
    <>
      <div className="card__body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <label className="form-checkbox">
          <input
            type="checkbox"
            className="form-checkbox__input"
            aria-label="Disponibilidad"
            checked={disponibilidad}
            onChange={(e) => setDisponibilidad(e.target.checked)}
          />
          <span className="form-checkbox__label">Disponible para proyectos</span>
        </label>

        <div className="form-field">
          <label className="form-label">Portfolio URL</label>
          <input
            type="url"
            className="form-input"
            value={portfolioUrl}
            onChange={(e) => setPortfolioUrl(e.target.value)}
          />
        </div>

        {successMessage && <div className="alert alert--success" role="status">{successMessage}</div>}
        {errorMessage && !errorMessage.includes('cargar') && <div className="alert alert--error" role="alert">{errorMessage}</div>}
      </div>
      <div className="card__footer">
        <button type="button" className="btn btn--primary" onClick={handleSubmit}>
          Guardar perfil
        </button>
      </div>
    </>
  );
}

export default StudentProfilePage;
