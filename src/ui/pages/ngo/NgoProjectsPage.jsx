import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getOwnProjects } from '../../../infrastructure/api/projectApi.js';

function NgoProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOwnProjects().then((data) => {
      setProjects(data);
      setLoading(false);
    });
  }, []);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Mis proyectos</h1>
        <Link to="/ngo/projects/new" className="btn btn--primary">
          Nuevo proyecto
        </Link>
      </div>

      {loading && <p className="loading">Cargando...</p>}

      {!loading && projects.length === 0 && (
        <div className="empty-state">
          <p className="empty-state__text">No tienes proyectos creados todavía.</p>
        </div>
      )}

      {!loading && (
        <div className="card-grid">
          {projects.map((p) => (
            <div key={p.id} className="card card--elevated">
              <div className="card__header">
                <div>
                  <h2 className="card__title">{p.title}</h2>
                  <p className="card__subtitle font-mono">{p.deadline}</p>
                </div>
                <span className="badge">{p.modality}</span>
              </div>
              <div className="card__footer">
                <span className="badge">{p.status}</span>
                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                  <Link to={`/ngo/projects/${p.id}`} className="btn btn--secondary btn--sm">
                    Ver detalle
                  </Link>
                  <Link to={`/ngo/projects/${p.id}/edit`} className="btn btn--ghost btn--sm">
                    Editar
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default NgoProjectsPage;
