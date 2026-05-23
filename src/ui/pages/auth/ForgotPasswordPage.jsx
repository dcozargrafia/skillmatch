import { Link } from 'react-router-dom';
import useForgotPassword from '../../hooks/useForgotPassword.jsx';
import { AlertBlock } from '../../components/AlertBlock.jsx';
import { AuthCard } from '../../components/AuthCard.jsx';

function ForgotPasswordPage() {
  const { email, setEmail, error, isLoading, sent, handleSubmit } = useForgotPassword();

  if (sent) {
    return (
      <AuthCard brand={false}>
          <div className="auth-confirmation">
            <p className="auth-confirmation__text">
              Si el email está registrado, recibirás un enlace para restablecer tu contraseña.
            </p>
          </div>
          <div className="auth-form__footer" style={{ marginTop: 'var(--space-6)', justifyContent: 'center' }}>
            <Link to="/login" className="auth-form__link">Volver al inicio de sesión</Link>
          </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Recuperar contraseña"
      subtitle="Introduce tu email y te enviaremos un enlace para restablecer tu contraseña."
    >

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
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

          {error && (
            <AlertBlock variant="error">{error}</AlertBlock>
          )}

          <button type="submit" className="btn btn--primary" disabled={isLoading}>
            {isLoading ? 'Enviando...' : 'Enviar enlace'}
          </button>
        </form>

        <div className="auth-form__footer" style={{ marginTop: 'var(--space-5)', justifyContent: 'center' }}>
          <Link to="/login" className="auth-form__link">Volver al inicio de sesión</Link>
        </div>
    </AuthCard>
  );
}

export default ForgotPasswordPage;
