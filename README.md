# Task Dashboard

Task Dashboard es una aplicación web para organizar y dar seguimiento al trabajo diario. Su interfaz combina un tablero Kanban, planificación semanal, una vista de tareas del día y reportes por distintos períodos, de modo que sea fácil entender qué está pendiente, qué está en curso y qué ya fue terminado.

## Objetivo

El tablero busca centralizar el seguimiento personal de tareas en una experiencia sencilla y visual. Permite:

- Organizar tareas en las columnas base `TO-DO`, `DOING` y `DONE`.
- Crear columnas adicionales según las necesidades del flujo de trabajo.
- Registrar un nombre, una descripción y una fecha de entrega en cada tarea.
- Mover tareas entre columnas mediante arrastrar y soltar.
- Planificar las mismas tareas en una línea de tiempo semanal de lunes a domingo.
- Consultar en formato de lista las tareas que vencen hoy.
- Marcar tareas como terminadas o deprecadas.
- Revisar métricas de tareas terminadas, pendientes y deprecadas.
- Filtrar los reportes por día, semana, mes o trimestre.

## Arquitectura

El proyecto es una aplicación de una sola página construida con React y Vite. Funciona localmente con `localStorage` y, al configurar Supabase, cambia a persistencia remota autenticada con permisos de propietario y supervisor.

```text
task_dashboard/
├── index.html              # Documento HTML principal
├── package.json            # Dependencias y scripts del proyecto
├── vite.config.mjs         # Configuración del servidor y build de Vite
└── src/
    ├── main.jsx            # Punto de entrada de React
    ├── App.jsx             # Estado, navegación y componentes funcionales
    └── styles.css          # Sistema visual y estilos responsive
```

### Capas de la aplicación

1. **Presentación**

   Los componentes React renderizan las vistas del tablero, Hoy y Reportes. La interfaz utiliza Iconoir y un sistema visual definido en `styles.css`.

2. **Estado de la aplicación**

   `App.jsx` mantiene las tareas, columnas, navegación y modales con hooks de React. Las operaciones del usuario actualizan este estado de manera inmediata.

3. **Persistencia**

   Sin configuración remota, las columnas se guardan bajo `td-columns` y las tareas bajo `td-tasks` en `localStorage`. Con las variables `VITE_SUPABASE_*`, Supabase se convierte en la fuente de verdad y sincroniza tablero, columnas y tareas entre dispositivos.

4. **Acceso externo**

   Supabase Auth administra las sesiones. El rol `owner` conserva la edición completa; el rol `viewer` entra directamente a Reportes y solo puede consultar métricas y detalle de tareas.

## Componentes principales

### `App`

Es el contenedor principal. Administra el estado compartido, la persistencia local, la navegación lateral y el formulario de tareas.

### `Board`

Representa el Kanban. Distribuye las tareas por columna, permite añadir columnas y gestiona el movimiento de tarjetas mediante drag and drop.

### `Today`

Muestra en formato de lista las tareas cuya fecha de entrega corresponde al día actual. Desde esta vista se puede abrir una tarea o marcarla como terminada.

### `Timeline`

Representa las tareas entre su fecha de inicio y entrega en una semana de lunes a domingo. Permite navegar entre semanas, ver el nivel de esfuerzo y abrir el mismo detalle editable del Kanban; las tareas terminadas permanecen visibles, tachadas y opacas. Una tarea se puede reprogramar conservando su duración al arrastrarla hacia otro día o mediante sus controles de día anterior y siguiente.

### `Reports`

Calcula métricas a partir del mismo conjunto de tareas. Presenta totales, porcentajes y una distribución visual según el día, semana, mes o trimestre seleccionado. La métrica de tareas terminadas permite desplegar la lista correspondiente y abrir el detalle de cada tarea.

### `TaskCard`, `TaskForm` y `Modal`

Estos componentes encapsulan la visualización de una tarjeta, el formulario de creación/edición y la capa modal reutilizable.

## Despliegue en Vercel

`vercel.json` configura el build de Vite, el fallback de la SPA, caché inmutable para assets versionados y cabeceras de seguridad. La URL puede ser pública, pero ningún dato remoto se carga sin una sesión válida de Supabase; los permisos efectivos se vuelven a aplicar en PostgreSQL mediante RLS.

Antes del primer despliegue se deben crear `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` y `VITE_SUPABASE_BOARD_ID` en los entornos Production y Preview de Vercel. Son datos públicos del cliente, no secretos administrativos. Nunca se debe configurar `service_role` con prefijo `VITE_`.

La rama principal puede conectarse mediante la integración Git de Vercel para producción y las ramas de trabajo generan previews. El proyecto aún requiere enlazarse a una cuenta Vercel antes de obtener su URL estable.

## Copia periódica en Notion

`npm run export:notion` ejecuta una sincronización unidireccional e idempotente desde Supabase. El workflow `notion-export.yml` la programa diariamente y permite lanzarla manualmente o en modo dry-run. La preparación del data source y las variables requeridas están documentadas en `docs/notion-export.md`.

## Modelo de datos

Una tarea utiliza una estructura similar a esta:

```js
{
  id: 1,
  columnId: "todo",
  title: "Preparar presentación semanal",
  description: "Resumir avances, bloqueos y próximos hitos.",
  start: "2026-07-14",
  due: "2026-07-14",
  status: "active",
  createdAt: "2026-07-03",
  completedAt: undefined,
  deprecatedAt: undefined
}
```

Los estados posibles son:

- `active`: tarea pendiente o en curso.
- `completed`: tarea terminada.
- `deprecated`: tarea descartada sin eliminar su registro histórico.

Una columna contiene un identificador, un nombre visible y un color de estado:

```js
{
  id: "todo",
  title: "TO-DO",
  color: "#e7462e"
}
```

## Tecnologías

- React 19
- Vite 6
- Iconoir
- CSS responsive sin framework adicional
- `localStorage` para persistencia

## Ejecución local

Requisitos: Node.js y npm.

```bash
npm install
npm run dev
```

Vite mostrará la dirección local en la terminal.

Para preparar la conexión con Supabase, copia `.env.example` a `.env.local` y completa la URL, clave anónima e identificador del tablero. Mientras estas variables y una sesión autenticada no estén disponibles, `localStorage` continúa siendo la fuente activa del prototipo.

Para generar la versión optimizada:

```bash
npm run build
```

El resultado se crea en el directorio `dist/`.

## Consideraciones actuales

- La información se conserva únicamente en el navegador donde fue creada.
- No existe autenticación ni sincronización entre dispositivos.
- Las fechas iniciales y los datos de demostración están definidos en `App.jsx`.
- Las tareas existentes sin fecha de inicio se migran como tareas de un solo día, usando su fecha de entrega como inicio.
- Una futura versión puede separar los componentes en archivos individuales e incorporar una API y base de datos para sincronización multiusuario.
