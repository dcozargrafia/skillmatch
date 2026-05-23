import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useNgoProjectForm from '../../hooks/useNgoProjectForm.jsx';

const MODALITIES = ['remoto', 'presencial', 'híbrido'];

function NgoProjectFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { project, loading, error, mode, handleSubmit: onSubmit } = useNgoProjectForm(id);

  const [title, setTitle] = useState(project?.title ?? '');
  const [description, setDescription] = useState(project?.description ?? '');
  const [objectives, setObjectives] = useState(project?.objectives ?? '');
  const [estimatedHours, setEstimatedHours] = useState(project?.estimated_hours ?? '');
  const [deadline, setDeadline] = useState(project?.deadline ?? '');
  const [modality, setModality] = useState(project?.modality ?? MODALITIES[0]);
  const [titleError, setTitleError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setTitleError('');

    if (!title.trim()) {
      setTitleError('El título es obligatorio.');
      return;
    }

    const data = {
      title: title.trim(),
      description,
      objectives,
      estimated_hours: estimatedHours ? Number(estimatedHours) : undefined,
      deadline: deadline || undefined,
      modality,
    };

    const result = await onSubmit(data);
    if (result) {
      navigate(`/ngo/projects/${result.id}`);
    }
  }

  if (loading) return <p className="loading">Cargando...</p>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{mode === 'edit' ? 'Editar proyecto' : 'Nuevo proyecto'}</h1>
      </div>

      <div className="card card--elevated" style={{ maxWidth: '640px' }}>
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="form-field">
            <label className="form-label">Título</label>
            <input
              type="text"
              aria-label="Título"
              className={`form-input${titleError ? ' form-input--error' : ''}`}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            {titleError && <span className="form-hint form-hint--error">{titleError}</span>}
          </div>

          <div className="form-field">
            <label className="form-label">Descripción</label>
            <textarea
              aria-label="Descripción"
              className="form-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="form-field">
            <label className="form-label">Objetivos</label>
            <textarea
              aria-label="Objetivos"
              className="form-textarea"
              value={objectives}
              onChange={(e) => setObjectives(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
            <div className="form-field" style={{ flex: 1 }}>
              <label className="form-label">Horas estimadas</label>
              <input
                type="number"
                aria-label="Horas estimadas"
                className="form-input"
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(e.target.value)}
              />
            </div>

            <div className="form-field" style={{ flex: 1 }}>
              <label className="form-label">Deadline</label>
              <input
                type="date"
                aria-label="Deadline"
                className="form-input"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>
          </div>

          <div className="form-field">
            <label className="form-label">Modalidad</label>
            <select
              aria-label="Modalidad"
              className="form-select"
              value={modality}
              onChange={(e) => setModality(e.target.value)}
            >
              {MODALITIES.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {error && (
            <div className="alert alert--error" role="alert">{error}</div>
          )}

          <button type="submit" className="btn btn--primary">Guardar</button>
        </form>
      </div>
    </div>
  );
}

export default NgoProjectFormPage;