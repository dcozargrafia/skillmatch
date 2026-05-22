import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllProjects } from '../../../infrastructure/api/projectApi.js';
import { getAllSkills } from '../../../infrastructure/api/skillsApi.js';

const STATUSES = ['pending', 'assigned', 'in_progress', 'in_review', 'rejected', 'completed', 'cancelled'];

function ProjectsListPage() {
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [status, setStatus] = useState('pending');
  const [skillId, setSkillId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllSkills().then(setSkills);
  }, []);

  useEffect(() => {
    setLoading(true);
    const filters = { status };
    if (skillId) filters.skill_id = skillId;
    getAllProjects(filters).then((data) => {
      setProjects(data);
      setLoading(false);
    });
  }, [status, skillId]);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Proyectos disponibles</h1>
      </div>

      <div className="toolbar">
        <div className="toolbar__group">
          <label className="form-label">Estado</label>
          <select
            aria-label="Estado"
            className="form-select"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="toolbar__group">
          <label className="form-label">Skill</label>
          <select
            aria-label="Skill"
            className="form-select"
            value={skillId}
            onChange={(e) => setSkillId(e.target.value)}
          >
            <option value="">Todas</option>
            {skills.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>

      {loading && <p className="loading">Cargando...</p>}

      {!loading && projects.length === 0 && (
        <div className="empty-state">
          <p className="empty-state__text">No hay proyectos que coincidan con los filtros.</p>
        </div>
      )}

      {!loading && (
        <div className="card-grid">
          {projects.map((project) => (
            <Link key={project.id} to={`/student/projects/${project.id}`} className="card card--interactive">
              <div className="card__header">
                <div>
                  <h2 className="card__title">{project.title}</h2>
                  <p className="card__subtitle">{project.ngo?.name}</p>
                </div>
                <span className="badge">{project.modality}</span>
              </div>
              <div className="card__body">
                <p>{project.description}</p>
              </div>
              <div className="card__meta">
                {project.skills?.map((s) => {
                  const skill = skills.find((sk) => sk.id === s.skill_id);
                  return skill ? (
                    <span key={s.skill_id} className="skill-tag">{skill.name}</span>
                  ) : null;
                })}
              </div>
              <div className="card__footer">
                <span className="font-mono text-sm text-muted">{project.deadline}</span>
                <span className="badge">{project.status}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProjectsListPage;
