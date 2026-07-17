# Bootstrap inicial de Supabase

Este proceso se ejecuta una vez después de aplicar las migraciones SQL. Es idempotente: si el usuario o tablero ya existen, los reutiliza; las columnas fijas se actualizan por `board_id + slug` sin duplicarse.

## Orden de preparación

1. Crear un proyecto Supabase.
2. Aplicar, en orden, los archivos de `supabase/migrations/` mediante el SQL Editor o Supabase CLI.
3. Definir localmente `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_OWNER_EMAIL` y, para un usuario nuevo, `SUPABASE_OWNER_PASSWORD`.
4. Ejecutar `npm run bootstrap:supabase`.
5. Copiar el `boardId` entregado a `VITE_SUPABASE_BOARD_ID` en Vercel y en el entorno local.
6. Configurar `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` con los valores públicos del proyecto.

`SUPABASE_BOARD_NAME` es opcional. La contraseña solo se utiliza para crear la cuenta mediante Supabase Auth y nunca se escribe en archivos, logs ni tablas propias.

## Resultado

La rutina crea o reutiliza:

- la cuenta autenticada del propietario;
- su tablero inicial;
- las columnas protegidas `TO-DO`, `DOING` y `DONE` con sus colores y posiciones.

La salida contiene únicamente identificadores y estados de creación. La `service_role` no se imprime y nunca debe tener prefijo `VITE_`.
