import { useState, useEffect } from 'react';
import useNgoProfile from '../../hooks/useNgoProfile.jsx';
import { PageHeader } from '../../components/PageHeader.jsx';
import { AlertBlock } from '../../components/AlertBlock.jsx';

function NgoProfilePage() {
  const { profile, loading, error, successMessage, handleSave } = useNgoProfile();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [area, setArea] = useState('');

  useEffect(() => {
    if (profile) {
      setName(profile.user.name ?? '');
      setEmail(profile.user.email ?? '');
      setOrganizationName(profile.ngo.organization_name ?? '');
      setArea(profile.ngo.area ?? '');
    }
  }, [profile]);

  async function onSave() {
    await handleSave({ name, email, organization_name: organizationName, area });
  }

  if (loading) return <p className="loading">Cargando...</p>;

  if (error && !profile) return <AlertBlock variant="error">{error}</AlertBlock>;

  if (!profile) return null;

  const { ngo } = profile;

  return (
    <div>
      <PageHeader title="Mi perfil">
        {ngo.verified
          ? <span className="badge badge--success">ONG verificada</span>
          : <span className="badge badge--warning">Pendiente de verificación</span>
        }
      </PageHeader>

      {!ngo.verified && (
        <AlertBlock variant="warning" style={{ marginBottom: 'var(--space-6)' }}>
          Tu organización está pendiente de verificación por el administrador.
        </AlertBlock>
      )}

      <div className="card card--elevated" style={{ maxWidth: '560px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          <div className="form-field">
            <label className="form-label">Nombre de contacto</label>
            <input
              type="text"
              aria-label="Nombre de contacto"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="form-field">
            <label className="form-label">Email</label>
            <input
              type="email"
              aria-label="Email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-field">
            <label className="form-label">Nombre de organización</label>
            <input
              type="text"
              aria-label="Nombre de organización"
              className="form-input"
              value={organizationName}
              onChange={(e) => setOrganizationName(e.target.value)}
            />
          </div>

          <div className="form-field">
            <label className="form-label">Área</label>
            <input
              type="text"
              aria-label="Área"
              className="form-input"
              value={area}
              onChange={(e) => setArea(e.target.value)}
            />
          </div>

          {successMessage && <AlertBlock variant="success">{successMessage}</AlertBlock>}
          {error && <AlertBlock variant="error">{error}</AlertBlock>}
        </div>
        <div className="card__footer" style={{ marginTop: 'var(--space-5)' }}>
          <button type="button" className="btn btn--primary" onClick={onSave}>
            Guardar perfil
          </button>
        </div>
      </div>
    </div>
  );
}

export default NgoProfilePage;
