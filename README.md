# SkillMatch — Frontend

Plataforma de conexión entre estudiantes y ONGs para prácticas y proyectos de voluntariado.

## Stack

- **React + Vite** (JavaScript / JSX)
- **React Router DOM v7** — navegación y protección de rutas por rol
- **Zustand** — gestión de estado de autenticación
- **Axios** — comunicación con la API (cookie HttpOnly para JWT)
- **CSS puro** — sin frameworks de UI
- **Vitest + Testing Library** — TDD estricto

## Estado del proyecto

- Frontend desplegado en un VPS mediante **Coolify**
- Integrado con el repo de **GitHub**
- Convive con la app hermana `skillmatch-api` y la base de datos en el mismo entorno desplegado

## Flujo Git

1. Actualizar `develop`
2. Crear rama corta desde `develop`
3. Abrir PR hacia `develop`
4. Validar tests antes de push/merge
5. El merge `develop -> main` se hace manualmente desde GitHub para producción

## Arquitectura

Hexagonal pragmática: dominio puro en el centro, infraestructura en los bordes, UI como capa de presentación.

```
skillmatch/
├── vite.config.js                 # Alias @ -> src y config de Vitest/jsdom
├── src/
│   ├── main.jsx                   # Arranque real de la app
│   ├── App.jsx                    # Composición raíz
│   ├── domain/                    # Entidades y validaciones puras
│   ├── application/               # Casos de uso por módulo
│   ├── infrastructure/            # API clients y storage
│   ├── ui/                        # Router, layouts, hooks, páginas y componentes
│   ├── styles/                    # Estilos compartidos
│   ├── assets/                    # Recursos estáticos
│   └── test-setup.js              # Setup global de Testing Library
└── docs/
    └── skillmatch-api.json        # Fuente de verdad del contrato API
```

### Capas

| Capa | Responsabilidad | Ejemplos |
|------|------------------|----------|
| `domain/` | Modelo y reglas puras, sin React ni fetch | `Project.js`, `Skill.js`, `User.js` |
| `application/` | Casos de uso que orquestan dominio + infraestructura | `loginUseCase.js`, `createProjectUseCase.js` |
| `infrastructure/` | Acceso a API y persistencia técnica | `api/client.js`, `storage/session.js` |
| `ui/` | Presentación, routing, layouts, hooks y store de auth | `router/AppRouter.jsx`, `hooks/useAuthStore.jsx` |

### Reglas importantes

- `domain/` no depende de React ni de `infrastructure/`
- `application/` coordina casos de uso; no renderiza UI
- `ui/` consume hooks y use cases; no debería importar APIs directamente
- El alias `@` apunta a `src/`

## Rutas

| Ruta | Acceso | Página |
|------|--------|--------|
| `/login` | público | LoginPage |
| `/register` | público | RegisterPage |
| `/forgot-password` | público | ForgotPasswordPage |
| `/reset-password?token=…` | público | ResetPasswordPage |
| `/student/projects` | student | ProjectsListPage |
| `/student/projects/:id` | student | ProjectDetailPage |
| `/student/applications` | student | StudentApplicationsPage |
| `/student/assignments/:id` | student | StudentAssignmentPage |
| `/student/history` | student | StudentHistoryPage |
| `/student/profile` | student | StudentProfilePage |
| `/ngo/projects` | ngo | NgoProjectsPage |
| `/ngo/projects/new` | ngo | NgoProjectFormPage |
| `/ngo/projects/:id` | ngo | NgoProjectDetailPage |
| `/ngo/projects/:id/edit` | ngo | NgoProjectFormPage |
| `/ngo/projects/:id/candidates` | ngo | NgoProjectCandidatesPage |
| `/ngo/projects/:id/assignment` | ngo | NgoProjectAssignmentPage |
| `/ngo/profile` | ngo | NgoProfilePage |
| `/admin` | admin | AdminDashboardPage |

## Desarrollo

```bash
npm install
npm run dev
```

## Tests

```bash
npm test
```

Proyecto bajo TDD estricto — los tests se escriben antes de la implementación.
