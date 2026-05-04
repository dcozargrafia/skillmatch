import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUseCase } from '../../../application/auth/registerUseCase.js';

function RegisterPage() {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [organizationName, setOrganizationName] = useState('');
  const [area, setArea] = useState('');
  const [emailError, setEmailError] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setEmailError('');

    if (!name || !email || !password) return;
    if (role === 'ngo' && !organizationName) return;

    const data = { name, email, password, role };
    if (role === 'ngo') {
      data.organization_name = organizationName;
      data.area = area;
    }

    setIsLoading(true);
    try {
      await registerUseCase(data);
      navigate('/login', { replace: true });
    } catch (err) {
      if (err?.response?.status === 409) {
        setEmailError('Email ya registrado');
      } else {
        setError('Error al registrarse. Inténtalo de nuevo.');
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card__brand">
          <span className="auth-card__logo">Skill<span>Match</span></span>
        </div>

        <h1 className="auth-card__title">Crear cuenta</h1>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="form-field">
            <label className="form-label" htmlFor="name">Nombre</label>
            <input
              id="name"
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
            />
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className={`form-input${emailError ? ' form-input--error' : ''}`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
            {emailError && <span className="form-hint form-hint--error">{emailError}</span>}
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="role">Rol</label>
            <select
              id="role"
              className="form-select"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="student">Estudiante</option>
              <option value="ngo">ONG</option>
            </select>
          </div>

          {role === 'ngo' && (
            <>
              <div className="form-field">
                <label className="form-label" htmlFor="organizationName">Nombre de organización</label>
                <input
                  id="organizationName"
                  type="text"
                  className="form-input"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                />
              </div>

              <div className="form-field">
                <label className="form-label" htmlFor="area">Área</label>
                <input
                  id="area"
                  type="text"
                  className="form-input"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                />
              </div>
            </>
          )}

          {error && (
            <div className="alert alert--error" role="alert">{error}</div>
          )}

          <button type="submit" className="btn btn--primary" disabled={isLoading}>
            Registrarse
          </button>
        </form>

        <div className="auth-form__footer" style={{ marginTop: 'var(--space-5)', justifyContent: 'center' }}>
          <Link to="/login" className="auth-form__link">
            ¿Ya tienes cuenta? Iniciar sesión
          </Link>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
