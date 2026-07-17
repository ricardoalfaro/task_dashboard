# Exportación Supabase → Notion

La rutina `npm run export:notion` copia tareas desde Supabase hacia un data source de Notion. Es un flujo unidireccional: los cambios manuales en Notion no modifican el dashboard.

## Esquema requerido en Notion

El data source debe estar compartido con la integración y contener estas propiedades con sus tipos exactos:

| Propiedad | Tipo |
| --- | --- |
| `Name` | Title |
| `Supabase ID` | Rich text |
| `Description` | Rich text |
| `Start` | Date |
| `Due` | Date |
| `Status` | Select |
| `Column` | Select |
| `Effort` | Number |
| `Updated at` | Date |
| `Completed` | Checkbox |

`Supabase ID` es la clave idempotente. La primera ejecución crea páginas y las siguientes actualizan la página correspondiente sin duplicarla.

## Variables

La ejecución necesita `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_BOARD_ID`, `NOTION_TOKEN` y `NOTION_DATA_SOURCE_ID`. Son secretos de servidor y nunca deben usar el prefijo `VITE_`.

Opcionalmente, `EXPORT_SINCE` acepta un timestamp ISO para leer únicamente tareas modificadas desde ese instante. `DRY_RUN=true` consulta y valida sin escribir en Notion.

## Programación y ejecución manual

`.github/workflows/notion-export.yml` se ejecuta diariamente a las 12:17 UTC y también ofrece `workflow_dispatch`. Los cinco valores requeridos deben configurarse como GitHub Actions Secrets.

Cada ejecución registra inicio, término, duración, tareas leídas, creadas, actualizadas y fallidas. Las respuestas 429 y los errores transitorios 5xx se reintentan; si una tarea falla, las demás continúan y el job termina con error para permitir un reintento seguro.

La rutina usa la API de Notion `2026-03-11` y un `data_source_id`, no el antiguo `database_id`.
