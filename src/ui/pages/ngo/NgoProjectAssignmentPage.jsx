import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getApplicationsByProject } from '../../../infrastructure/api/applicationApi.js';
import { getAssignmentsByProject, createAssignment } from '../../../infrastructure/api/assignmentApi.js';
import { PageHeader } from '../../components/PageHeader.jsx';
import { Section } from '../../components/Section.jsx';
import { EmptyState } from '../../components/EmptyState.jsx';
import { AlertBlock } from '../../components/AlertBlock.jsx';
import { StatusBadge } from '../../components/StatusBadge.jsx';
import { formatDateTime } from '../../../shared/formatDate.js';

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
      <PageHeader title="Asignación del proyecto" />

      {errorMsg && (
        <AlertBlock variant="error" style={{ marginBottom: 'var(--space-5)' }}>
          {errorMsg}
        </AlertBlock>
      )}

      {loading && <p className="loading">Cargando...</p>}

      {!loading && assignment && (
        <div className="card card--elevated card--accent" style={{ maxWidth: '480px' }}>
          <div className="card__header">
            <div>
              <h2 className="card__title">{assignment.student_name}</h2>
              <p className="card__subtitle">{assignment.student_email}</p>
            </div>
            <StatusBadge variant="accent">Asignado</StatusBadge>
          </div>
          <div className="card__footer">
            <span className="text-muted text-sm font-mono">{formatDateTime(assignment.start_date)}</span>
          </div>
        </div>
      )}

      {!loading && !assignment && approvedCandidates.length === 0 && (
        <EmptyState message="No hay candidatos aprobados para este proyecto." />
      )}

      {!loading && !assignment && approvedCandidates.length > 0 && (
        <Section title="Candidatos aprobados">
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
        </Section>
      )}
    </div>
  );
}

export default NgoProjectAssignmentPage;
