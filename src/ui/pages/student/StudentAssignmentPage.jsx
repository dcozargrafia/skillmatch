import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getAssignmentById, acceptAssignment } from '../../../infrastructure/api/assignmentApi.js';
import { getDeliverablesByAssignment, startDeliverable, submitDeliverable } from '../../../infrastructure/api/deliverableApi.js';
import { downloadCertificate } from '../../../infrastructure/api/certificateApi.js';
import { createReview } from '../../../infrastructure/api/reviewApi.js';

function DeliverableItem({ deliverable, onStart, onSubmit }) {
  const [fileUrl, setFileUrl] = useState('');

  return (
    <div className="card card--accent">
      <div className="card__header">
        <h3 className="card__title">{deliverable.title}</h3>
        <span className={`badge${deliverable.status === 'approved' ? ' badge--success' : deliverable.status === 'rejected' ? ' badge--error' : deliverable.status === 'in_review' ? ' badge--warning' : ''}`}>
          {deliverable.status}
        </span>
      </div>
      {deliverable.description && (
        <div className="card__body"><p>{deliverable.description}</p></div>
      )}

      {(deliverable.status === 'pending' || deliverable.status === 'rejected') && (
        <div className="card__footer">
          <button className="btn btn--secondary btn--sm" onClick={() => onStart(deliverable.id)}>
            {deliverable.status === 'rejected' ? 'Reanudar' : 'Iniciar'}
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
    </div>
  );
}

function StudentAssignmentPage() {
  const { id } = useParams();
  const [assignment, setAssignment] = useState(null);
  const [deliverables, setDeliverables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [certError, setCertError] = useState('');
  const [reviewSent, setReviewSent] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewError, setReviewError] = useState('');

  useEffect(() => {
    Promise.all([
      getAssignmentById(id),
      getDeliverablesByAssignment(id),
    ]).then(([asgn, dels]) => {
      setAssignment(asgn);
      setDeliverables(dels);
      setLoading(false);
    });
  }, [id]);

  async function handleAccept() {
    const updated = await acceptAssignment(id);
    setAssignment((prev) => ({ ...prev, project_status: updated.project_status }));
  }

  async function handleStart(deliverableId) {
    const updated = await startDeliverable(deliverableId);
    setDeliverables((prev) =>
      prev.map((d) => (d.id === deliverableId ? { ...d, status: updated.status } : d))
    );
  }

  async function handleDownloadCertificate() {
    setCertError('');
    try {
      const blob = await downloadCertificate(assignment.certificate_id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'certificado.pdf';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setCertError('Error al descargar el certificado. Intenta de nuevo.');
    }
  }

  async function handleSendReview() {
    setReviewError('');
    try {
      await createReview({ assignment_id: id, rating: Number(reviewRating), comment: reviewComment });
      setReviewSent(true);
    } catch (err) {
      if (err?.response?.status === 409) {
        setReviewError('Ya has valorado este proyecto.');
      } else {
        setReviewError('Error al enviar la valoración. Intenta de nuevo.');
      }
    }
  }

  async function handleSubmit(deliverableId, fileUrl) {
    const updated = await submitDeliverable(deliverableId, fileUrl);
    setDeliverables((prev) =>
      prev.map((d) => (d.id === deliverableId ? { ...d, status: updated.status } : d))
    );
  }

  if (loading) return <p className="loading">Cargando...</p>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{assignment?.project_title}</h1>
          <p className="page-subtitle font-mono">{assignment?.start_date}</p>
        </div>
        <span className="badge">{assignment?.project_status}</span>
      </div>

      {assignment?.project_status === 'assigned' && (
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <button className="btn btn--primary btn--lg" onClick={handleAccept}>
            Aceptar proyecto
          </button>
        </div>
      )}

      {assignment?.project_status === 'completed' && assignment?.certificate_id && (
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <button className="btn btn--primary" onClick={handleDownloadCertificate}>
            Descargar certificado
          </button>
        </div>
      )}
      {certError && (
        <div className="alert alert--error" role="alert" style={{ marginBottom: 'var(--space-4)' }}>
          {certError}
        </div>
      )}

      {assignment?.project_status === 'completed' && !reviewSent && (
        <div className="card card--elevated section">
          <div className="card__header">
            <h2 className="card__title">Dejar valoración</h2>
          </div>
          <div className="card__body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div className="form-field">
              <label className="form-label">Valoración (1–5)</label>
              <input
                type="number"
                aria-label="Valoración"
                className="form-input"
                min={1}
                max={5}
                value={reviewRating}
                onChange={(e) => setReviewRating(e.target.value)}
                style={{ maxWidth: '100px' }}
              />
            </div>
            <div className="form-field">
              <label className="form-label">Comentario</label>
              <textarea
                aria-label="Comentario"
                className="form-textarea"
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
              />
            </div>
            {reviewError && (
              <div className="alert alert--error" role="alert">{reviewError}</div>
            )}
          </div>
          <div className="card__footer">
            <button className="btn btn--primary" onClick={handleSendReview}>
              Enviar valoración
            </button>
          </div>
        </div>
      )}

      <div className="section">
        <div className="section__header">
          <h2 className="section__title">Entregables</h2>
        </div>
        <div className="item-list">
          {deliverables.map((d) => (
            <DeliverableItem
              key={d.id}
              deliverable={d}
              onStart={handleStart}
              onSubmit={handleSubmit}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default StudentAssignmentPage;
