# SkillMatch — Frontend

React 19 + Vite (JavaScript). Hexagonal architecture: `src/domain/` (pure, no React/fetch) → `src/infrastructure/` (API, storage) → `src/application/` (use cases) → `src/ui/` (pages, hooks, layouts).

## Workflow rules (CRITICAL)

### Ramas y commits

- **SIEMPRE** crear rama antes de tocar código: `fix/`, `feature/`, `docs/`, `chore/`
- **NUNCA** modificar código directamente en `main`
- Commits cortos en español: `fix:`, `feat:`, `docs:`, `chore:`, `test:`
- Ejemplo: `git checkout -b fix/projects-list-skills-display`

### Después de merging una PR

1. Volver a `main` y hacer pull
2. Borrar la rama local: `git branch -d fix/nombre`
3. Confirmar que el repo está limpio antes de empezar algo nuevo

### Antes de cualquier cambio

1. Crear la rama desde `main` actualizado
2. Trabajar el fix/feature con tests
3. Subir con PR
4. **Preguntar al usuario** antes de volver a tocar algo si hay decisiones pendientes

### Antes de cerrar sesión

- Hacer `mem_session_summary` con lo completado y lo que queda
- Guardar decisiones de arquitectura en Engram

## Dev commands

```bash
npm run dev      # Vite dev server
npm run build    # Production build → dist/
npm run lint     # ESLint
npm test         # vitest run (single pass, not watch)
npm run test:watch
```

## Testing

- **Vitest** with jsdom, single fork
- Setup file: `src/test-setup.js` (imports `@testing-library/jest-dom`)
- Test files co-located with source: `*.test.jsx` next to `*.jsx`
- Strict TDD: write test before implementation

## Lint rule (non-obvious)

`no-unused-vars` is configured with `varsIgnorePattern: '^[A-Z_]'` — variables starting with uppercase or underscore are exempt. This is intentional to allow constants and placeholder names.

## API client

- Axios instance with `baseURL` from `VITE_API_URL` env (default: `http://localhost:3151`)
- `withCredentials: true` on every request (cookie-based JWT)
- 401 interceptor redirects to `/login` except on `/login`, `/forgot-password`, `/reset-password`

## Routing & roles

- React Router v6 with `ProtectedRoute` + `RoleRoute` in `src/ui/router/AppRouter.jsx`
- Roles: `student`, `ngo`, `admin` — each has its own layout under `src/ui/layouts/`
- The `@` alias resolves to `src/`

## API spec

- Contrato completo en `docs/skillmatch-api.json` (OpenAPI 3.0)
- Verificar siempre contra este spec antes de asumir campos en la respuesta

## Env vars

- `VITE_API_URL` — required for local dev (default: `http://localhost:3151`)