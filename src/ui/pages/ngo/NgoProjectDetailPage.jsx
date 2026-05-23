import { useState } from 'react';
import { useParams } from 'react-router-dom';
import useProjectDetail from '../../hooks/useProjectDetail.jsx';
import { DeliverableCard } from '../../components/DeliverableCard.jsx';
import {
  hasActiveDeliverable,
  isTerminalStatus,
  canCompleteProject,
  getStatusLabel,
  getProjectStatusMessage,
  sortDeliverables,
} from '../../../domain/project/Project.js';
import { canCancelProject } from '../../../domain/ngo/Ngo.js';
import { PageHeader } from '../../components/PageHeader.jsx';
import { Section } from '../../components/Section.jsx';
import { EmptyState } from '../../components/EmptyState.jsx';
import { AlertBlock } from '../../components/AlertBlock.jsx';

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
      <AlertBlock variant="error">
        {error}
      </AlertBlock>
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
        <AlertBlock variant="error" style={{ marginBottom: 'var(--space-5)' }}>
          {error}
        </AlertBlock>
      )}

      <PageHeader title={project.title} subtitle={project.description}>
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
          <span className="badge">{getStatusLabel(project.status)}</span>
        </div>
      </PageHeader>

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
        <Section title="Candidatos aprobados">
          {applications.length === 0 && (
            <EmptyState message="No hay candidatos aprobados para este proyecto." />
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
        </Section>
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
          <Section title="Entregables">
            {getProjectStatusMessage(project.status, deliverables) && (
              <div className="card__body" style={{ marginBottom: 'var(--space-4)' }}>
                <p className="text-muted text-sm">{getProjectStatusMessage(project.status, deliverables)}</p>
              </div>
            )}
            {deliverables.length === 0 && (
              <EmptyState message="No hay entregables todavía." />
            )}
            {deliverables.length > 0 && (
              <div className="item-list">
                {sortDeliverables(deliverables).map((d) => (
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
          </Section>
        </div>
      )}
    </div>
  );
}

export default NgoProjectDetailPage;
