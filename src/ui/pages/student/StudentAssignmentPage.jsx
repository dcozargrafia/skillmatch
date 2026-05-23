import { useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import useStudentAssignment from '../../hooks/useStudentAssignment.jsx';
import useStudentCertificate from '../../hooks/useStudentCertificate.jsx';
import useStudentReview from '../../hooks/useStudentReview.jsx';
import { DeliverableCard } from '../../components/DeliverableCard.jsx';
import { PageHeader } from '../../components/PageHeader.jsx';
import { getStatusLabel, getProjectStatusMessage, sortDeliverables } from '../../../domain/project/Project.js';

function StudentAssignmentPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const highlightedDeliverableId = searchParams.get('deliverable');
  const {
    assignment,
    deliverables,
    loading,
    error,
    actions,
  } = useStudentAssignment(id);

  const {
    downloading,
    error: certError,
    handleDownload,
  } = useStudentCertificate();

  const {
    reviewSent,
    error: reviewError,
    handleSubmitReview,
  } = useStudentReview();

  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  if (loading) return <p className="loading">Cargando...</p>;

  return (
    <div>
      <PageHeader
        title={assignment?.project_title}
        subtitle={<span className="font-mono">{assignment?.start_date}</span>}
      >
        <span className="badge">{getStatusLabel(assignment?.project_status)}</span>
      </PageHeader>

      {assignment?.project_status === 'assigned' && (
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <button className="btn btn--primary btn--lg" onClick={actions.handleAcceptAssignment}>
            Aceptar proyecto
          </button>
        </div>
      )}

      {assignment?.project_status === 'completed' && assignment?.certificate_id && (
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <button
            className="btn btn--primary"
            onClick={() => handleDownload(assignment)}
            disabled={downloading}
          >
            {downloading ? 'Descargando...' : 'Descargar certificado'}
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
            <button
              className="btn btn--primary"
              onClick={() => handleSubmitReview({ assignment_id: id, rating: Number(reviewRating), comment: reviewComment })}
            >
              Enviar valoración
            </button>
          </div>
        </div>
      )}

      <div className="section">
        <div className="section__header">
          <h2 className="section__title">Entregables</h2>
        </div>
        {(() => {
          const msg = getProjectStatusMessage(assignment?.project_status, deliverables);
          return msg ? (
            <div className="card__body" style={{ marginBottom: 'var(--space-4)' }}>
              <p className="text-muted text-sm">{msg}</p>
            </div>
          ) : null;
        })()}
        <div className="item-list">
          {sortDeliverables(deliverables).map((d) => (
            <DeliverableCard
              key={d.id}
              deliverable={d}
              variant="student"
              onStart={() => actions.handleStartDeliverable(d, deliverables)}
              onSubmit={(_, fileUrl) => actions.handleSubmitDeliverable(d, fileUrl)}
              highlighted={highlightedDeliverableId === d.id}
              showViewDetails={true}
              onViewDetails={() => {}}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default StudentAssignmentPage;
