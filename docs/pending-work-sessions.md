# Pendientes de SkillMatch

Última actualización: 2026-05-23

## Lo que ya está hecho ✅

| Sesión original | Qué se hizo | PRs |
|---|---|---|
| Arquitectura y limpieza NGO | Refactor hexagonal completo (domain → app → hooks → pages) | #46, #49, #50 |
| Modelo de vistas y navegación | Rediseño del flujo de Student con navegación por estados | #42 |
| Student UX | Refactor hexagonal completo + DeliverableCard compartido | #51, #52, #53 |
| Admin/Auth hexagonal | Refactor hexagonal completo (no estaba en la lista original) | #54, #57, #58 |
| Auditoría de domain | Comentarios JSDoc + eliminar brecha hexagonal + dead code | #59 |
| Entregables UX | Labels en español, mensajes contextuales, orden, fichas con datos, Ver detalles + refactor hexagonal NgoDeliverables | #60, #61, #62 |
| Bug de Skills en Student | 4 bugs interrelacionados: niveles inglés/español, UI muerta, stale closure, availability vs disponibilidad | #63 → #64 ( merged) |

---

## Pendientes actuales

### 🔴 Bug — Crear proyecto da "Name is required"

**Problema**: Al crear un proyecto desde ONG, el formulario envía `{ title, description, objectives, ... }` pero `createProjectUseCase` llama a `validateNgoProfile()` que valida campos de perfil ONG (`name`, `email`, `organizationName`, `area`). Como el data del proyecto no tiene `name`, lanza "Name is required".

**Causa raíz**: `src/application/project/createProjectUseCase.js` línea 15 usa `validateNgoProfile` en vez de una validación de proyecto. No existe aún un `validateProject` en `src/domain/project/Project.js`.

**Archivos clave**:
- `src/application/project/createProjectUseCase.js` — usa `validateNgoProfile` (incorrecto)
- `src/domain/project/Project.js` — no tiene `validateProject`
- `src/ui/pages/ngo/NgoProjectFormPage.jsx` — solo valida `title` en UI, no otros campos requeridos
- `src/ui/hooks/useNgoProjectForm.jsx` — pasa data directo al use case

**Prioridad**: Alta — bloquea crear proyectos completamente.

---

### 🟡 NGO — Skills requeridas al crear proyecto

- **Añadir skills requeridas al crear proyecto**: la ONG debería poder seleccionar qué skills necesita para el proyecto al crearlo. Actualmente `NgoProjectFormPage` no tiene ningún selector de skills, aunque el hook ya expone `skills`.

**Archivos clave**:
- `src/ui/pages/ngo/NgoProjectFormPage.jsx` — falta UI para seleccionar skills
- `src/ui/hooks/useNgoProjectForm.jsx` — ya expone `skills` pero no se usan en el form
- `src/infrastructure/api/projectApi.js` — `createProject()` necesita recibir `required_skills`
- API spec (`docs/skillmatch-api.json`) — verificar qué formato espera el endpoint

**Prioridad**: Media — no bloquea pero sin esto los proyectos no tienen skills asociadas.

---

### 🟡 NGO — UX de gestión activa de proyectos

- **Mejorar UX de gestión**: vacíos, acciones, feedback visual.
- **Clasificación publicados / activos / terminados**: revisar que la navegación por estados sea consistente.

**Prioridad**: Media — importante, pero conviene hacer sobre la base hexagonal ya estable.

---

### 🟡 Reseñas (ONG + Student)

- Implementar reseñas de Student y ONG.
- Validar cuándo se habilitan (proyecto completado / certificado).
- Reglas de negocio: una reseña por usuario por proyecto.
- Dependencias con `Review.js` (domain) y `canSubmitReview`.

**Prioridad**: Media — feature nueva pero aisleable.

---

### 🟢 Pulido transversal

- Mensajes de error de validación en español (actualmente `Ngo.js` tiene mensajes en inglés: "Name is required", etc.).
- Mejorar pantallas vacías de ONG y Student.
- Mejorar navegación contextual (volver, breadcrumbs).
- Revisión general de consistencia visual y mensajes.

**Prioridad**: Baja — conviene al final para no retrabajar.

---

## Orden recomendado

1. **Bug de crear proyecto** — fix rápido, no necesita SDD. Crear `validateProject` en domain, cablear en use case, tests.
2. **Skills requeridas al crear proyecto** — SDD para feature nueva.
3. **Reseñas** — SDD para flujo completo.
4. **Pulido transversal** — al final, sin SDD probablemente.

---

## Notas para la defensa del PFG

- Arquitectura hexagonal implementada en las 3 áreas (NGO, Student, Admin/Auth) con 3 PRs encadenados cada una.
- 679 tests, 0 imports de `infrastructure/` en la capa UI, regla de dependencia verificable.
- Los 8 archivos de domain tienen JSDoc documentando propósito y restricción de pureza.
- `Review.js` tiene una dependencia implícita en la forma del error de Axios (`error.response.status`).
- `Project.js` es el archivo más crítico del domain — contiene la máquina de estados completa del ciclo de vida.
- Bug de Skills: la API devuelve niveles y `availability` en inglés; la UI debe normalizar inbound y usar valores internos en inglés con labels en español.