# Prototype Instructions

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

## Durable prototype decisions

- Do not show an “Añadir tarea” action in the sidebar; task creation belongs in the main views.
- The desktop sidebar must support explicit collapse and expand controls.
- The board name is user-customizable inline by double-clicking its title and pressing Enter to save.
- Tasks include a persistent effort level from 1 to 5, edited with a slider and surfaced in Reports for future filtering and sorting.
- Every Kanban column name is editable inline using double-click and Enter, matching the board-title interaction.
- The `TO-DO`, `DOING`, and `DONE` columns are permanent and have no deletion menu. Custom columns can be reordered between them and deleted; deleting one returns its tasks to `TO-DO` instead of deleting them.
- Use the Color Hunt palette `#FBEFEF`, `#FFE2E2`, `#F5CBCB`, and `#C5B3D3` as the prototype's core visual palette, with a deep plum neutral for accessible text contrast.
- Kanban and the weekly Timeline are two views of the same task data. Completed tasks stay in `DONE` on Kanban and remain visible but struck through and muted on Timeline.
- Future cloud access must support an `owner` with full editing rights and external supervisors with report-focused, read-only access to metrics and task details.
- Supabase is the planned source of truth. Notion may receive scheduled, one-way exports for company visibility and backup, keyed by stable Supabase task IDs to avoid duplicates.
- Use Google Sans Flex as the prototype's global interface typeface.
- Primary CTAs use a deep plum background with light text.
- Today and Reports use centered max-width content containers; the sidebar starts collapsed by default.
- Use Iconoir for interface icons. The sidebar control lives in the sidebar header and replaces the former footer collapse action.
- The expanded sidebar header shows a disabled search field instead of personal identity or avatar; collapsing hides only that field and keeps the sidebar control aligned.
- The main sidebar includes an enabled `Semana` destination for weekly task management.
- Sidebar navigation is grouped as `VISTAS` (Tablero, Semana, Hoy), `OPCIONES` (Reportes, Filtros, Archivo), with Configuración anchored at the bottom. Reports enables Compartir only for an authenticated owner and copies the protected report entry URL.
- Appearance defaults to the operating-system preference and cycles through System, Light, and Dark from a single footer icon above Configuración; expanded sidebar shows the theme label and collapsed sidebar shows only the icon.
- When Supabase is connected, Configuración lets the owner manage report members and revoke access; viewers never see operational navigation or editing actions.
