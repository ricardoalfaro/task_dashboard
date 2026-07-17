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

## Configuración del cliente

El frontend cuenta con una capa de acceso en `src/data/dashboardRepository.js`. Para habilitarla se deben configurar las variables documentadas en `.env.example`:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_SUPABASE_BOARD_ID`

La clave anónima es pública y está protegida por RLS. La clave `service_role` no forma parte de la configuración del frontend.

El repositorio ofrece carga completa y mutaciones explícitas para tablero, columnas y tareas. La aplicación seguirá usando `localStorage` hasta que exista una instancia conectada y una sesión de propietario; no se habilita un fallback silencioso después de un error remoto.
