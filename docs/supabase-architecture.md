# Arquitectura de persistencia en Supabase

Supabase será la fuente de verdad del Task Dashboard. El frontend seguirá siendo una aplicación React desplegable en Vercel, pero leerá y escribirá mediante sesiones de Supabase Auth y políticas de Row Level Security (RLS).

## Entidades

- `boards`: tablero y propietario principal.
- `board_members`: acceso de usuarios autenticados a un tablero con rol `owner` o `viewer`.
- `columns`: columnas ordenadas del Kanban. `is_fixed` protege `TO-DO`, `DOING` y `DONE`.
- `tasks`: tarea, rango de fechas, esfuerzo, estado, posición y fechas de cierre o deprecación.

Las tareas referencian a una columna del mismo tablero mediante una clave foránea compuesta. La base de datos impide eliminar una columna que todavía contiene tareas; el cliente debe moverlas primero a `TO-DO`.

## Autorización

Las políticas RLS aplican los permisos aunque alguien intente llamar directamente a la API:

| Operación | `owner` | `viewer` |
| --- | --- | --- |
| Consultar tablero, miembros, columnas y tareas | Sí | Sí |
| Crear o editar tablero, columnas y tareas | Sí | No |
| Administrar miembros | Sí | No |
| Eliminar columnas personalizadas | Sí | No |
| Eliminar columnas fijas | No | No |

Para la primera versión se recomienda una cuenta individual por supervisor. La política de duración de sesiones y revocación se definirá al implementar autenticación en la subtarea 7.4.

`src/data/authRepository.js` encapsula el inicio y cierre de sesión, observa cambios de sesión y resuelve permisos explícitos (`canRead`, `canWrite`, `canManageAccess`). También permite listar, cambiar y revocar miembros; RLS limita estas operaciones al propietario aunque se invoque la API fuera de la interfaz.

Las cuentas y contraseñas se gestionan exclusivamente mediante Supabase Auth. El dashboard nunca guarda contraseñas ni las incorpora al estado persistente o al bundle.

## Variables y secretos

El frontend podrá utilizar la URL del proyecto y la clave pública/anónima de Supabase. La clave `service_role` nunca debe incluirse en el bundle del navegador ni guardarse en el repositorio.

Operaciones administrativas, migraciones y exportaciones a Notion usarán secretos almacenados en el entorno seguro que ejecute cada proceso.

## Migraciones siguientes

1. Aplicar y probar el esquema en un proyecto Supabase.
2. Crear el tablero inicial y sus tres columnas fijas.
3. Conectar el cliente React manteniendo temporalmente una estrategia segura de migración.
4. Importar y verificar los datos existentes desde `localStorage`.
5. Crear usuarios supervisores y validar que RLS bloquee toda escritura de un `viewer`.

La migración inicial está en `supabase/migrations/202607170001_initial_schema.sql`.
La migración `202607170002_local_migration_keys.sql` agrega identificadores de origen únicos para importar datos de `localStorage` sin duplicarlos.

## Configuración del cliente

El frontend cuenta con una capa de acceso en `src/data/dashboardRepository.js`. Para habilitarla se deben configurar las variables documentadas en `.env.example`:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_SUPABASE_BOARD_ID`

La clave anónima es pública y está protegida por RLS. La clave `service_role` no forma parte de la configuración del frontend.

En Vercel, las tres variables `VITE_SUPABASE_*` deben configurarse por entorno. La aplicación está protegida por sesión en el cliente y por RLS en la base de datos: conocer la URL estática no concede acceso a tareas o reportes.

El repositorio ofrece carga completa, sincronización y mutaciones explícitas para tablero, columnas y tareas. Cuando las variables no existen, la aplicación sigue usando `localStorage`. Cuando están configuradas, exige una sesión, carga Supabase como fuente de verdad y muestra cualquier error de guardado; no existe un fallback remoto silencioso.

## Migración de los datos locales

`src/data/localMigration.js` prepara una instantánea de las claves `td-board-title`, `td-columns` y `td-tasks`. Antes de escribir en Supabase guarda una copia fechada en `td-local-backup`.

La importación usa `legacy_id` como clave idempotente: los identificadores locales no se reutilizan como UUID, pero cada columna y tarea queda asociada permanentemente a su registro de origen. Las columnas se importan primero y luego se reconstruyen las relaciones de las tareas con los UUID remotos.

El proceso cuenta los registros antes y después y verifica que todos los identificadores locales existan remotamente. Solo después de completar esas comprobaciones escribe `td-cloud-migration`. En el primer acceso del propietario, la aplicación ejecuta esta importación si encuentra datos locales y después carga el tablero remoto. Los perfiles `viewer` nunca ejecutan la migración.
