import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getApplicationsByProject, updateApplicationStatus } from '../../../infrastructure/api/applicationApi.js';

function NgoProjectCandidatesPage() {
  const { id } = useParams();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    getApplicationsByProject(id).then((data) => {
      setApplications(data);
      setLoading(false);
    });
  }, [id]);

  async function handleStatusChange(appId, status) {
    setErrorMsg('');
    try {
      const updated = await updateApplicationStatus(appId, status);
      setApplications((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, status: updated.status } : a))
      );
    } catch (err) {
      if (err?.response?.status === 403) {
        setErrorMsg('No tienes permiso para realizar esta acción.');
      } else {
        setErrorMsg('Error al actualizar el estado. Intenta de nuevo.');
      }
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Candidatos del proyecto</h1>
      </div>

      {errorMsg && (
        <div className="alert alert--error" role="alert" style={{ marginBottom: 'var(--space-5)' }}>
          {errorMsg}
        </div>
      )}

      {loading && <p className="loading">Cargando...</p>}

      {!loading && applications.length === 0 && (
        <div className="empty-state">
          <p className="empty-state__text">No hay candidatos para este proyecto.</p>
        </div>
      )}

      {!loading && (
        <div className="item-list">
          {applications.map((app) => (
            <div key={app.id} className="card">
              <div className="card__header">
                <div>
                  <h2 className="card__title">{app.student_name}</h2>
                  <p className="card__subtitle">{app.student_email}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  {app.compatibility_score != null && (
                    <span className="score font-mono">{app.compatibility_score}</span>
                  )}
                  <span className={`badge${app.status === 'approved' ? ' badge--accent' : app.status === 'rejected' ? ' badge--error' : ''}`}>
                    {app.status}
                  </span>
                </div>
              </div>
              <div className="card__footer">
                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                  <button className="btn btn--primary btn--sm" onClick={() => handleStatusChange(app.id, 'approved')}>
                    Aprobar
                  </button>
                  <button className="btn btn--danger btn--sm" onClick={() => handleStatusChange(app.id, 'rejected')}>
                    Rechazar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default NgoProjectCandidatesPage;
