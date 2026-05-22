import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  getProjectById,
  updateProjectStatus,
  cancelProject,
} from '../../../infrastructure/api/projectApi.js';
import { getAssignmentsByProject, createAssignment } from '../../../infrastructure/api/assignmentApi.js';
import { getApplicationsByProject } from '../../../infrastructure/api/applicationApi.js';
import {
  createDeliverable,
  getDeliverablesByAssignment,
  reviewDeliverable,
} from '../../../infrastructure/api/deliverableApi.js';
import {
  getNextStatuses,
  getStatusLabel,
  hasActiveDeliverable,
  isTerminalStatus,
} from '../../../domain/project/Project.js';

const REVIEW_STATUSES = ['in_review'];
const ACTION_LABELS = {
  in_progress: 'Iniciar proyecto',
  in_review: 'Enviar a revisión',
  completed: 'Marcar como completado',
  rejected: 'Marcar como rechazado',
};

function DeliverableCard({ deliverable, onReview, readOnly }) {
  const badgeClass =
    deliverable.status === 'approved'
      ? 'badge badge--success'
      : deliverable.status === 'rejected'
        ? 'badge badge--error'
        : deliverable.status === 'in_review'
          ? 'badge badge--warning'
          : 'badge';

  return (
    <div className="card">
      <div className="card__header">
        <h3 className="card__title">{deliverable.title}</h3>
        <span className={badgeClass}>{deliverable.status}</span>
      </div>
      {deliverable.description && (
        <div className="card__body">
          <p>{deliverable.description}</p>
        </div>
      )}
      {!readOnly && deliverable.status === 'in_review' && (
        <div className="card__footer">
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <button
              className="btn btn--primary btn--sm"
              onClick={() => onReview(deliverable.id, 'approved')}
            >
              Aprobar
            </button>
            <button
              className="btn btn--danger btn--sm"
              onClick={() => onReview(deliverable.id, 'rejected')}
            >
              Rechazar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

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
  const [project, setProject] = useState(null);
  const [assignment, setAssignment] = useState(null);
  const [deliverables, setDeliverables] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingAssignment, setLoadingAssignment] = useState(false);
  const [loadingDeliverables, setLoadingDeliverables] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [selectingId, setSelectingId] = useState(null);
  const [deliverableTitle, setDeliverableTitle] = useState('');
  const [deliverableDescription, setDeliverableDescription] = useState('');
  const [submittingDeliverable, setSubmittingDeliverable] = useState(false);
  const [mutatingStatus, setMutatingStatus] = useState(false);

  const isTerminal = project ? isTerminalStatus(project.status) : false;

  async function loadAssignment(projId) {
    setLoadingAssignment(true);
    try {
      const asgn = await getAssignmentsByProject(projId);
      setAssignment(asgn ?? null);
      if (asgn?.id) {
        loadDeliverables(asgn.id);
      }
    } catch (err) {
      if (err?.response?.status === 404) {
        setAssignment(null);
      } else {
        setErrorMsg('Error al cargar la asignación.');
      }
    } finally {
      setLoadingAssignment(false);
    }
  }

  async function loadDeliverables(asgnId) {
    setLoadingDeliverables(true);
    try {
      const data = await getDeliverablesByAssignment(asgnId);
      setDeliverables(data ?? []);
    } catch {
      setDeliverables([]);
    } finally {
      setLoadingDeliverables(false);
    }
  }

  async function syncProjectState() {
    const [proj, asgn] = await Promise.all([getProjectById(id), getAssignmentsByProject(id)]);
    setProject(proj);
    setAssignment(asgn ?? null);

    if (asgn?.id) {
      await loadDeliverables(asgn.id);
    } else {
      setDeliverables([]);
    }

    if (proj.status === 'pending') {
      await loadApplications(id);
    } else {
      setApplications([]);
    }
  }

  async function runMutationWithResync(mutationFn, fallbackMessage, forbiddenMessage = null) {
    setErrorMsg('');

    try {
      await mutationFn();
      await syncProjectState();
      return true;
    } catch (err) {
      if (err?.response?.status === 403) {
        setErrorMsg(forbiddenMessage ?? 'No tienes permiso para realizar esta acción.');
      } else if (err?.response?.status === 400) {
        setErrorMsg('No se pudo completar la transición de estado solicitada.');
      } else {
        setErrorMsg(fallbackMessage);
      }

      try {
        await syncProjectState();
      } catch {
        // noop: preserve original mutation error message
      }

      return false;
    }
  }

  async function loadApplications(projId) {
    try {
      const apps = await getApplicationsByProject(projId);
      setApplications(apps ?? []);
    } catch {
      setApplications([]);
    }
  }

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setErrorMsg('');
    setProject(null);
    setAssignment(null);
    setDeliverables([]);
    setApplications([]);

    getProjectById(id)
      .then((proj) => {
        setProject(proj);
        setLoading(false);
        // Sequential: after project loads, load assignment
        loadAssignment(id);
        // Also load applications for pending state
        if (proj.status === 'pending') {
          loadApplications(id);
        }
      })
      .catch(() => {
        setErrorMsg('Error al cargar el proyecto.');
        setLoading(false);
      });
  }, [id]);

  async function handleSelectCandidate(applicationId) {
    setErrorMsg('');
    setSelectingId(applicationId);
    try {
      await createAssignment(applicationId);
      const [proj, asgn] = await Promise.all([getProjectById(id), getAssignmentsByProject(id)]);
      setProject(proj);
      setAssignment(asgn ?? null);
      if (asgn?.id) {
        loadDeliverables(asgn.id);
      }
      setApplications([]);
    } catch (err) {
      if (err?.response?.status === 403) {
        setErrorMsg('No tienes permiso para realizar esta acción.');
      } else {
        setErrorMsg('Error al seleccionar el candidato. Intenta de nuevo.');
      }
    } finally {
      setSelectingId(null);
    }
  }

  async function handleReview(deliverableId, status) {
    try {
      const updated = await reviewDeliverable(deliverableId, { status });
      setDeliverables((prev) =>
        prev.map((d) => (d.id === deliverableId ? { ...d, status: updated.status } : d))
      );
    } catch {
      setErrorMsg('Error al revisar el entregable. Intenta de nuevo.');
    }
  }

  async function handleCreateDeliverable(event) {
    event.preventDefault();
    if (!assignment?.id || !deliverableTitle.trim()) return;

    setSubmittingDeliverable(true);

    const created = await runMutationWithResync(
      () =>
        createDeliverable({
          assignment_id: assignment.id,
          title: deliverableTitle.trim(),
          description: deliverableDescription.trim(),
        }),
      'Error al crear el entregable. Intenta de nuevo.',
      'No tienes permiso para crear entregables.',
    );

    if (created) {
      setDeliverableTitle('');
      setDeliverableDescription('');
    }

    setSubmittingDeliverable(false);
  }

  async function handleStatusTransition(nextStatus) {
    setMutatingStatus(true);
    await runMutationWithResync(
      () => updateProjectStatus(id, nextStatus),
      'Error al actualizar el estado del proyecto. Intenta de nuevo.',
    );
    setMutatingStatus(false);
  }

  async function handleCancelProject() {
    if (!window.confirm('¿Seguro que querés cancelar este proyecto?')) return;

    setMutatingStatus(true);
    await runMutationWithResync(
      () => cancelProject(id),
      'Error al cancelar el proyecto. Intenta de nuevo.',
    );
    setMutatingStatus(false);
  }

  if (loading) return <p className="loading">Cargando...</p>;

  if (errorMsg && !project) {
    return (
      <div className="alert alert--error" role="alert">
        {errorMsg}
      </div>
    );
  }

  if (!project) return null;

  const showCandidateSection = project.status === 'pending' && !assignment;
  const showAssignmentSection = !!assignment;
  const readOnly = isTerminal;
  const nextStatuses = getNextStatuses(project.status).filter((status) => status !== 'cancelled');
  const showDeliverableForm =
    showAssignmentSection && !isTerminal && !hasActiveDeliverable(deliverables);

  return (
    <div>
      {errorMsg && (
        <div className="alert alert--error" role="alert" style={{ marginBottom: 'var(--space-5)' }}>
          {errorMsg}
        </div>
      )}

      <div className="page-header">
        <div>
          <h1 className="page-title">{project.title}</h1>
          <p className="page-subtitle">{project.description}</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          {!isTerminal &&
            nextStatuses.map((status) => (
              <button
                key={status}
                className="btn btn--secondary btn--sm"
                disabled={mutatingStatus}
                onClick={() => handleStatusTransition(status)}
              >
                {ACTION_LABELS[status] ?? `Cambiar a ${getStatusLabel(status)}`}
              </button>
            ))}
          {!isTerminal && (
            <button
              className="btn btn--danger btn--sm"
              disabled={mutatingStatus}
              onClick={handleCancelProject}
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
          {loadingAssignment && <p className="loading">Cargando candidatos...</p>}
          {!loadingAssignment && applications.length === 0 && (
            <div className="empty-state">
              <p className="empty-state__text">No hay candidatos aprobados para este proyecto.</p>
            </div>
          )}
          {!loadingAssignment && applications.length > 0 && (
            <div className="item-list">
              {applications.map((app) => (
                <CandidateCard
                  key={app.id}
                  application={app}
                  onSelect={handleSelectCandidate}
                  selecting={selectingId === app.id}
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
            {loadingDeliverables && <p className="loading">Cargando entregables...</p>}
            {!loadingDeliverables && deliverables.length === 0 && (
              <div className="empty-state">
                <p className="empty-state__text">No hay entregables todavía.</p>
              </div>
            )}
            {!loadingDeliverables && deliverables.length > 0 && (
              <div className="item-list">
                {deliverables.map((d) => (
                  <DeliverableCard
                    key={d.id}
                    deliverable={d}
                    onReview={handleReview}
                    readOnly={readOnly}
                  />
                ))}
              </div>
            )}

            {!loadingDeliverables && showDeliverableForm && (
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
                  <button className="btn btn--primary btn--sm" type="submit" disabled={submittingDeliverable}>
                    {submittingDeliverable ? 'Creando...' : 'Crear entregable'}
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
