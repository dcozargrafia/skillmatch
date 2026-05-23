/**
 * Component: DeliverableCard
 * SDD Phase 3, Task 3.8
 *
 * Shared deliverable rendering component used by both student and NGO views.
 * - student: shows start/submit/retry buttons
 * - ngo: shows approve/reject buttons (hidden when readOnly)
 * - readonly: shows status badge only
 *
 * Internal fileUrl state for student submit flow.
 */

import { useState } from 'react';
import { getDeliverableStatusLabel } from '../../domain/project/Project.js';

/**
 * @param {object} props
 * @param {object} props.deliverable
 * @param {'student'|'ngo'|'readonly'} props.variant
 * @param {function} [props.onStart]
 * @param {function} [props.onSubmit]
 * @param {function} [props.onApprove]
 * @param {function} [props.onReject]
 * @param {boolean} [props.disabled]
 * @param {boolean} [props.readOnly]
 */
export function DeliverableCard({ deliverable, variant, onStart, onSubmit, onApprove, onReject, disabled, readOnly }) {
  const [fileUrl, setFileUrl] = useState('');

  const badgeClass =
    deliverable.status === 'approved'
      ? 'badge badge--success'
      : deliverable.status === 'rejected'
        ? 'badge badge--error'
        : deliverable.status === 'in_review'
          ? 'badge badge--warning'
          : 'badge';

  const isDisabled = !!disabled;

  if (variant === 'readonly') {
    return (
      <div className="card card--accent">
        <div className="card__header">
          <h4 className="card__title">{deliverable.title}</h4>
          <span className={badgeClass}>{getDeliverableStatusLabel(deliverable.status)}</span>
        </div>
        {deliverable.description && (
          <div className="card__body">
            <p>{deliverable.description}</p>
          </div>
        )}
        {deliverable.created_at && (
          <div className="card__footer">
            <span className="text-muted text-sm font-mono">{new Date(deliverable.created_at).toLocaleDateString('es-ES')}</span>
          </div>
        )}
        {deliverable.file_url && (
          <div className="card__body">
            <a href={deliverable.file_url} target="_blank" rel="noopener noreferrer" className="text-link">{deliverable.file_url}</a>
          </div>
        )}
        {deliverable.comment && (
          <div className="card__body">
            <p className="text-muted">{deliverable.comment}</p>
          </div>
        )}
      </div>
    );
  }

  if (variant === 'ngo') {
    return (
      <div className="card">
        <div className="card__header">
          <h3 className="card__title">{deliverable.title}</h3>
          <span className={badgeClass}>{getDeliverableStatusLabel(deliverable.status)}</span>
        </div>
        {deliverable.description && (
          <div className="card__body">
            <p>{deliverable.description}</p>
          </div>
        )}
        {deliverable.file_url && (
          <div className="card__body">
            <a href={deliverable.file_url} target="_blank" rel="noopener noreferrer" className="text-link">{deliverable.file_url}</a>
          </div>
        )}
        {deliverable.comment && (
          <div className="card__body">
            <p className="text-muted">{deliverable.comment}</p>
          </div>
        )}
        {!readOnly && deliverable.status === 'in_review' && (
          <div className="card__footer">
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <button
                className="btn btn--primary btn--sm"
                disabled={isDisabled}
                onClick={() => onApprove?.(deliverable.id)}
              >
                Aprobar
              </button>
              <button
                className="btn btn--danger btn--sm"
                disabled={isDisabled}
                onClick={() => onReject?.(deliverable.id)}
              >
                Rechazar
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // student variant (default)
  return (
    <div className="card card--accent">
      <div className="card__header">
        <h4 className="card__title">{deliverable.title}</h4>
        <span className={badgeClass}>{getDeliverableStatusLabel(deliverable.status)}</span>
      </div>
      {deliverable.description && (
        <div className="card__body">
          <p>{deliverable.description}</p>
        </div>
      )}
      {deliverable.file_url && (
        <div className="card__body">
          <a href={deliverable.file_url} target="_blank" rel="noopener noreferrer" className="text-link">{deliverable.file_url}</a>
        </div>
      )}
      {deliverable.comment && (
        <div className="card__body">
          <p className="text-muted">{deliverable.comment}</p>
        </div>
      )}

      {deliverable.status === 'pending' && (
        <div className="card__footer">
          <button
            className="btn btn--secondary btn--sm"
            disabled={isDisabled}
            onClick={() => onStart?.(deliverable.id)}
          >
            Iniciar
          </button>
        </div>
      )}

      {deliverable.status === 'in_progress' && (
        <div className="card__footer" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 'var(--space-3)' }}>
          <div className="form-field">
            <label className="form-label">URL del archivo</label>
            <input
              type="text"
              aria-label="URL del archivo"
              className="form-input"
              value={fileUrl}
              onChange={(e) => setFileUrl(e.target.value)}
            />
          </div>
          <button
            className="btn btn--primary btn--sm"
            disabled={isDisabled || !fileUrl.trim()}
            onClick={() => {
              if (fileUrl.trim()) {
                onSubmit?.(deliverable.id, fileUrl);
                setFileUrl('');
              }
            }}
          >
            Enviar a revisión
          </button>
        </div>
      )}

      {deliverable.status === 'rejected' && (
        <div className="card__footer">
          <button
            className="btn btn--secondary btn--sm"
            disabled={isDisabled}
            onClick={() => onStart?.(deliverable.id)}
          >
            Reintentar
          </button>
        </div>
      )}
    </div>
  );
}