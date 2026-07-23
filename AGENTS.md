# Prototype Instructions

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

New tasks default both their start and due dates to the current local date; users may edit either date before saving.

## Durable prototype decisions

- Do not show an “Añadir tarea” action in the sidebar; task creation belongs in the main views.
- The desktop sidebar must support explicit collapse and expand controls.
- The board view has the fixed heading `Tablero`; a shared header across the workspace area to the right of the sidebar contains the project dropdown, currently with the single `Ricardo Alfaro` option. Its heading is not editable.
- The shared project header starts fully collapsed as a small clickable tab, reclaiming its vertical space; expanding it restores the header strip and reveals the right-aligned `Proyecto` selector.
- When expanded, the project selector remains right-aligned inside the shared header strip; the centered collapse tab sits immediately below the header divider and space is reserved above the page content.
- The shared project-header tab is centered. When expanded, it moves to the header's lower edge with the block and its chevron points up to collapse the header again.
- Tasks include a persistent effort level from 1 to 5, edited with a slider and surfaced in Reports for future filtering and sorting.
- A task with exactly one checklist item is the exception to the usual progress gate: it may move to DOING while unchecked; checking that sole item automatically completes it, and unchecking it returns it to TO-DO.
- Task descriptions are persistent checklists. A task with at least one checked item moves to DOING; if all items are unchecked it returns to TO-DO; checking every item automatically moves it to DONE. Kanban drag and drop enforces this: TO-DO cannot go directly to DONE; entering DOING requires a checked item; moving incomplete DOING work to DONE offers to complete all pending items; moving DOING to TO-DO offers to uncheck completed items; DONE cards are not draggable back to active states. Adding an unchecked checklist item to a DONE task returns it to DOING. Notes use a taller field to encourage richer context.
- Weekly Timeline cards show effort graphically with a slightly enlarged five-bar meter: all filled bars are pastel green at levels 1–2, pastel yellow at 3–4, and pastel red at 5. Dragging a card over another lane previews the vertical insertion target with a dashed line; dropping can reorder it vertically and move it to another workday in the same gesture while preserving duration.
- Every Kanban column name is editable inline using double-click and Enter, matching the board-title interaction.
- Kanban column names are normalized to uppercase while typing and when saved. The new-column editor occupies a minimum empty-column card and uses adjacent X and check icon actions.
- The `TO-DO`, `DOING`, and `DONE` columns are permanent and have no deletion menu. Custom columns can be reordered between them and deleted; deleting one returns its tasks to `TO-DO` instead of deleting them.
- Status cues use a pastel traffic light: TO-DO is red, DOING yellow, and DONE green. Apply this to board count badges, Home and Historial list labels, and weekly Timeline card status labels.
- Board card overflow menus align with the title's top edge, and overdue board dates render as a rounded pastel-red pill.
- Within each Kanban column, tasks sort with the most recently modified first (including edits, checklist changes, and state moves). Board-card checklist previews show pending items before checked items, while the task editor preserves the original checklist sequence.
- Board cards can be manually reordered vertically with drag and drop. Manual order takes precedence until a task is edited or moved to another state, which returns that task to the automatic most-recent-first position; a later manual reorder takes precedence again.
- Overdue active board cards are always pinned above every other card in their column, regardless of manual ordering or recency. Once their due date is changed so they are no longer overdue, they return to normal manual/recency ordering.
- Board cards show the same pastel five-bar effort indicator as weekly cards, aligned in their lower-right corner beside the due date.
- Kanban cards change state only through drag and drop and therefore have no completion check. `DONE` has no add-task footer; `TO-DO`, `DOING`, and custom columns do.
- Kanban columns that admit task creation expose a minimal `+` action in the header; `DONE` remains creation-free to preserve its completed-only flow.
- Card overflow actions open a menu instead of acting immediately. `Archivar` requires confirmation, and Archivo supports restoring tasks to `TO-DO`, opening their edit modal, or permanently deleting them. The board surfaces an overdue-task alert linking to the weekly view.
- The board overdue-task alert opens the weekly Timeline anchored to an overdue task's week, not the current week.
- Overdue board and weekly Timeline cards use a red border and pastel-pink surface; board cards also show an overdue date pill.
- The palette includes `#D62839`, `#EF233C`, `#BA324F`, `#175676`, `#4BA3C3`, and `#CCE6F4`. `#EF233C` drives highlighted primary CTAs and the weekly Today indicator; dark blue remains the core navigation/action color, medium blue interaction, pale blue selection and surfaces, burgundy Archivo and custom columns, and `#D62839` semantic warnings and destructive actions. Colors are centralized as semantic CSS variables.
- Kanban and the weekly Timeline are two views of the same task data. Completed tasks stay in `DONE` on Kanban and remain visible on Timeline with a pastel-green surface and green border.
- The weekly Timeline uses seven contiguous Kanban-like day columns at full available width. Larger compact cards span their date range, preserve duration when dragged to another day, and support week navigation through arrows, a date picker, or horizontal scrolling gestures.
- The weekly Timeline shows only Monday through Friday; Saturday and Sunday are hidden. Each workday has a three-dot menu to mark or unmark it as a holiday. Holidays are muted and block new tasks, drops, and resizing on that day.
- Weekly Timeline tasks use compact overlap-aware lanes: non-overlapping tasks share the same vertical position, and a task moves to the next lane only when its date range overlaps another task.
- Weekly Timeline task durations resize from a right-edge handle and always snap to whole-day units, with one full day as the minimum visible duration.
- Double-clicking an empty weekly Timeline cell opens the new-task modal with that day prefilled as both start and end dates; task cards retain their existing edit interaction.
- Sidebar view labels and matching page titles are `Buen día!`, `Tablero`, `Planificación`, and `Historial`, in that order before Archivo. Buen día! combines today’s workload with active overdue tasks, prioritizes overdue tasks visually, and its overdue-task alert is informational because those tasks are already in the list. Planificación always shows the current calendar week's task count, while its page title shows the count for the week being viewed.
- Home shows its total current workload when the sidebar is expanded; when collapsed, its icon has a badge for the number of pending tasks due today or overdue.
- A task completed today remains visible in Home for the rest of that day, including when it was overdue before completion.
- Home recalculates immediately after checklist and state changes: a task moved to DONE is shown as DONE and no longer counts as overdue or appears in the overdue alert.
- Home greets the owner with `Buen día Ricardo!`; its subtitle mentions overdue work only when active overdue tasks exist.
- The workspace visual language draws from the supplied Continuum dashboard reference: a restrained pale blue/lilac canvas, centered content, compact hierarchy, white elevated panels, soft borders, and blue outlined controls. Do not copy its results or goal-ranking sections; retain the task product’s semantic traffic-light statuses.
- Tablero and Planificación remain full-width work surfaces. Tablero begins horizontal scrolling only once its columns exceed the available viewport. The compact shared project header’s selector is aligned to the viewport’s right edge, not to the centered content. CTA labels use uppercase. In Home, the overdue alert has clear separation from the heading. Dark mode follows the reference’s navy-to-violet gradient canvas with deep raised panels.
- Weekly day headers show only the centered weekday name and date number. Weekly cards show a two-line title and Kanban-column status, reveal their duration handle only on hover, and use a red outline for overdue tasks still in `DOING`.
- Weekly day headers stay compact. Weekly cards use light typographic weight, top-aligned content, no lateral move arrows, and show their start/end dates below the title; movement remains available through drag and drop.
- Task create/edit forms call the Kanban column `Estado`, call the due date `Fecha de fin`, and include persistent optional `Notas` and `Link` fields.
- Future cloud access must support an `owner` with full editing rights and external supervisors with report-focused, read-only access to metrics and task details.
- Supabase is the planned source of truth. Notion may receive scheduled, one-way exports for company visibility and backup, keyed by stable Supabase task IDs to avoid duplicates.
- Once the initial cloud migration is confirmed, Supabase is the sole source of truth for tasks and columns. A populated cloud board must never be overwritten by data from a browser-local copy; active local task data is retired while its recovery snapshot is retained.
- The local development environment supports an explicit browser-only data mode for visual experimentation. It can be seeded once from the cloud board, but never syncs back; production remains cloud-only.
- Use Google Sans Flex as the prototype's global interface typeface.
- Primary CTAs use a deep plum background with light text.
- Today and Reports use centered max-width content containers; the sidebar starts collapsed by default.
- Use Iconoir for interface icons. The sidebar control lives in the sidebar header and replaces the former footer collapse action.
- The expanded sidebar header shows an active, visually neutral search field instead of personal identity or avatar; filtering behavior may be staged later. Collapsing hides only that field and keeps the sidebar control aligned.
- The main sidebar includes an enabled `Semana` destination for weekly task management.
- Sidebar navigation is grouped as `VISTAS` (Buen día!, Tablero, Planificación, Historial, Archivo, Notas, Notificaciones) and `OPCIONES` (Reportes only), with Configuración anchored near the bottom above the final Cerrar sesión action. Notas and Notificaciones remain disabled until their workflows are implemented. Archivo uses the same Today-like list anatomy as Buen día! and Historial while retaining restore and permanent-delete controls. The board's DONE column shows only the 12 most recent tasks and offers `Ver más` to open Historial, a Today-like full completed-task history ordered by completion date and paginated at 20 tasks per page. Reports enables Compartir only for an authenticated owner and copies the protected report entry URL.
- Appearance defaults to the operating-system preference and cycles through System, Light, and Dark from a single footer icon above Configuración; expanded sidebar shows the theme label and collapsed sidebar shows only the icon. Shared-report viewers get the same control in their report header.
- When Supabase is connected, Configuración lets the owner create read-only report accounts with email and a temporary password, renew passwords, and revoke access. This flow never grants ownership; viewers never see operational navigation or editing actions.
- Read-only report headers identify the project as `Proyecto` / `Ricardo Alfaro`, provide icon-only theme and future-PDF download controls, and omit sharing controls.
- The report workspace begins with a single active `Resumen General` tab aligned with the period selector; it does not repeat the project selector, a `Reportes` heading, or a descriptive subtitle.
- Report period controls are a horizontal year selector, one grouped selector for month/quarter/week, and a calendar icon that opens a date-picker modal. Do not show the selected date range beneath these controls.
- Reports exclude archived tasks. `Terminadas` and `Pendientes` are the only summary cards; each leads with its count, shows only the period percentage, keeps a neutral selected state, and expands into a clean separated detail block for its tasks.
- The report overview appears before task details and integrates the effort distribution in its right third. Expanded task detail lists show only title and date, open a task detail on click, and scroll internally after six rows.
- In the report overview, the donut's status legend sits below it; effort uses a compact vertical five-bar chart within the right third. Expanded cards keep the standard neutral-gray border, matching their detail continuation.
