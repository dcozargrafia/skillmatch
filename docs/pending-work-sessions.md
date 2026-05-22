# Pending work sessions

Este documento agrupa los pendientes actuales en sesiones semi-independientes para avanzar mañana con foco y sin mezclar demasiadas decisiones en un mismo bloque.

## Orden recomendado

1. **Arquitectura y limpieza del área NGO**
2. **Modelo de vistas y navegación principal**
3. **Flujo Student: UX y estados**
4. **Flujo NGO: UX, clasificación y creación de proyectos**
5. **Reseñas y cierre completo del ciclo**
6. **Pulido transversal de UI vacía, navegación y consistencia**

---

## Session 1 — Arquitectura y limpieza NGO

**Objetivo**: bajar deuda técnica antes de seguir agregando features.

### Incluye
- Revisar `NgoProjectDetailPage.jsx` para dividirlo en componentes más chicos.
- Decidir si conviene extraer componentes de deliverables, assignment summary y header actions.
- Revisar `NgoDeliverablesPage.jsx` y decidir:
  - eliminarlo,
  - reciclarlo,
  - o convertirlo en componente reutilizable.
- Detectar archivos huérfanos, desactualizados o duplicados.
- Revisar documentación y estructura para evitar archivos kilométricos.

### Por qué va primero
- Reduce riesgo antes de seguir tocando NGO y Student.
- Evita que nuevas mejoras caigan sobre archivos ya demasiado grandes.

### Entregable esperado
- propuesta clara de refactor + primer recorte estructural
- lista de archivos para borrar/mover/dividir

---

## Session 2 — Modelo de vistas y navegación principal

**Objetivo**: redefinir cómo se organizan las pantallas principales de Student y NGO.

### Incluye
- Rediseñar clasificación de vistas en Student.
- Rediseñar clasificación de vistas en NGO.
- Proponer naming y estructura de navegación consistentes.
- Revisar botones de retorno, breadcrumbs o navegación contextual.

### Propuesta inicial

#### Student
- Perfil
- Proyectos disponibles
- Proyectos en curso
- Proyectos finalizados

#### NGO
- Perfil
- Proyectos publicados
- Proyectos activos
- Proyectos terminados

### Por qué va acá
- Estas decisiones impactan varias pantallas.
- Conviene definir la estructura antes de pulir UX detallada.

### Entregable esperado
- mapa de navegación
- criterio de clasificación por estados
- backlog concreto de cambios de rutas/vistas

---

## Session 3 — Student: UX de proyectos y entregables

**Objetivo**: hacer coherente y clara la experiencia del student dentro del trabajo activo.

### Incluye
- Mejorar UI/UX en proyectos/entregables de Student.
- Revisar actualización de estados visibles.
- Revisar confirmación de acciones.
- Detectar botones que sobran/faltan.
- Revisar mensajes de error y estados vacíos dentro del flujo Student.

### Dependencias
- Idealmente después de Session 2 para que la navegación ya esté definida.

### Entregable esperado
- flujo Student consistente end-to-end
- criterios de UX para acciones críticas

---

## Session 4 — NGO: UX de gestión activa y skills requeridas

**Objetivo**: completar el flujo operativo de ONG una vez saneada la base.

### Incluye
- Añadir skills requeridas al crear proyecto.
- Mejorar UX de gestión activa de proyectos ONG.
- Refinar vacíos, acciones y feedback visual en pantallas NGO.
- Revisar clasificación entre publicados / activos / terminados.

### Por qué no va antes
- Mezcla feature nueva con mejoras de UX y clasificación.
- Conviene apoyarse en las decisiones de Session 1 y 2.

### Entregable esperado
- creación de proyecto más completa
- vistas ONG más coherentes con el ciclo de vida real

---

## Session 5 — Reseñas (ONG + Student)

**Objetivo**: cerrar la parte social/valorativa del producto.

### Incluye
- Implementar reseñas de Student.
- Implementar reseñas de ONG.
- Validar cuándo se habilitan.
- Revisar dependencias con proyectos completados/certificados.

### Por qué en una sesión separada
- Es un flujo funcional propio.
- Toca reglas, formularios, validaciones y quizás listados/perfiles.

### Entregable esperado
- flujo de reseñas completo y verificable

---

## Session 6 — Pulido transversal

**Objetivo**: atacar mejoras compartidas sin mezclar lógica core.

### Incluye
- Mejorar pantallas vacías de ONG y Student.
- Mejorar navegación contextual (`volver`, regreso a pantalla anterior, etc.).
- Revisión general de consistencia visual y mensajes.

### Cuándo conviene hacerla
- Después de que la estructura y los flujos principales ya estén estabilizados.

### Entregable esperado
- experiencia más limpia y menos fricción visual

---

## Notas de priorización

| Prioridad | Tema | Motivo |
|---|---|---|
| Alta | Arquitectura y limpieza NGO | ahora ya hay archivos grandes y riesgo de deuda técnica |
| Alta | Modelo de vistas | afecta la organización de casi todo lo demás |
| Alta | Student UX activa | flujo sensible del producto |
| Media | NGO UX + skills requeridas | importante, pero mejor sobre base más limpia |
| Media | Reseñas | feature completa, relativamente aislable |
| Media | Pulido transversal | conviene al final para no retrabajar |

## Quick path para mañana

1. Empezar por **Session 1**.
2. Tomar una decisión explícita sobre `NgoDeliverablesPage.jsx`.
3. Definir la clasificación final de vistas de Student y NGO.
4. Recién después entrar a mejoras de UX específicas.
