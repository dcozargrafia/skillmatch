import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getProjectById } from '../../../infrastructure/api/projectApi.js';
import { getAssignmentsByProject } from '../../../infrastructure/api/assignmentApi.js';

function NgoProjectDetailPage() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setErrorMsg('');
    Promise.all([getProjectById(id), getAssignmentsByProject(id)])
      .then(([proj, assignments]) => {
        setProject(proj);
        setAssignment(assignments[0] ?? null);
        setLoading(false);
      })
      .catch(() => {
        setErrorMsg('Error al cargar el proyecto.');
        setLoading(false);
      });
  }, [id]);

  if (loading) return <p className="loading">Cargando...</p>;

  if (errorMsg) {
    return (
      <div className="alert alert--error" role="alert">
        {errorMsg}
      </div>
    );
  }

  if (!project) return null;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{project.title}</h1>
          <p className="page-subtitle">{project.description}</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          <span className="badge">{project.modality}</span>
          <span className="badge">{project.status}</span>
        </div>
      </div>

      <div className="card card--elevated" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="card__body">
          <p>{project.description}</p>
        </div>
        <div className="card__footer">
          <span className="text-muted text-sm">
            Fecha límite: <span className="font-mono">{project.deadline}</span>
          </span>
        </div>
      </div>

      {assignment && (
        <div style={{ marginTop: 'var(--space-6)' }}>
          <a
            href={`/ngo/projects/${project.id}/assignments/${assignment.id}/deliverables`}
            className="btn btn--primary btn--lg"
          >
            Ver entregables
          </a>
        </div>
      )}
    </div>
  );
}

export default NgoProjectDetailPage;