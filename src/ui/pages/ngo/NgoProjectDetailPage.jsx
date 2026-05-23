import { useState } from 'react';
import { useParams } from 'react-router-dom';
import useProjectDetail from '../../hooks/useProjectDetail.jsx';
import { DeliverableCard } from '../../components/DeliverableCard.jsx';
import {
  hasActiveDeliverable,
  isTerminalStatus,
  canCompleteProject,
} from '../../../domain/project/Project.js';
import { canCancelProject } from '../../../domain/ngo/Ngo.js';

const REVIEW_STATUSES = ['in_review'];

function CandidateCard({ application, onSelect, selecting }) {
  return (
    <div className="card">
      <div className="card__header">
        <div>
          <h3 className="card__title">{application.student_name}</h3>
          <p className="card__subtitle">{application.student_email}</p>
        </div>
        {application.compatibility_score != null && (
          <span className="score font-mono">{application.compatibility_score}</span>
        )}
      </div>
      <div className="card__footer">
        <button
          className="btn btn--primary btn--sm"
          disabled={selecting}
          onClick={() => onSelect(application.id)}
        >
          {selecting ? 'Seleccionando...' : 'Seleccionar'}
        </button>
      </div>
    </div>
  );
}

function NgoProjectDetailPage() {
  const { id } = useParams();
  const { project, assignment, deliverables, applications, loading, error, actions } = useProjectDetail(id);

  const [deliverableTitle, setDeliverableTitle] = useState('');
  const [deliverableDescription, setDeliverableDescription] = useState('');

  const isTerminal = project ? isTerminalStatus(project.status) : false;
  const readOnly = isTerminal;

  const showCandidateSection = project?.status === 'pending' && !assignment;
  const showAssignmentSection = !!assignment;
  const showDeliverableForm =
    showAssignmentSection && !isTerminal && !hasActiveDeliverable(deliverables);

  if (loading) return <p className="loading">Cargando...</p>;

  if (error && !project) {
    return (
      <div className="alert alert--error" role="alert">
        {error}
      </div>
    );
  }

  if (!project) return null;

  async function handleCreateDeliverable(event) {
    event.preventDefault();
    if (!deliverableTitle.trim()) return;

    const created = await actions.handleCreateDeliverable({
      title: deliverableTitle.trim(),
      description: deliverableDescription.trim(),
    });

    if (created) {
      setDeliverableTitle('');
      setDeliverableDescription('');
    }
  }

  return (
    <div>
      {error && (
        <div className="alert alert--error" role="alert" style={{ marginBottom: 'var(--space-5)' }}>
          {error}
        </div>
      )}

      <div className="page-header">
        <div>
          <h1 className="page-title">{project.title}</h1>
          <p className="page-subtitle">{project.description}</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          {canCompleteProject(project, deliverables) && (
            <button
              className="btn btn--primary btn--sm"
              onClick={actions.handleMarkCompleted}
            >
              Marcar como completado
            </button>
          )}
          {canCancelProject(project.status) && (
            <button
              className="btn btn--danger btn--sm"
              onClick={actions.handleCancelProject}
            >
              Cancelar proyecto
            </button>
          )}
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

      {/* Candidate selection section — pending without assignment */}
      {showCandidateSection && (
        <div className="section">
          <div className="section__header">
            <h2 className="section__title">Candidatos aprobados</h2>
          </div>
          {applications.length === 0 && (
            <div className="empty-state">
              <p className="empty-state__text">No hay candidatos aprobados para este proyecto.</p>
            </div>
          )}
          {applications.length > 0 && (
            <div className="item-list">
              {applications.map((app) => (
                <CandidateCard
                  key={app.id}
                  application={app}
                  onSelect={actions.handleSelectCandidate}
                  selecting={false}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Assignment + deliverables section */}
      {showAssignmentSection && (
        <div style={{ marginTop: 'var(--space-6)' }}>
          <div className="card card--elevated card--accent" style={{ marginBottom: 'var(--space-5)' }}>
            <div className="card__header">
              <div>
                <h2 className="card__title">{assignment.student_name}</h2>
                <p className="card__subtitle">{assignment.student_email}</p>
              </div>
              <span className="badge badge--accent">Asignado</span>
            </div>
            {assignment.start_date && (
              <div className="card__footer">
                <span className="text-muted text-sm font-mono">{assignment.start_date}</span>
              </div>
            )}
          </div>

          {/* Deliverables */}
          <div className="section">
            <div className="section__header">
              <h2 className="section__title">Entregables</h2>
            </div>
            {deliverables.length === 0 && (
              <div className="empty-state">
                <p className="empty-state__text">No hay entregables todavía.</p>
              </div>
            )}
            {deliverables.length > 0 && (
              <div className="item-list">
                {deliverables.map((d) => (
                  <DeliverableCard
                    key={d.id}
                    deliverable={d}
                    variant="ngo"
                    onApprove={(id) => actions.handleReview(id, 'approved')}
                    onReject={(id) => actions.handleReview(id, 'rejected')}
                    readOnly={readOnly}
                  />
                ))}
              </div>
            )}

            {showDeliverableForm && (
              <form className="card" onSubmit={handleCreateDeliverable} style={{ marginTop: 'var(--space-4)' }}>
                <div className="card__header">
                  <h3 className="card__title">Nuevo entregable</h3>
                </div>
                <div className="card__body">
                  <div className="form-group">
                    <label htmlFor="deliverable-title">Título del entregable</label>
                    <input
                      id="deliverable-title"
                      className="input"
                      value={deliverableTitle}
                      onChange={(e) => setDeliverableTitle(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group" style={{ marginTop: 'var(--space-3)' }}>
                    <label htmlFor="deliverable-description">Descripción del entregable</label>
                    <textarea
                      id="deliverable-description"
                      className="input"
                      rows={3}
                      value={deliverableDescription}
                      onChange={(e) => setDeliverableDescription(e.target.value)}
                    />
                  </div>
                </div>
                <div className="card__footer">
                  <button className="btn btn--primary btn--sm" type="submit">
                    Crear entregable
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NgoProjectDetailPage;