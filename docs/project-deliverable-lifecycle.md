# Project & Deliverable Lifecycle (NGO Detail Flow)

This document describes how project and deliverable states work in SkillMatch, which transitions are valid, who can trigger them, and how the NGO project detail page exposes these actions.

## Project states

- `pending`
- `assigned`
- `in_progress`
- `in_review`
- `rejected`
- `completed`
- `cancelled`

Terminal project states:

- `rejected`
- `completed`
- `cancelled`

## Deliverable states

- `pending`
- `in_progress`
- `in_review`
- `approved`
- `rejected`

Active deliverable states (used by the single-active-deliverable rule):

- `pending`
- `in_progress`
- `in_review`

## Valid project transitions (frontend domain map)

The NGO UI computes available transitions from `src/domain/project/Project.js`:

| Current | Valid next statuses |
|---|---|
| `pending` | `assigned`, `cancelled` |
| `assigned` | `in_progress`, `cancelled` |
| `in_progress` | `in_review`, `cancelled` |
| `in_review` | `in_progress`, `rejected`, `completed`, `cancelled` |
| `rejected` | `in_progress`, `in_review`, `cancelled` |
| `completed` | `[]` |
| `cancelled` | `[]` |

## Deliverable lifecycle transitions

Deliverable transitions are backend-driven. At a high level:

- A deliverable is created as `pending`.
- Student execution/review flow moves it through active states (`in_progress`, `in_review`).
- NGO review resolves it to `approved` or `rejected`.

The UI always re-fetches project state after deliverable actions so frontend state stays aligned with backend truth.

## Role permissions (NGO vs student)

### NGO

- Can create deliverables from the NGO project detail page when constraints allow it.
- Can review deliverables (approve/reject) through existing NGO deliverable review actions.
- Can cancel a non-terminal project.
- Can mark a project as `completed` only when the project is in `in_review`, an assignment exists, there is at least one deliverable, and all deliverables are `approved`.

### Student

- Cannot use NGO-only creation/review/status controls.
- Progresses assigned work through the student deliverable workflow.

## Single active deliverable rule

Only one active deliverable is allowed per assignment at a time.

Implication on NGO detail page:

- If any deliverable is active (`pending`, `in_progress`, `in_review`), the create-deliverable form is hidden.
- If no active deliverable exists and the project is not terminal, the create-deliverable form can be shown.

## Backend auto-transition behavior

Backend is authoritative for project status transitions triggered by deliverable events. The frontend must re-sync after mutations because backend may auto-transition status (for example, based on deliverable lifecycle events).

UI behavior after each NGO mutation:

- `createDeliverable(...)` -> re-fetch project.
- Deliverable review action -> re-fetch project.
- `updateProjectStatus(...)` / `cancelProject(...)` -> re-fetch project.

## NGO detail page actions (what the page exposes)

The NGO detail page now centralizes creation, review context, and state actions:

1. **Create deliverable**
   - Visible only when assignment exists, project is non-terminal, and there is no active deliverable.
   - Uses `createDeliverable({ assignment_id, title, description })`.

2. **Project status actions**
   - The page does NOT expose generic transition buttons like `Iniciar proyecto` or `Enviar a revisión`.
   - The page exposes only explicit NGO-safe actions: `Cancelar proyecto` and `Marcar como completado` when the completion guard is satisfied.
   - Terminal statuses show no project action buttons.

3. **Destructive confirmation**
   - Cancel project is guarded by confirmation before execution.

4. **Error + state recovery**
   - Invalid transition / permission errors are surfaced to the user.
   - The page re-fetches server state to avoid stale transitions.
