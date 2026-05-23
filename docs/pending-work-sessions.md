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

---

## Pendientes actuales

### 🔴 Bug — Skills en Student no se agregan bien

**Problema**: Al agregar skills en el perfil de Student, algo falla. Investigar y corregir.

**Prioridad**: Alta — es un bug visible por el usuario.

---

### 🟡 Entregables — UX y datos

Mejoras específicas en cómo se muestran y ordenan los entregables, tanto en vista Student como ONG.

- **Labels de entregables en español**: los estados aparecen en inglés (pending, in_progress, etc.). Requieren traducción usando `STATUS_LABELS` del domain o equivalente.
- **Orden de entregables en las listas**: verificar que entregables aparezcan en orden lógico (cronológico o por estado) en Student y ONG.
- **Datos en fichas de entregables**: revisar qué datos se muestran (fecha creación, estado) y si falta información útil.
- **Texto contextual del estado del proyecto**: cuando un proyecto está `in_review`, explicar qué está pasando. Ejemplos:
  - `in_review` sin entregables aprobados → "Esperando que la ONG apruebe o rechace el último entregable."
  - `in_review` con todos los entregables aprobados → "Esperando que la ONG marque el proyecto como completado o cree otro entregable."
  - Revisar `Project.js` (máquina de estados) para mapear cada estado a un mensaje claro.
- **Botón "Ver detalles" en project/deliverable**: en la vista Student, verificar que el botón lleve al lugar correcto y sea claro.

**Prioridad**: Media-alta — mejora UX directamente en el flujo más importante del producto.

---

### 🟡 NGO — UX de gestión y skills requeridas

- **Añadir skills requeridas al crear proyecto**: la ONG debería poder seleccionar qué skills necesita para el proyecto al crearlo.
- **Mejorar UX de gestión activa de proyectos ONG**: vacíos, acciones, feedback visual.
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

- Mejorar pantallas vacías de ONG y Student.
- Mejorar navegación contextual (volver, breadcrumbs).
- Revisión general de consistencia visual y mensajes.

**Prioridad**: Baja — conviene al final para no retrabajar.

---

## Orden recomendado

1. **Bug de Skills** — fix rápido, no necesita SDD
2. **Entregables UX** — SDD con foco en domain + hooks + pages (texts de estado ya tienen base en `Project.js`)
3. **NGO skills + gestión** — SDD para la feature de skills al crear proyecto
4. **Reseñas** — SDD para flujo completo
5. **Pulido transversal** — al final, sin SDD probablemente

---

## Notas para la defensa del PFG

- Arquitectura hexagonal implementada en las 3 áreas (NGO, Student, Admin/Auth) con 3 PRs encadenados cada una.
- 633 tests, 0 imports de `infrastructure/` en la capa UI, regla de dependencia verificable.
- Los 8 archivos de domain tienen JSDoc documentando propósito y restricción de pureza.
- `Review.js` tiene una dependencia implícita en la forma del error de Axios (`error.response.status`).
- `Project.js` es el archivo más crítico del domain — contiene la máquina de estados completa del ciclo de vida.