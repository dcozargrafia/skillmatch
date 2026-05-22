import { Link, NavLink, Outlet } from 'react-router-dom';
import useAuthStore from '../hooks/useAuthStore';

function StudentLayout() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  return (
    <>
      <header className="app-header">
        <Link to="/student/projects" className="app-header__brand">
          Skill<span>Match</span>
        </Link>
        <div className="app-header__user">
          <span className="app-header__name">{user?.name} · Estudiante</span>
          <button type="button" className="btn btn--ghost btn--sm" onClick={logout}>
            Cerrar sesión
          </button>
        </div>
      </header>
      <div className="app-shell">
        <nav className="app-sidebar">
          <NavLink
            to="/student/profile"
            className={({ isActive }) =>
              `app-sidebar__link${isActive ? ' app-sidebar__link--active' : ''}`
            }
          >
            Mi perfil
          </NavLink>
          <NavLink
            to="/student/projects"
            className={({ isActive }) =>
              `app-sidebar__link${isActive ? ' app-sidebar__link--active' : ''}`
            }
          >
            Proyectos disponibles
          </NavLink>
          <NavLink
            to="/student/applications"
            className={({ isActive }) =>
              `app-sidebar__link${isActive ? ' app-sidebar__link--active' : ''}`
            }
          >
            Proyectos asignados
          </NavLink>
          <NavLink
            to="/student/history"
            className={({ isActive }) =>
              `app-sidebar__link${isActive ? ' app-sidebar__link--active' : ''}`
            }
          >
            Historial
          </NavLink>
        </nav>
        <main className="app-main">
          <Outlet />
        </main>
      </div>
    </>
  );
}

export default StudentLayout;
