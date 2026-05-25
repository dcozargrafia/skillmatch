import { useParams } from 'react-router-dom';
import useStudentProjectDetail from '../../hooks/useStudentProjectDetail.jsx';
import { PageHeader } from '../../components/PageHeader.jsx';
import { Section } from '../../components/Section.jsx';
import { AlertBlock } from '../../components/AlertBlock.jsx';
import { StatusBadge } from '../../components/StatusBadge.jsx';
import { formatDate } from '../../../shared/formatDate.js';

function ProjectDetailPage() {
  const { id } = useParams();
  const {
    project,
    skills,
    applied,
    loading,
    error,
    successMessage,
    handleApply,
  } = useStudentProjectDetail(id);

  if (loading) return <p className="loading">Cargando...</p>;
  if (!project) return null;

  return (
    <div>
      <PageHeader title={project.title} subtitle={project.ngo?.name}>
        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          <StatusBadge>{project.modality}</StatusBadge>
          <StatusBadge>{project.status}</StatusBadge>
        </div>
      </PageHeader>

      <div className="card card--elevated" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="card__body">
          <p>{project.description}</p>
          {project.objectives && (
            <>
              <hr className="divider" />
              <p>{project.objectives}</p>
            </>
          )}
        </div>
        <div className="card__footer">
          <span className="text-muted text-sm">
            Horas estimadas: <span className="font-mono">{project.estimated_hours}</span>
          </span>
          <span className="text-muted text-sm font-mono">{formatDate(project.deadline)}</span>
        </div>
      </div>

      {project.skills?.length > 0 && (
        <Section title="Skills requeridas">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
            {project.skills.map((s) => {
              const skill = skills.find((sk) => sk.id === s.skill_id);
              return skill ? (
                <span key={s.skill_id} className="skill-tag">
                  {skill.name}
                  <span className="skill-tag__level">· {s.required_level}</span>
                </span>
              ) : null;
            })}
          </div>
        </Section>
      )}

      {error && (
        <AlertBlock variant="error" style={{ marginBottom: 'var(--space-4)' }}>
          {error}
        </AlertBlock>
      )}

      {successMessage && (
        <AlertBlock variant="success" style={{ marginBottom: 'var(--space-4)' }}>
          {successMessage}
        </AlertBlock>
      )}

      {project.status === 'pending' && (
        <button
          type="button"
          className="btn btn--primary btn--lg"
          onClick={handleApply}
          disabled={applied}
        >
          {applied ? 'Ya has aplicado' : 'Aplicar a este proyecto'}
        </button>
      )}
    </div>
  );
}

export default ProjectDetailPage;
