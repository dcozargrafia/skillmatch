/**
 * Tests para AppRouter (SMAPP-10).
 *
 * Criterios de aceptación:
 * - / redirige a /login
 * - Ruta desconocida redirige a /login
 * - /login accesible sin sesión
 * - /register accesible sin sesión
 * - /student, /ngo, /admin sin sesión → /login
 * - Rol correcto accede a su layout
 * - Rol incorrecto redirige al dashboard propio
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Outlet } from 'react-router-dom';
import useAuthStore from '../hooks/useAuthStore';
import { AppRoutes } from './AppRouter';

// Stubs síncronos de páginas y layouts
const Login = () => <div>LoginPage</div>;
const Register = () => <div>RegisterPage</div>;
const Student = () => <div>StudentLayout</div>;
const Ngo = () => (
  <div>
    NgoLayout
    <Outlet />
  </div>
);
const Admin = () => <div>AdminLayout</div>;
const NgoProjectDetail = () => <div>NgoProjectDetailPage</div>;

/**
 * Renderiza AppRoutes dentro de MemoryRouter con stubs síncronos.
 *
 * @param {string} initialPath
 * @param {object|null} user
 */
function renderAt(initialPath, user = null) {
  useAuthStore.setState({ user });
  render(
    <MemoryRouter initialEntries={[initialPath]}>
      <AppRoutes
        Login={Login}
        Register={Register}
        Student={Student}
        Ngo={Ngo}
        Admin={Admin}
        NgoProjectDetail={NgoProjectDetail}
      />
    </MemoryRouter>,
  );
}

function renderNgoDetailAt(initialPath, user = null) {
  useAuthStore.setState({ user });
  render(
    <MemoryRouter initialEntries={[initialPath]}>
      <AppRoutes
        Login={Login}
        Register={Register}
        Student={Student}
        Ngo={Ngo}
        Admin={Admin}
        NgoProjectDetail={NgoProjectDetail}
      />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  useAuthStore.setState({ user: null });
});

describe('rutas públicas', () => {
  it('/ redirige a /login', () => {
    renderAt('/');
    expect(screen.getByText('LoginPage')).toBeTruthy();
  });

  it('ruta desconocida redirige a /login', () => {
    renderAt('/ruta-inexistente');
    expect(screen.getByText('LoginPage')).toBeTruthy();
  });

  it('/login accesible sin sesión', () => {
    renderAt('/login');
    expect(screen.getByText('LoginPage')).toBeTruthy();
  });

  it('/register accesible sin sesión', () => {
    renderAt('/register');
    expect(screen.getByText('RegisterPage')).toBeTruthy();
  });
});

describe('rutas protegidas — sin sesión', () => {
  it('/student redirige a /login', () => {
    renderAt('/student');
    expect(screen.getByText('LoginPage')).toBeTruthy();
  });

  it('/ngo redirige a /login', () => {
    renderAt('/ngo');
    expect(screen.getByText('LoginPage')).toBeTruthy();
  });

  it('/admin redirige a /login', () => {
    renderAt('/admin');
    expect(screen.getByText('LoginPage')).toBeTruthy();
  });
});

describe('rutas protegidas — con sesión y rol correcto', () => {
  it('rol student accede a /student', () => {
    renderAt('/student', { role: 'student' });
    expect(screen.getByText('StudentLayout')).toBeTruthy();
  });

  it('rol ngo accede a /ngo', () => {
    renderAt('/ngo', { role: 'ngo' });
    expect(screen.getByText('NgoLayout')).toBeTruthy();
  });

  it('rol admin accede a /admin', () => {
    renderAt('/admin', { role: 'admin' });
    expect(screen.getByText('AdminLayout')).toBeTruthy();
  });
});

describe('RoleRoute — rol incorrecto redirige al dashboard propio', () => {
  it('rol student en /ngo ve StudentLayout', () => {
    renderAt('/ngo', { role: 'student' });
    expect(screen.getByText('StudentLayout')).toBeTruthy();
  });

  it('rol ngo en /admin ve NgoLayout', () => {
    renderAt('/admin', { role: 'ngo' });
    expect(screen.getByText('NgoLayout')).toBeTruthy();
  });

  it('rol admin en /student ve AdminLayout', () => {
    renderAt('/student', { role: 'admin' });
    expect(screen.getByText('AdminLayout')).toBeTruthy();
  });
});

describe('rutas NGO — proyecto detalle', () => {
  it('rol ngo accede a /ngo/projects/p1 y ve NgoProjectDetailPage', () => {
    renderAt('/ngo/projects/p1', { role: 'ngo' });
    expect(screen.getByText('NgoProjectDetailPage')).toBeTruthy();
  });

  it('rol student en /ngo/projects/p1 es redirigido a su dashboard', () => {
    renderAt('/ngo/projects/p1', { role: 'student' });
    expect(screen.getByText('StudentLayout')).toBeTruthy();
  });

  it('rol admin en /ngo/projects/p1 es redirigido a su dashboard', () => {
    renderAt('/ngo/projects/p1', { role: 'admin' });
    expect(screen.getByText('AdminLayout')).toBeTruthy();
  });
});
