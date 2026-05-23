import { Link, useNavigate } from 'react-router-dom';
import useStudentAssignments from '../../hooks/useStudentAssignments.jsx';
import { DeliverableCard } from '../../components/DeliverableCard.jsx';
import { getStatusLabel, getProjectStatusMessage, sortDeliverables } from '../../../domain/project/Project.js';

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
        {assignments.map((assignment) => {
          const deliverables = sortDeliverables(deliverablesByAssignment[assignment.id] || []);
          const statusMessage = getProjectStatusMessage(assignment.project_status, deliverables);
          return (
            <div key={assignment.id} className="card">
              <div className="card__header">
                <div>
                  <h2 className="card__title">{assignment.project_title}</h2>
                </div>
                <span className="badge">{getStatusLabel(assignment.project_status)}</span>
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