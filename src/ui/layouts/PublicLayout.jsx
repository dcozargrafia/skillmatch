import { Link, Outlet } from 'react-router-dom';

function PublicLayout() {
  return (
    <>
      <header className="app-header">
        <Link to="/" className="app-header__brand">
            <img src="/branding/logo-navbar-tight.svg" alt="SkillMatch" className="app-header__logo" />
        </Link>
        <nav className="app-header__user">
          <Link to="/login" className="btn btn--ghost btn--sm">Iniciar sesión</Link>
          <Link to="/register" className="btn btn--primary btn--sm">Registrarse</Link>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </>
  );
}

export default PublicLayout;
