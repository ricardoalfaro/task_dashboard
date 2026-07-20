# Prototype Instructions

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

New tasks default both their start and due dates to the current local date; users may edit either date before saving.

## Durable prototype decisions

- Do not show an “Añadir tarea” action in the sidebar; task creation belongs in the main views.
- The desktop sidebar must support explicit collapse and expand controls.
- The board view has the fixed heading `Tablero de estado` and uses `Ricardo Alfaro` as the current project label; its heading is not editable.
- Tasks include a persistent effort level from 1 to 5, edited with a slider and surfaced in Reports for future filtering and sorting.
- Weekly Timeline cards show effort graphically with a slightly enlarged five-bar meter: all filled bars are pastel green at levels 1–2, pastel yellow at 3–4, and pastel red at 5.
- Every Kanban column name is editable inline using double-click and Enter, matching the board-title interaction.
- Kanban column names are normalized to uppercase while typing and when saved. The new-column editor occupies a minimum empty-column card and uses adjacent X and check icon actions.
- The `TO-DO`, `DOING`, and `DONE` columns are permanent and have no deletion menu. Custom columns can be reordered between them and deleted; deleting one returns its tasks to `TO-DO` instead of deleting them.
- Status cues use a pastel traffic light: TO-DO is red, DOING yellow, and DONE green. Apply this to board count badges and weekly Timeline card status labels.
- Board card overflow menus align with the title's top edge, and overdue board dates render as a rounded pastel-red pill.
- Kanban cards change state only through drag and drop and therefore have no completion check. `DONE` has no add-task footer; `TO-DO`, `DOING`, and custom columns do.
- Card overflow actions open a menu instead of acting immediately. `Archivar` requires confirmation, and Archivo supports restoring tasks to `TO-DO`, opening their edit modal, or permanently deleting them. The board surfaces an overdue-task alert linking to the weekly view.
- The board overdue-task alert opens the weekly Timeline anchored to an overdue task's week, not the current week.
- Overdue board and weekly Timeline cards use a red border and pastel-pink surface; board cards also show an overdue date pill.
- The palette includes `#D62839`, `#EF233C`, `#BA324F`, `#175676`, `#4BA3C3`, and `#CCE6F4`. `#EF233C` drives highlighted primary CTAs and the weekly Today indicator; dark blue remains the core navigation/action color, medium blue interaction, pale blue selection and surfaces, burgundy Archivo and custom columns, and `#D62839` semantic warnings and destructive actions. Colors are centralized as semantic CSS variables.
- Kanban and the weekly Timeline are two views of the same task data. Completed tasks stay in `DONE` on Kanban and remain visible but struck through and muted on Timeline.
- The weekly Timeline uses seven contiguous Kanban-like day columns at full available width. Larger compact cards span their date range, preserve duration when dragged to another day, and support week navigation through arrows, a date picker, or horizontal scrolling gestures.
- The weekly Timeline shows only Monday through Friday; Saturday and Sunday are hidden. Each workday has a three-dot menu to mark or unmark it as a holiday. Holidays are muted and block new tasks, drops, and resizing on that day.
- Weekly Timeline tasks use compact overlap-aware lanes: non-overlapping tasks share the same vertical position, and a task moves to the next lane only when its date range overlaps another task.
- Weekly Timeline task durations resize from a right-edge handle and always snap to whole-day units, with one full day as the minimum visible duration.
- Double-clicking an empty weekly Timeline cell opens the new-task modal with that day prefilled as both start and end dates; task cards retain their existing edit interaction.
- Sidebar view labels are `Estado`, `Semanal`, and `Diaria`. `Semanal` always shows the current calendar week's task count, while the weekly page title shows the count for the week being viewed.
- Weekly day headers show only the centered weekday name and date number. Weekly cards show a two-line title and Kanban-column status, reveal their duration handle only on hover, and use a red outline for overdue tasks still in `DOING`.
- Weekly day headers stay compact. Weekly cards use light typographic weight, top-aligned content, no lateral move arrows, and show their start/end dates below the title; movement remains available through drag and drop.
- Task create/edit forms call the Kanban column `Estado`, call the due date `Fecha de fin`, and include persistent optional `Notas` and `Link` fields.
- Future cloud access must support an `owner` with full editing rights and external supervisors with report-focused, read-only access to metrics and task details.
- Supabase is the planned source of truth. Notion may receive scheduled, one-way exports for company visibility and backup, keyed by stable Supabase task IDs to avoid duplicates.
- Use Google Sans Flex as the prototype's global interface typeface.
- Primary CTAs use a deep plum background with light text.
- Today and Reports use centered max-width content containers; the sidebar starts collapsed by default.
- Use Iconoir for interface icons. The sidebar control lives in the sidebar header and replaces the former footer collapse action.
- The expanded sidebar header shows an active, visually neutral search field instead of personal identity or avatar; filtering behavior may be staged later. Collapsing hides only that field and keeps the sidebar control aligned.
- The main sidebar includes an enabled `Semana` destination for weekly task management.
- Sidebar navigation is grouped as `VISTAS` (Tablero, Semana, Hoy), `OPCIONES` (Reportes, Filtros, Archivo), with Configuración anchored at the bottom. Reports enables Compartir only for an authenticated owner and copies the protected report entry URL.
- Appearance defaults to the operating-system preference and cycles through System, Light, and Dark from a single footer icon above Configuración; expanded sidebar shows the theme label and collapsed sidebar shows only the icon.
- When Supabase is connected, Configuración lets the owner create report accounts by email, change roles, and revoke access; viewers never see operational navigation or editing actions.
