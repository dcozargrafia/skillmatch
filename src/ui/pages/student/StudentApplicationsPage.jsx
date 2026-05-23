import { Link } from 'react-router-dom';
import useStudentAssignments from '../../hooks/useStudentAssignments.jsx';
import { DeliverableCard } from '../../components/DeliverableCard.jsx';

function StudentApplicationsPage() {
  const {
    assignments,
    deliverablesByAssignment,
    loading,
    error,
  } = useStudentAssignments();

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
              {(deliverablesByAssignment[assignment.id] || []).map((d) => (
                <DeliverableCard
                  key={d.id}
                  deliverable={d}
                  variant="student"
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