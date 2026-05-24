export function AuthCard({ brand = true, title, subtitle, children }) {
  return (
    <div className="auth-page">
      <div className="auth-card">
        {brand && (
          <div className="auth-card__brand">
            <img
              className="auth-card__logo"
              src="/branding/logo-navbar-tight.svg"
              alt="SkillMatch"
            />
          </div>
        )}
        {title && <h1 className="auth-card__title">{title}</h1>}
        {subtitle && <p className="auth-card__subtitle">{subtitle}</p>}
        {children}
      </div>
    </div>
  );
}
