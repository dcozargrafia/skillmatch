import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getOwnApplications } from '../../../infrastructure/api/applicationApi.js';
import { getMyAssignments } from '../../../infrastructure/api/assignmentApi.js';

function StudentApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getOwnApplications(), getMyAssignments()]).then(([apps, assigns]) => {
      setApplications(apps);
      setAssignments(assigns);
      setLoading(false);
    });
  }, []);

  const assignmentByProjectId = assignments.reduce((acc, a) => {
    acc[a.project_id] = a.id;
    return acc;
  }, {});

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Mis postulaciones</h1>
      </div>

      {loading && <p className="loading">Cargando...</p>}

      {!loading && applications.length === 0 && (
        <div className="empty-state">
          <p className="empty-state__text">No has aplicado a ningún proyecto todavía.</p>
        </div>
      )}

      {!loading && (
        <div className="item-list">
          {applications.map((app) => (
            <div key={app.id} className="card card--accent">
              <div className="card__header">
                <div>
                  <h2 className="card__title">{app.project_title}</h2>
                  <p className="card__subtitle font-mono">
                    {new Date(app.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span className={`badge${app.status === 'approved' ? ' badge--accent' : app.status === 'rejected' ? ' badge--error' : ''}`}>
                  {app.status}
                </span>
              </div>
              {app.compatibility_score != null && (
                <p className="card__body">
                  Compatibilidad: <span className="score">{app.compatibility_score}</span>
                </p>
              )}
              {app.status === 'approved' && assignmentByProjectId[app.project_id] && (
                <div className="card__footer">
                  <Link to={`/student/assignments/${assignmentByProjectId[app.project_id]}`} className="btn btn--primary btn--sm">
                    Ver assignment
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default StudentApplicationsPage;
