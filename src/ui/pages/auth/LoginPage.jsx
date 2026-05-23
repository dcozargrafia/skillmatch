import { useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import useAuthStore from '../../hooks/useAuthStore';
import { ROLE_HOME } from '../../router/AppRouter';
import { isNetworkError } from '../../../domain/user/User.js';
import { AlertBlock } from '../../components/AlertBlock.jsx';
import { AuthCard } from '../../components/AuthCard.jsx';

function LoginPage() {
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [offline, setOffline] = useState(false);

  if (user) return <Navigate to={ROLE_HOME[user.role] ?? '/login'} replace />;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!email || !password) return;

    try {
      await login({ email, password });
      setOffline(false);
      const role = useAuthStore.getState().user?.role;
      navigate(ROLE_HOME[role] ?? '/login', { replace: true });
    } catch (err) {
      if (isNetworkError(err)) {
        setOffline(true);
      } else {
        setOffline(false);
        setError(
          err.response?.status === 401
            ? 'Credenciales inválidas'
            : 'Error al iniciar sesión',
        );
      }
    }
  }

  return (
    <AuthCard title="Iniciar sesión">

        {offline && (
          <AlertBlock variant="warning">
            Sin conexión con el servidor. Comprueba que el backend esté activo.
          </AlertBlock>
        )}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="form-field">
            <label className="form-label" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          {error && (
            <AlertBlock variant="error">{error}</AlertBlock>
          )}

          <button type="submit" className="btn btn--primary" disabled={isLoading}>
            {offline ? 'Reintentar' : 'Iniciar sesión'}
          </button>
        </form>

        <div className="auth-form__footer" style={{ marginTop: 'var(--space-5)' }}>
          <Link to="/forgot-password" className="auth-form__link">
            ¿Olvidaste tu contraseña?
          </Link>
          <Link to="/register" className="auth-form__link">
            Crear cuenta
          </Link>
        </div>
    </AuthCard>
  );
}

export default LoginPage;
