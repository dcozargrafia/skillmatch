import { Link, useNavigate } from 'react-router-dom';
import useStudentAssignments from '../../hooks/useStudentAssignments.jsx';
import { DeliverableCard } from '../../components/DeliverableCard.jsx';
import { PageHeader } from '../../components/PageHeader.jsx';
import { EmptyState } from '../../components/EmptyState.jsx';
import { getStatusLabel, getProjectStatusMessage, sortDeliverables } from '../../../domain/project/Project.js';
import { StatusBadge } from '../../components/StatusBadge.jsx';

function StudentApplicationsPage() {
  const navigate = useNavigate();
  const {
    assignments,
    deliverablesByAssignment,
    loading,
    error,
  } = useStudentAssignments();

  function handleViewDetails(deliverable, assignmentId) {
    navigate(`/student/assignments/${assignmentId}?deliverable=${deliverable.id}`);
  }

  if (loading) return <p className="loading">Cargando...</p>;

  if (!assignments.length) {
    return (
      <div>
        <PageHeader title="Proyectos asignados" />
        <EmptyState message="No tienes proyectos asignados todavía." />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Proyectos asignados" />

      <div className="item-list">
        {assignments.map((assignment) => {
          const deliverables = sortDeliverables(deliverablesByAssignment[assignment.id] || []);
          const statusMessage = getProjectStatusMessage(assignment.project_status, deliverables);
          return (
            <div key={assignment.id} className="card">
              <div className="card__header">
                <div>
                  <h2 className="card__title">{assignment.project_title}</h2>
                </div>
                <StatusBadge>{getStatusLabel(assignment.project_status)}</StatusBadge>
              </div>
              {statusMessage && (
                <div className="card__body">
                  <p className="text-muted text-sm">{statusMessage}</p>
                </div>
              )}
              <div className="card__body">
                {deliverables.map((d) => (
                  <DeliverableCard
                    key={d.id}
                    deliverable={d}
                    variant="student"
                    showViewDetails={true}
                    onViewDetails={() => handleViewDetails(d, assignment.id)}
                  />
                ))}
              </div>
              <div className="card__footer">
                <Link to={`/student/assignments/${assignment.id}`} className="btn btn--secondary btn--sm">
                  Ver detalles
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default StudentApplicationsPage;
