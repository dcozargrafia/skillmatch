import { useState } from 'react';
import { useParams } from 'react-router-dom';
import useProjectDetail from '../../hooks/useProjectDetail.jsx';
import { DeliverableCard } from '../../components/DeliverableCard.jsx';
import { sortDeliverables, getDeliverableStatusLabel } from '../../../domain/project/Project.js';

function NgoDeliverablesPage() {
  const { projectId, assignmentId } = useParams();
  const { deliverables, loading, error, actions } = useProjectDetail(projectId);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleCreate(e) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const created = await actions.handleCreateDeliverable({
      title: newTitle.trim(),
      description: newDescription,
    });
    if (created) {
      setNewTitle('');
      setNewDescription('');
    }
  }

  async function handleReview(id, status) {
    setErrorMsg('');
    const success = await actions.handleReview(id, status);
    if (!success) {
      setErrorMsg('Error al revisar el entregable. Intenta de nuevo.');
    }
  }

  // Sort deliverables for display
  const sortedDeliverables = sortDeliverables(deliverables);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Entregables del proyecto</h1>
      </div>

      {errorMsg && (
        <div className="alert alert--error" role="alert" style={{ marginBottom: 'var(--space-5)' }}>
          {errorMsg}
        </div>
      )}

      <div className="card card--elevated section" style={{ maxWidth: '560px' }}>
        <div className="card__header">
          <h2 className="card__title">Añadir hito</h2>
        </div>
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div className="form-field">
            <label className="form-label">Título del hito</label>
            <input
              type="text"
              aria-label="Título del hito"
              className="form-input"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
          </div>
          <div className="form-field">
            <label className="form-label">Descripción</label>
            <input
              type="text"
              aria-label="Descripción del hito"
              className="form-input"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
            />
          </div>
          <div>
            <button type="submit" className="btn btn--primary">Añadir hito</button>
          </div>
        </form>
      </div>

      {loading && <p className="loading">Cargando...</p>}

      {!loading && (
        <div className="item-list">
          {sortedDeliverables.map((d) => (
            <DeliverableCard
              key={d.id}
              deliverable={d}
              variant="ngo"
              onApprove={(id) => handleReview(id, 'approved')}
              onReject={(id) => handleReview(id, 'rejected')}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default NgoDeliverablesPage;