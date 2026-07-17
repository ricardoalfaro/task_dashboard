# Bootstrap inicial de Supabase

Este proceso se ejecuta una vez después de aplicar las migraciones SQL. Es idempotente: si el usuario o tablero ya existen, los reutiliza; las columnas fijas se actualizan por `board_id + slug` sin duplicarse.

## Orden de preparación

1. Crear un proyecto Supabase.
2. Aplicar, en orden, los archivos de `supabase/migrations/` mediante el SQL Editor o Supabase CLI.
3. Definir localmente `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_OWNER_EMAIL` y, para un usuario nuevo, `SUPABASE_OWNER_PASSWORD`.
4. Ejecutar `npm run bootstrap:supabase`.
5. Desplegar la función segura con `supabase functions deploy manage-members`.
6. Copiar el `boardId` entregado a `VITE_SUPABASE_BOARD_ID` en Vercel y en el entorno local.
7. Configurar `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` con los valores públicos del proyecto.
8. Crear un supervisor desde Configuración y definir `SUPABASE_VIEWER_EMAIL` y `SUPABASE_VIEWER_PASSWORD` solo en el entorno local de verificación.
9. Ejecutar `npm run verify:supabase`.

`SUPABASE_BOARD_NAME` es opcional. La contraseña solo se utiliza para crear la cuenta mediante Supabase Auth y nunca se escribe en archivos, logs ni tablas propias.

## Resultado

La rutina crea o reutiliza:

- la cuenta autenticada del propietario;
- su tablero inicial;
- las columnas protegidas `TO-DO`, `DOING` y `DONE` con sus colores y posiciones.

La salida contiene únicamente identificadores y estados de creación. La `service_role` no se imprime y nunca debe tener prefijo `VITE_`.

## Administración de supervisores

`supabase/functions/manage-members` permite que el propietario cree, actualice o revoque cuentas por correo desde Configuración. La plataforma verifica el JWT antes de ejecutar la función y luego se valida `is_board_owner` dentro de ella. Solo después de ambas comprobaciones se usa el cliente administrativo disponible en el runtime.

La contraseña temporal viaja directamente a Supabase Auth. No se guarda en `board_members`, en el estado persistente del navegador ni en logs. Un supervisor revocado conserva su cuenta Auth, pero pierde inmediatamente toda lectura del tablero por RLS.

## Verificación de permisos

`npm run verify:supabase` usa exclusivamente la anon key y sesiones normales. Comprueba que:

- una consulta anónima devuelve cero tareas;
- el propietario puede leer, escribir y usar `manage-members`;
- el supervisor puede leer;
- PostgreSQL rechaza la escritura del supervisor;
- la Edge Function rechaza la administración solicitada por el supervisor.

La escritura de prueba conserva el mismo nombre del tablero y no crea datos temporales. El proceso falla inmediatamente ante cualquier permiso más amplio o más restrictivo que el esperado.
