import { Link, NavLink, Outlet } from 'react-router-dom';
import useAuthStore from '../hooks/useAuthStore';

function NgoLayout() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  return (
    <>
      <header className="app-header">
        <Link to="/ngo/projects" className="app-header__brand">
            <img src="/branding/logo.svg" alt="SkillMatch" className="app-header__logo" />
        </Link>
        <div className="app-header__user">
          <span className="app-header__name">{user?.name} · ONG</span>
          <button type="button" className="btn btn--ghost btn--sm" onClick={logout}>
            Cerrar sesión
          </button>
        </div>
      </header>
      <div className="app-shell">
        <nav className="app-sidebar">
          <NavLink
            to="/ngo/projects"
            className={({ isActive }) =>
              `app-sidebar__link${isActive ? ' app-sidebar__link--active' : ''}`
            }
          >
            Proyectos
          </NavLink>
          <NavLink
            to="/ngo/profile"
            className={({ isActive }) =>
              `app-sidebar__link${isActive ? ' app-sidebar__link--active' : ''}`
            }
          >
              Perfil ONG
          </NavLink>
        </nav>
        <main className="app-main">
          <Outlet />
        </main>
      </div>
    </>
  );
}

export default NgoLayout;
