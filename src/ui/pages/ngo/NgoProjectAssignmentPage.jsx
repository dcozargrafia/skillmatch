import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getApplicationsByProject } from '../../../infrastructure/api/applicationApi.js';
import { getAssignmentsByProject, createAssignment } from '../../../infrastructure/api/assignmentApi.js';

function NgoProjectAssignmentPage() {
  const { id } = useParams();
  const [assignment, setAssignment] = useState(null);
  const [approvedCandidates, setApprovedCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    Promise.all([
      getAssignmentsByProject(id),
      getApplicationsByProject(id),
    ]).then(([asgn, applications]) => {
      setAssignment(asgn);
      setApprovedCandidates(applications.filter((a) => a.status === 'approved'));
      setLoading(false);
    });
  }, [id]);

  async function handleSelect(applicationId) {
    setErrorMsg('');
    try {
      const created = await createAssignment(applicationId);
      setAssignment(created);
    } catch (err) {
      if (err?.response?.status === 403) {
        setErrorMsg('No tienes permiso para realizar esta acción.');
      } else {
        setErrorMsg('Error al crear el assignment. Intenta de nuevo.');
      }
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Asignación del proyecto</h1>
      </div>

      {errorMsg && (
        <div className="alert alert--error" role="alert" style={{ marginBottom: 'var(--space-5)' }}>
          {errorMsg}
        </div>
      )}

      {loading && <p className="loading">Cargando...</p>}

      {!loading && assignment && (
        <div className="card card--elevated card--accent" style={{ maxWidth: '480px' }}>
          <div className="card__header">
            <div>
              <h2 className="card__title">{assignment.student_name}</h2>
              <p className="card__subtitle">{assignment.student_email}</p>
            </div>
            <span className="badge badge--accent">Asignado</span>
          </div>
          <div className="card__footer">
            <span className="text-muted text-sm font-mono">{assignment.start_date}</span>
          </div>
        </div>
      )}

      {!loading && !assignment && approvedCandidates.length === 0 && (
        <div className="empty-state">
          <p className="empty-state__text">No hay candidatos aprobados para este proyecto.</p>
        </div>
      )}

      {!loading && !assignment && approvedCandidates.length > 0 && (
        <div className="section">
          <div className="section__header">
            <h2 className="section__title">Candidatos aprobados</h2>
          </div>
          <div className="item-list">
            {approvedCandidates.map((app) => (
              <div key={app.id} className="card">
                <div className="card__header">
                  <div>
                    <h3 className="card__title">{app.student_name}</h3>
                    <p className="card__subtitle">{app.student_email}</p>
                  </div>
                  {app.compatibility_score != null && (
                    <span className="score font-mono">{app.compatibility_score}</span>
                  )}
                </div>
                <div className="card__footer">
                  <button className="btn btn--primary btn--sm" onClick={() => handleSelect(app.id)}>
                    Seleccionar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default NgoProjectAssignmentPage;
