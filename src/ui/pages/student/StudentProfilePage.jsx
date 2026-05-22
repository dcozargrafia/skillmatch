import { useEffect, useState } from 'react';
import { getStudentMe, updateStudentMe, updateStudentSkills } from '../../../infrastructure/api/studentApi.js';
import { getAllSkills } from '../../../infrastructure/api/skillsApi.js';

const LEVELS = ['básico', 'intermedio', 'avanzado'];

function StudentProfilePage() {
  const [profile, setProfile] = useState(null);
  const [allSkills, setAllSkills] = useState([]);
  const [disponibilidad, setDisponibilidad] = useState(false);
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [skills, setSkills] = useState([]);
  const [newSkillId, setNewSkillId] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState(LEVELS[0]);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    Promise.all([getStudentMe(), getAllSkills()])
      .then(([p, s]) => {
        setProfile(p);
        setDisponibilidad(p.disponibilidad ?? false);
        setPortfolioUrl(p.portfolio_url ?? '');
        setSkills(
          (p.skills ?? []).map((ps) => {
            const match = s.find((as) => as.id === ps.skill_id);
            return { id: ps.skill_id, name: match?.name ?? ps.skill_id, level: ps.level };
          })
        );
        setAllSkills(s);
      })
      .catch(() => setLoadError('Error al cargar el perfil. Intenta de nuevo.'));
  }, []);

  async function handleSaveProfile() {
    setSuccessMsg('');
    setErrorMsg('');
    try {
      const updated = await updateStudentMe({ disponibilidad, portfolio_url: portfolioUrl });
      setProfile((prev) => ({ ...prev, ...updated }));
      setSuccessMsg('Perfil actualizado correctamente.');
    } catch {
      setErrorMsg('Error al actualizar el perfil. Intenta de nuevo.');
    }
  }

  async function handleAddSkill() {
    if (!newSkillId) return;
    const next = [
      ...skills.map((s) => ({ skill_id: s.id, level: s.level })),
      { skill_id: newSkillId, level: newSkillLevel },
    ];
    await updateStudentSkills(next);
    const added = allSkills.find((s) => s.id === newSkillId);
    setSkills((prev) => [...prev, { id: newSkillId, name: added?.name ?? newSkillId, level: newSkillLevel }]);
    setNewSkillId('');
    setNewSkillLevel(LEVELS[0]);
  }

  async function handleRemoveSkill(skillId) {
    const next = skills
      .filter((s) => s.id !== skillId)
      .map((s) => ({ skill_id: s.id, level: s.level }));
    await updateStudentSkills(next);
    setSkills((prev) => prev.filter((s) => s.id !== skillId));
  }

  async function handleChangeLevel(skillId, level) {
    const next = skills.map((s) => ({
      skill_id: s.id,
      level: s.id === skillId ? level : s.level,
    }));
    await updateStudentSkills(next);
    setSkills((prev) => prev.map((s) => (s.id === skillId ? { ...s, level } : s)));
  }

  const availableSkills = allSkills.filter((s) => !skills.some((us) => us.id === s.id));

  if (loadError) return <div className="alert alert--error">{loadError}</div>;
  if (!profile) return <p className="loading">Cargando...</p>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Mi perfil</h1>
      </div>

      <div className="card card--elevated section">
        <div className="card__header">
          <div>
            <h2 className="card__title">{profile.name}</h2>
            <p className="card__subtitle">{profile.email}</p>
          </div>
        </div>
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

          {successMsg && <div className="alert alert--success" role="status">{successMsg}</div>}
          {errorMsg && <div className="alert alert--error" role="alert">{errorMsg}</div>}
        </div>
        <div className="card__footer">
          <button type="button" className="btn btn--primary" onClick={handleSaveProfile}>
            Guardar perfil
          </button>
        </div>
      </div>

      <div className="section">
        <div className="section__header">
          <h2 className="section__title">Skills</h2>
        </div>

        <div className="item-list" style={{ marginBottom: 'var(--space-5)' }}>
          {skills.map((skill) => (
            <div key={skill.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', padding: 'var(--space-3) var(--space-4)' }}>
              <span className="skill-tag skill-tag--accent">{skill.name}</span>
              <select
                aria-label={`Nivel de ${skill.name}`}
                className="form-select"
                style={{ maxWidth: '160px' }}
                value={skill.level}
                onChange={(e) => handleChangeLevel(skill.id, e.target.value)}
              >
                {LEVELS.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
              <button type="button" className="btn btn--danger btn--sm" onClick={() => handleRemoveSkill(skill.id)}>
                Eliminar
              </button>
            </div>
          ))}
        </div>

        <div className="card" style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap', alignItems: 'flex-end', padding: 'var(--space-4) var(--space-5)' }}>
          <div className="toolbar__group">
            <label className="form-label">Agregar skill</label>
            <select
              aria-label="Agregar skill"
              className="form-select"
              value={newSkillId}
              onChange={(e) => setNewSkillId(e.target.value)}
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
              aria-label="Nivel"
              className="form-select"
              value={newSkillLevel}
              onChange={(e) => setNewSkillLevel(e.target.value)}
            >
              {LEVELS.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>

          <button type="button" className="btn btn--secondary" onClick={handleAddSkill}>
            Agregar
          </button>
        </div>
      </div>
    </div>
  );
}

export default StudentProfilePage;
