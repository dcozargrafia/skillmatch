import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getProjectById } from '../../../infrastructure/api/projectApi.js';
import { getAssignmentsByProject, createAssignment } from '../../../infrastructure/api/assignmentApi.js';
import { getApplicationsByProject } from '../../../infrastructure/api/applicationApi.js';
import { getDeliverablesByAssignment, reviewDeliverable } from '../../../infrastructure/api/deliverableApi.js';

const TERMINAL_STATUSES = ['completed', 'rejected', 'cancelled'];
const REVIEW_STATUSES = ['in_review'];

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

  const isTerminal = project ? TERMINAL_STATUSES.includes(project.status) : false;

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
          </div>
        </div>
      )}
    </div>
  );
}

export default NgoProjectDetailPage;