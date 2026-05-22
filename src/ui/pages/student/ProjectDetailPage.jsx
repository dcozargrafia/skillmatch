import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getProjectById } from '../../../infrastructure/api/projectApi.js';
import { createApplication } from '../../../infrastructure/api/applicationApi.js';
import { getAllSkills } from '../../../infrastructure/api/skillsApi.js';

function ProjectDetailPage() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [skills, setSkills] = useState([]);
  const [applied, setApplied] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    getProjectById(id).then(setProject);
    getAllSkills().then(setSkills);
  }, [id]);

  async function handleApply() {
    setErrorMsg('');
    try {
      await createApplication(id);
      setApplied(true);
    } catch (err) {
      if (err?.response?.status === 409) {
        setApplied(true);
      } else {
        setErrorMsg('Error al aplicar al proyecto. Intenta de nuevo.');
      }
    }
  }

  if (!project) return <p className="loading">Cargando...</p>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{project.title}</h1>
          <p className="page-subtitle">{project.ngo?.name}</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          <span className="badge">{project.modality}</span>
          <span className="badge">{project.status}</span>
        </div>
      </div>

      <div className="card card--elevated" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="card__body">
          <p>{project.description}</p>
          {project.objectives && (
            <>
              <hr className="divider" />
              <p>{project.objectives}</p>
            </>
          )}
        </div>
        <div className="card__footer">
          <span className="text-muted text-sm">
            Horas estimadas: <span className="font-mono">{project.estimated_hours}</span>
          </span>
          <span className="text-muted text-sm font-mono">{project.deadline}</span>
        </div>
      </div>

      {project.skills?.length > 0 && (
        <div className="section">
          <div className="section__header">
            <h2 className="section__title">Skills requeridas</h2>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
            {project.skills.map((s) => {
              const skill = skills.find((sk) => sk.id === s.skill_id);
              return skill ? (
                <span key={s.skill_id} className="skill-tag">
                  {skill.name}
                  <span className="skill-tag__level">· {s.required_level}</span>
                </span>
              ) : null;
            })}
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="alert alert--error" role="alert" style={{ marginBottom: 'var(--space-4)' }}>
          {errorMsg}
        </div>
      )}

      {project.status === 'pending' && (
        <button type="button" className="btn btn--primary btn--lg" onClick={handleApply} disabled={applied}>
          {applied ? 'Ya has aplicado' : 'Aplicar a este proyecto'}
        </button>
      )}
    </div>
  );
}

export default ProjectDetailPage;
