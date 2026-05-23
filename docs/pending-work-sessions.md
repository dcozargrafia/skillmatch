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
| ONG entregables — página huérfana eliminada | NgoDeliverablesPage era duplicado sin sidebar link, sin guards de dominio, con terminología inconsistente. Eliminada junto con su ruta. Gestión de entregables ya funciona en NgoProjectDetailPage. | #69 |
| ONG entregables — bug de assignment null | `getProjectDetailUseCase` trataba la respuesta de `/assignments?project_id=` como array (hacía `.length > 0 ? [0] : null`), pero la API devuelve un objeto. El assignment siempre era null, así que la ONG nunca veía entregables. Fix defensivo que maneja objeto y array. | #70 |
| Student entregables — acciones conectadas | `StudentAssignmentPage` no pasaba `onStart` ni `onSubmit` a `DeliverableCard`, y además enviaba la lista de deliverables como tercer parámetro al submit (que en realidad era `comment`). Se restauró el flujo start → submit → retry y se evitó la contaminación del campo `comment`. | #71 |

---

## Pendientes actuales

### ✅ ONG — No puede añadir/gestionar entregables

- **Resuelto**: La gestión de entregables ya funciona en `NgoProjectDetailPage` con guards de dominio correctos (readOnly, hasActiveDeliverable, isTerminal). La página huérfana `NgoDeliverablesPage` era un duplicado inferior sin link en el sidebar — eliminada en PR #69.
- **Violación hexagonal**: Resuelta — al eliminar `NgoDeliverablesPage`, ya no queda ningún import de `infrastructure/` en la capa UI que viole la regla de dependencia.
- **Bug crítico resuelto**: `getProjectDetailUseCase` trataba la respuesta del API de assignments como array, pero el endpoint devuelve un objeto. Como los objetos no tienen `.length`, `assignment` siempre era `null` y la sección de entregables nunca se mostraba. Corregido en PR #70.

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

1. **ONG gestión activa de proyectos** — SDD para UX.
2. **Reseñas** — SDD para flujo completo.
3. **Pulido transversal** — al final, sin SDD probablemente.

---

## Notas para la defensa del PFG

- Arquitectura hexagonal implementada en las 3 áreas (NGO, Student, Admin/Auth) con 3 PRs encadenados cada una.
- 704 tests, 0 imports de `infrastructure/` en la capa UI, regla de dependencia verificable. (Las excepciones fueron eliminadas: `NgoDeliverablesPage` en PR #69.)
- Bug assignment: `GET /assignments?project_id=` devuelve un objeto, no un array. `getProjectDetailUseCase` hacía `.length > 0 ? [0] : null` → siempre null → ONG nunca veía entregables. PR #70.
- Flujo compartido de entregables validado: ONG crea → Student inicia (`in_progress`) → Student envía (`in_review`) → ONG aprueba/rechaza (`approved`/`rejected`) → Student puede reintentar si queda rechazado. La rotura estaba en el cableado de `StudentAssignmentPage`, no en el backend. PR #71.
- Los 8 archivos de domain tienen JSDoc documentando propósito y restricción de pureza.
- `Review.js` tiene una dependencia implícita en la forma del error de Axios (`error.response.status`).
- `Project.js` es el archivo más crítico del domain — contiene la máquina de estados completa del ciclo de vida + validación de proyecto con skills.
- Bug de Skills: la API devuelve niveles y `availability` en inglés; la UI debe normalizar inbound y usar valores internos en inglés con labels en español.
- SkillSelector es componente controlado reutilizable, agrupa por categoría (Desarrollo, Diseño, CMS, Marketing), mapea `id` → `skill_id` al enviar a la API.
