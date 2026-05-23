import useAdminDashboard from '../../hooks/useAdminDashboard.jsx';

const CATEGORIES = ['Desarrollo', 'Diseno', 'CMS', 'Marketing'];

function AdminDashboardPage() {
  const {
    skills,
    ngos,
    isLoading,
    error,
    skillToDelete,
    skillError,
    newSkillName,
    newSkillCategory,
    setNewSkillName,
    setNewSkillCategory,
    handleCreateSkill,
    handleDeleteSkill,
    handleConfirmDelete,
    cancelDelete,
    handleVerifyNgo,
  } = useAdminDashboard();

  if (isLoading) {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">Panel de administración</h1>
        </div>
        <div className="loading">Cargando...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Panel de administración</h1>
      </div>

      {error && (
        <div className="alert alert--error" role="alert" style={{ marginBottom: 'var(--space-4)' }}>
          {error}
        </div>
      )}

      {/* Diálogo de confirmación de eliminación */}
      {skillToDelete && (
        <div className="dialog-overlay">
          <div className="dialog" role="dialog">
            <h2 className="dialog__title">Eliminar skill</h2>
            <p className="dialog__body">
              Esta acción realizará una eliminación en cascada de todos los datos relacionados. Esta operación no se puede deshacer.
            </p>
            <div className="dialog__actions">
              <button className="btn btn--secondary" onClick={cancelDelete}>
                Cancelar
              </button>
              <button className="btn btn--danger" onClick={handleConfirmDelete}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Skills */}
      <div className="section">
        <div className="section__header">
          <h2 className="section__title">Skills</h2>
        </div>

        {skillError && (
          <div className="alert alert--error" role="alert" style={{ marginBottom: 'var(--space-4)' }}>
            {skillError}
          </div>
        )}

        <div className="card card--elevated" style={{ maxWidth: '560px', marginBottom: 'var(--space-6)' }}>
          <form onSubmit={(e) => { e.preventDefault(); handleCreateSkill({ name: newSkillName, category: newSkillCategory }); }} style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div className="toolbar__group" style={{ flex: 2 }}>
              <label className="form-label">Nombre de la skill</label>
              <input
                type="text"
                aria-label="Nombre de la skill"
                className="form-input"
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
              />
            </div>
            <div className="toolbar__group" style={{ flex: 1 }}>
              <label className="form-label">Categoría</label>
              <select
                aria-label="Categoría"
                className="form-select"
                value={newSkillCategory}
                onChange={(e) => setNewSkillCategory(e.target.value)}
              >
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <button type="submit" className="btn btn--primary">Añadir</button>
          </form>
        </div>

        <div className="item-list">
          {skills.map((s) => (
            <div key={s.id} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-3) var(--space-5)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <span className="skill-tag">{s.name}</span>
                <span className="badge">{s.category}</span>
              </div>
              <button className="btn btn--danger btn--sm" onClick={() => handleDeleteSkill(s.id)}>
                Eliminar
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ONGs */}
      <div className="section">
        <div className="section__header">
          <h2 className="section__title">ONGs pendientes de verificación</h2>
        </div>

        {ngos.length === 0 && (
          <div className="empty-state">
            <p className="empty-state__text">No hay ONGs pendientes de verificación.</p>
          </div>
        )}

        <div className="item-list">
          {ngos.map((n) => (
            <div key={n.id} className="card">
              <div className="card__header">
                <div>
                  <h3 className="card__title">{n.organization_name}</h3>
                  <p className="card__subtitle">{n.email}</p>
                </div>
                <span className={`badge${n.verified ? ' badge--success' : ' badge--warning'}`}>
                  {n.verified ? 'Verificada' : 'Pendiente'}
                </span>
              </div>
              {!n.verified && (
                <div className="card__footer">
                  <button className="btn btn--primary btn--sm" onClick={() => handleVerifyNgo(n.id)}>
                    Verificar
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboardPage;