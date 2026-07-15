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
- Use the Color Hunt palette `#321E48`, `#43637E`, `#65DCD5`, and `#D9FFF4` as the prototype's core visual palette.
- Kanban and the weekly Timeline are two views of the same task data. Completed tasks stay in `DONE` on Kanban and remain visible but struck through and muted on Timeline.
- Future cloud access must support an `owner` with full editing rights and external supervisors with report-focused, read-only access to metrics and task details.
- Supabase is the planned source of truth. Notion may receive scheduled, one-way exports for company visibility and backup, keyed by stable Supabase task IDs to avoid duplicates.
