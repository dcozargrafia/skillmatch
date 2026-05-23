import { useSearchParams, Link } from 'react-router-dom';
import useResetPassword from '../../hooks/useResetPassword.jsx';
import { AlertBlock } from '../../components/AlertBlock.jsx';
import { AuthCard } from '../../components/AuthCard.jsx';

function ResetPasswordPage() {
  const {
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    errors,
    isLoading,
    isSuccess,
    error,
    handleSubmit,
  } = useResetPassword();

  if (isSuccess) {
    return (
      <AuthCard title="Contraseña restablecida" subtitle="Tu contraseña ha sido cambiada correctamente.">
          <div className="auth-form__footer" style={{ marginTop: 'var(--space-5)', justifyContent: 'center' }}>
            <Link to="/login" className="auth-form__link">Volver al inicio de sesión</Link>
          </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Restablecer contraseña">

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="form-field">
            <label className="form-label" htmlFor="password">Nueva contraseña</label>
            <input
              id="password"
              type="password"
              className={`form-input${errors.password ? ' form-input--error' : ''}`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {errors.password && (
              <span className="form-hint form-hint--error">{errors.password}</span>
            )}
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="confirm">Confirmar contraseña</label>
            <input
              id="confirm"
              type="password"
              className={`form-input${errors.confirmPassword ? ' form-input--error' : ''}`}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {errors.confirmPassword && (
              <span className="form-hint form-hint--error">{errors.confirmPassword}</span>
            )}
          </div>

          {error && (
            <AlertBlock variant="error">
              {error}
              {errors.confirmPassword && (
                <> — <Link to="/forgot-password" className="auth-form__link">Solicitar nuevo enlace</Link></>
              )}
            </AlertBlock>
          )}

          <button type="submit" className="btn btn--primary" disabled={isLoading}>
            {isLoading ? 'Restableciendo...' : 'Restablecer contraseña'}
          </button>
        </form>
    </AuthCard>
  );
}

export default ResetPasswordPage;
