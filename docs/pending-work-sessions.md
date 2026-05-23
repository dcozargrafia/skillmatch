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
| Bug de Skills en Student | 4 bugs interrelacionados: niveles inglés/español, UI muerta, stale closure, availability vs disponibilidad | #63 → #64 |
| Bug de crear proyecto — "Name is required" | `createProjectUseCase` usaba `validateNgoProfile` en vez de validador de proyecto. Creado `validateProject` en `Project.js` | #66 |
| Skills requeridas al crear proyecto ONG | SkillSelector con checkbox + level select agrupado por categoría, validateProject con skills, updateProjectUseCase con 5to param, integración en NgoProjectFormPage | #68 |

---

## Pendientes actuales

### 🔴 ONG — No puede añadir/gestionar entregables

- **Problema**: Desde la vista de ONG no hay manera de añadir o gestionar entregables de un proyecto. No está claro si falta ruta/sidebar link, si `NgoDeliverablesPage.jsx` es accesible, o si hay que integrar entregables en `NgoProjectDetailPage`.
- **Violación hexagonal**: `NgoDeliverablesPage.jsx` importa directamente de `infrastructure/api/deliverableApi.js` en vez de usar hook + use case.
- **Necesita SDD explore primero** para investigar el estado actual de rutas, sidebar y accesibilidad.

**Archivos clave**:
- `src/ui/pages/ngo/NgoDeliverablesPage.jsx` — existe pero viola hexagonal
- `src/ui/pages/ngo/NgoProjectDetailPage.jsx` — ya tiene crear/revisar entregables
- `src/ui/layouts/NgoLayout.jsx` — links del sidebar
- `src/ui/router/AppRouter.jsx` — rutas ONG
- `src/application/deliverable/` — use cases existentes
- `src/infrastructure/api/deliverableApi.js` — API de entregables

**Prioridad**: Alta — la ONG no puede gestionar entregables.

---

### 🟡 ONG — UX de gestión activa de proyectos

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

- Cobertura de error-paths menor (sugerida por verify en entregables-ux, no bloqueante).
- ESLint globals de Vitest — config pendiente de otra sesión.
- Mejorar pantallas vacías de ONG y Student.
- Mejorar navegación contextual (volver, breadcrumbs).
- Revisión general de consistencia visual y mensajes.

**Prioridad**: Baja — conviene al final para no retrabajar.

---

## Orden recomendado

1. **ONG entregables** — investigar accesibilidad + refactor hexagonal. SDD explore primero.
2. **ONG gestión activa de proyectos** — SDD para UX.
3. **Reseñas** — SDD para flujo completo.
4. **Pulido transversal** — al final, sin SDD probablemente.

---

## Notas para la defensa del PFG

- Arquitectura hexagonal implementada en las 3 áreas (NGO, Student, Admin/Auth) con 3 PRs encadenados cada una.
- 711 tests, 0 imports de `infrastructure/` en la capa UI (salvo `NgoDeliverablesPage.jsx` — pendiente refactor), regla de dependencia verificable.
- Los 8 archivos de domain tienen JSDoc documentando propósito y restricción de pureza.
- `Review.js` tiene una dependencia implícita en la forma del error de Axios (`error.response.status`).
- `Project.js` es el archivo más crítico del domain — contiene la máquina de estados completa del ciclo de vida + validación de proyecto con skills.
- Bug de Skills: la API devuelve niveles y `availability` en inglés; la UI debe normalizar inbound y usar valores internos en inglés con labels en español.
- SkillSelector es componente controlado reutilizable, agrupa por categoría (Desarrollo, Diseño, CMS, Marketing), mapea `id` → `skill_id` al enviar a la API.