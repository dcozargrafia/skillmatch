/**
 * Router principal de la aplicación.
 * Define rutas públicas, privadas y protección por rol.
 * Las páginas se cargan con lazy loading para optimizar el bundle inicial.
 */

import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from '../hooks/useAuthStore';

// Páginas con lazy loading
const LoginPage = lazy(() => import('../pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('../pages/auth/RegisterPage'));
const StudentLayout = lazy(() => import('../layouts/StudentLayout'));
const NgoLayout = lazy(() => import('../layouts/NgoLayout'));
const AdminLayout = lazy(() => import('../layouts/AdminLayout'));
const StudentProfilePage = lazy(() => import('../pages/student/StudentProfilePage'));
const ProjectsListPage = lazy(() => import('../pages/student/ProjectsListPage'));
const ProjectDetailPage = lazy(() => import('../pages/student/ProjectDetailPage'));
const NgoProfilePage = lazy(() => import('../pages/ngo/NgoProfilePage'));
const NgoProjectsPage = lazy(() => import('../pages/ngo/NgoProjectsPage'));
const NgoProjectFormPage = lazy(() => import('../pages/ngo/NgoProjectFormPage'));
const NgoProjectCandidatesPage = lazy(() => import('../pages/ngo/NgoProjectCandidatesPage'));
const NgoProjectAssignmentPage = lazy(() => import('../pages/ngo/NgoProjectAssignmentPage'));
const NgoProjectDetailPage = lazy(() => import('../pages/ngo/NgoProjectDetailPage'));
const StudentApplicationsPage = lazy(() => import('../pages/student/StudentApplicationsPage'));
const StudentAssignmentPage = lazy(() => import('../pages/student/StudentAssignmentPage'));
const StudentHistoryPage = lazy(() => import('../pages/student/StudentHistoryPage'));
const AdminDashboardPage = lazy(() => import('../pages/admin/AdminDashboardPage'));
const ForgotPasswordPage = lazy(() => import('../pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('../pages/auth/ResetPasswordPage'));

/** Dashboard de inicio por rol */
export const ROLE_HOME = {
  student: '/student',
  ngo: '/ngo',
  admin: '/admin',
};

/**
 * Protege rutas que requieren sesión activa.
 * Redirige a /login si no hay usuario autenticado.
 *
 * @param {object} props
 * @param {React.ReactNode} props.children
 */
export function ProtectedRoute({ children }) {
  const user = useAuthStore((s) => s.user);
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

/**
 * Protege rutas según el rol del usuario.
 * Si el rol no coincide, redirige al dashboard del rol correspondiente.
 *
 * @param {object} props
 * @param {React.ReactNode} props.children
 * @param {string} props.role - Rol requerido para acceder
 */
export function RoleRoute({ children, role }) {
  const user = useAuthStore((s) => s.user);
  if (user?.role !== role) {
    return <Navigate to={ROLE_HOME[user?.role] ?? '/login'} replace />;
  }
  return children;
}

/**
 * Árbol de rutas de la aplicación sin provider de router.
 * Acepta componentes de página como props para facilitar el testing.
 *
 * @param {object} [pages] - Overrides de componentes de página (para tests)
 */
export function AppRoutes({
  Login = LoginPage,
  Register = RegisterPage,
  Student = StudentLayout,
  Ngo = NgoLayout,
  Admin = AdminLayout,
  StudentProfile = StudentProfilePage,
  ProjectsList = ProjectsListPage,
  ProjectDetail = ProjectDetailPage,
  NgoProfile = NgoProfilePage,
  NgoProjects = NgoProjectsPage,
  NgoProjectForm = NgoProjectFormPage,
  NgoProjectCandidates = NgoProjectCandidatesPage,
  NgoProjectAssignment = NgoProjectAssignmentPage,
  NgoProjectDetail = NgoProjectDetailPage,
  StudentApplications = StudentApplicationsPage,
  StudentAssignment = StudentAssignmentPage,
  StudentHistory = StudentHistoryPage,
  AdminDashboard = AdminDashboardPage,
  ForgotPassword = ForgotPasswordPage,
  ResetPassword = ResetPasswordPage,
} = {}) {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Rutas privadas — estudiante */}
      <Route
        path="/student"
        element={
          <ProtectedRoute>
            <RoleRoute role="student">
              <Student />
            </RoleRoute>
          </ProtectedRoute>
        }
      >
        <Route path="projects" element={<ProjectsList />} />
        <Route path="projects/:id" element={<ProjectDetail />} />
        <Route path="applications" element={<StudentApplications />} />
        <Route path="assignments/:id" element={<StudentAssignment />} />
        <Route path="history" element={<StudentHistory />} />
        <Route path="profile" element={<StudentProfile />} />
      </Route>

      {/* Rutas privadas — ONG */}
      <Route
        path="/ngo"
        element={
          <ProtectedRoute>
            <RoleRoute role="ngo">
              <Ngo />
            </RoleRoute>
          </ProtectedRoute>
        }
      >
        <Route path="projects" element={<NgoProjects />} />
        <Route path="projects/new" element={<NgoProjectForm />} />
        <Route path="projects/:id" element={<NgoProjectDetail />} />
        <Route path="projects/:id/edit" element={<NgoProjectForm />} />
        <Route path="projects/:id/candidates" element={<NgoProjectCandidates />} />
        <Route path="projects/:id/assignment" element={<NgoProjectAssignment />} />
        <Route path="profile" element={<NgoProfile />} />
      </Route>

      {/* Rutas privadas — admin */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <RoleRoute role="admin">
              <Admin />
            </RoleRoute>
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="dashboard" element={<AdminDashboard />} />
      </Route>

      {/* Raíz → login */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* 404 → login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

/**
 * Router principal montado con BrowserRouter y Suspense para lazy loading.
 */
function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={null}>
        <AppRoutes />
      </Suspense>
    </BrowserRouter>
  );
}

export default AppRouter;
