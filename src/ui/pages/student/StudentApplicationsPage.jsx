import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAssignmentsByStatus } from '../../../infrastructure/api/assignmentApi.js';
import { getDeliverablesByAssignment, startDeliverable, submitDeliverable } from '../../../infrastructure/api/deliverableApi.js';

function DeliverableCard({ deliverable, onStart, onSubmit }) {
  const [fileUrl, setFileUrl] = useState('');

  return (
    <div className="card card--accent">
      <div className="card__header">
        <h4 className="card__title">{deliverable.title}</h4>
        <span className={`badge${deliverable.status === 'approved' ? ' badge--success' : deliverable.status === 'rejected' ? ' badge--error' : deliverable.status === 'in_review' ? ' badge--warning' : ''}`}>
          {deliverable.status}
        </span>
      </div>
      {deliverable.description && (
        <div className="card__body"><p>{deliverable.description}</p></div>
      )}

      {deliverable.status === 'pending' && (
        <div className="card__footer">
          <button className="btn btn--secondary btn--sm" onClick={() => onStart(deliverable.id)}>
            Iniciar
          </button>
        </div>
      )}

      {deliverable.status === 'in_progress' && (
        <div className="card__footer" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 'var(--space-3)' }}>
          <div className="form-field">
            <label className="form-label">URL del archivo</label>
            <input
              type="text"
              aria-label="URL del archivo"
              className="form-input"
              value={fileUrl}
              onChange={(e) => setFileUrl(e.target.value)}
            />
          </div>
          <button className="btn btn--primary btn--sm" onClick={() => onSubmit(deliverable.id, fileUrl)}>
            Enviar a revisión
          </button>
        </div>
      )}

      {deliverable.status === 'rejected' && (
        <div className="card__footer">
          <button className="btn btn--secondary btn--sm" onClick={() => onStart(deliverable.id)}>
            Reintentar
          </button>
        </div>
      )}
    </div>
  );
}

function StudentApplicationsPage() {
  const [assignments, setAssignments] = useState([]);
  const [deliverables, setDeliverables] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAssignmentsByStatus(['assigned', 'in_progress', 'in_review']).then(async (assigns) => {
      const dels = await Promise.all(
        assigns.map((a) => getDeliverablesByAssignment(a.id))
      );
      const delsMap = {};
      assigns.forEach((a, i) => {
        delsMap[a.id] = dels[i] || [];
      });
      setDeliverables(delsMap);
      setAssignments(assigns);
      setLoading(false);
    });
  }, []);

  async function handleStart(deliverableId) {
    const updated = await startDeliverable(deliverableId);
    return updated;
  }

  async function handleSubmit(deliverableId, fileUrl) {
    const updated = await submitDeliverable(deliverableId, fileUrl);
    return updated;
  }

  if (loading) return <p className="loading">Cargando...</p>;

  if (!assignments.length) {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">Proyectos asignados</h1>
        </div>
        <div className="empty-state">
          <p className="empty-state__text">No tienes proyectos asignados todavía.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Proyectos asignados</h1>
      </div>

      <div className="item-list">
        {assignments.map((assignment) => (
          <div key={assignment.id} className="card">
            <div className="card__header">
              <div>
                <h2 className="card__title">{assignment.project_title}</h2>
              </div>
              <span className="badge">{assignment.project_status}</span>
            </div>
            <div className="card__body">
              {(deliverables[assignment.id] || []).map((d) => (
                <DeliverableCard
                  key={d.id}
                  deliverable={d}
                  onStart={handleStart}
                  onSubmit={handleSubmit}
                />
              ))}
            </div>
            <div className="card__footer">
              <Link to={`/student/assignments/${assignment.id}`} className="btn btn--secondary btn--sm">
                Ver detalles
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default StudentApplicationsPage;