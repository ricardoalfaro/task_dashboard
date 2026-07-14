# Task Dashboard

Task Dashboard es una aplicación web para organizar y dar seguimiento al trabajo diario. Su interfaz combina un tablero Kanban con una vista de tareas del día y reportes mensuales, de modo que sea fácil entender qué está pendiente, qué está en curso y qué ya fue terminado.

## Objetivo

El tablero busca centralizar el seguimiento personal de tareas en una experiencia sencilla y visual. Permite:

- Organizar tareas en las columnas base `TO-DO`, `DOING` y `DONE`.
- Crear columnas adicionales según las necesidades del flujo de trabajo.
- Registrar un nombre, una descripción y una fecha de entrega en cada tarea.
- Mover tareas entre columnas mediante arrastrar y soltar.
- Consultar en formato de lista las tareas que vencen hoy.
- Marcar tareas como terminadas o deprecadas.
- Revisar métricas de tareas terminadas, pendientes y deprecadas.
- Filtrar los reportes por mes y año.

## Arquitectura

El proyecto es una aplicación de una sola página construida con React y Vite. Actualmente no necesita un backend: el estado se administra en el navegador y se conserva mediante `localStorage`.

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
   
   Los componentes React renderizan las vistas del tablero, Hoy y Reportes. La interfaz utiliza Phosphor Icons y un sistema visual definido en `styles.css`.

2. **Estado de la aplicación**
   
   `App.jsx` mantiene las tareas, columnas, navegación y modales con hooks de React. Las operaciones del usuario actualizan este estado de manera inmediata.

3. **Persistencia local**
   
   Las columnas se guardan bajo la clave `td-columns` y las tareas bajo `td-tasks` en `localStorage`. Esto conserva la información al recargar la página en el mismo navegador.

## Componentes principales

### `App`

Es el contenedor principal. Administra el estado compartido, la persistencia local, la navegación lateral y el formulario de tareas.

### `Board`

Representa el Kanban. Distribuye las tareas por columna, permite añadir columnas y gestiona el movimiento de tarjetas mediante drag and drop.

### `Today`

Muestra en formato de lista las tareas cuya fecha de entrega corresponde al día actual. Desde esta vista se puede abrir una tarea o marcarla como terminada.

### `Reports`

Calcula métricas a partir del mismo conjunto de tareas. Presenta totales, porcentajes y una distribución visual según el mes y año seleccionados.

### `TaskCard`, `TaskForm` y `Modal`

Estos componentes encapsulan la visualización de una tarjeta, el formulario de creación/edición y la capa modal reutilizable.

## Modelo de datos

Una tarea utiliza una estructura similar a esta:

```js
{
  id: 1,
  columnId: "todo",
  title: "Preparar presentación semanal",
  description: "Resumir avances, bloqueos y próximos hitos.",
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
- Phosphor Icons
- CSS responsive sin framework adicional
- `localStorage` para persistencia

## Ejecución local

Requisitos: Node.js y npm.

```bash
npm install
npm run dev
```

Vite mostrará la dirección local en la terminal.

Para generar la versión optimizada:

```bash
npm run build
```

El resultado se crea en el directorio `dist/`.

## Consideraciones actuales

- La información se conserva únicamente en el navegador donde fue creada.
- No existe autenticación ni sincronización entre dispositivos.
- Las fechas iniciales y los datos de demostración están definidos en `App.jsx`.
- Una futura versión puede separar los componentes en archivos individuales e incorporar una API y base de datos para sincronización multiusuario.
