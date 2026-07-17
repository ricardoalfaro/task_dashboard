# Backlog de mejoras

Este documento reúne las mejoras planificadas para Task Dashboard. Las tareas están pendientes salvo que se indique lo contrario.

## Estados

- `Pendiente`: todavía no se ha iniciado.
- `En curso`: se está trabajando activamente.
- `Bloqueada`: necesita una decisión o dependencia externa.
- `Terminada`: la mejora ya está disponible y verificada.

## Mejoras planificadas

### 1. Opacar las opciones que aún no están habilitadas

- **Estado:** Terminada
- **Prioridad:** Media
- **Objetivo:** Diferenciar claramente las funciones disponibles de las que todavía no se pueden utilizar.
- **Alcance inicial:** Aplicar un estilo visual deshabilitado a opciones como Semana, Filtros, Archivo, Configuración, Compartir y el buscador superior mientras no tengan comportamiento implementado.
- **Criterios de aceptación:**
  - Las opciones no habilitadas tienen menor contraste y no muestran estados de interacción engañosos.
  - El cursor y los atributos de accesibilidad comunican que la opción está deshabilitada.
  - Las funciones disponibles mantienen su apariencia e interacción actuales.

### 2. Publicar en Vercel con acceso mediante contraseña

- **Estado:** Pendiente — se implementará como parte de la épica 7
- **Prioridad:** Alta
- **Objetivo:** Permitir que el tablero sea accesible desde internet, protegiéndolo con una contraseña.
- **Alcance inicial:** Desplegar la aplicación en Vercel e incorporar una pantalla de acceso previa al tablero.
- **Criterios de aceptación:**
  - La aplicación cuenta con una URL pública estable.
  - Cualquier visitante debe ingresar una contraseña válida antes de acceder.
  - Una sesión autenticada permanece activa durante un periodo definido.
  - La contraseña no queda expuesta en el código enviado al navegador ni en el repositorio.
  - El acceso puede revocarse o cambiarse sin modificar el código fuente.
  - La publicación distingue entre el acceso completo del propietario y el acceso externo de solo lectura.

### 3. Ver las tareas terminadas desde Reportes

- **Estado:** Terminada
- **Prioridad:** Alta
- **Objetivo:** Pasar de una métrica resumida a la lista concreta de logros del periodo.
- **Alcance inicial:** Permitir abrir la métrica de tareas terminadas y mostrar las tareas incluidas en el cálculo actual.
- **Criterios de aceptación:**
  - La lista respeta los filtros de fecha seleccionados en Reportes.
  - Cada elemento muestra al menos nombre, descripción y fecha de finalización.
  - Desde la lista se puede abrir el detalle de la tarea.
  - El total de la lista coincide con la métrica de tareas terminadas.

### 4. Agregar periodos de día, semana, mes y trimestre a Reportes

- **Estado:** Terminada
- **Prioridad:** Alta
- **Objetivo:** Consultar los logros con diferentes niveles de detalle temporal.
- **Alcance inicial:** Reemplazar el filtro exclusivo de mes y año por un selector de periodo con las opciones Día, Semana, Mes y Trimestre (`Q`).
- **Criterios de aceptación:**
  - El usuario puede seleccionar Día, Semana, Mes o Trimestre.
  - El selector de fecha se adapta al tipo de periodo escogido.
  - Las métricas y listas se recalculan usando exactamente el rango seleccionado.
  - Los trimestres se muestran como Q1, Q2, Q3 y Q4 junto con su año.
  - La interfaz comunica claramente las fechas inicial y final del periodo activo.

### 5. Incorporar una sección de Metas

- **Estado:** Bloqueada — pendiente de definición
- **Prioridad:** Por definir
- **Objetivo:** Relacionar el trabajo diario con objetivos de mayor alcance.
- **Decisiones pendientes:**
  - Qué información tendrá una meta.
  - Cómo se medirá su progreso.
  - Si las tareas podrán vincularse a una o más metas.
  - Qué periodos y estados tendrá una meta.
  - Cómo se presentará la sección dentro de la navegación.
- **Criterios de aceptación:** Se definirán cuando se acuerde la forma de la sección.

### 6. Agregar una vista semanal de Línea de tiempo

- **Estado:** Terminada
- **Prioridad:** Alta
- **Objetivo:** Permitir planificar y revisar las mismas tareas tanto en Kanban como en una distribución temporal semanal.
- **Principios acordados:**
  - Kanban y Línea de tiempo son dos representaciones de las mismas tareas; no duplican información.
  - La Línea de tiempo siempre muestra una semana completa.
  - Las tareas terminadas permanecen en `DONE` dentro del Kanban.
  - En Línea de tiempo, las tareas terminadas permanecen visibles, pero tachadas y con menor contraste.

#### 6.1. Extender el modelo de fechas de las tareas

- **Estado:** Terminada
- **Alcance:** Incorporar una fecha de inicio además de la fecha de entrega actual, manteniendo compatibilidad con las tareas ya guardadas.
- **Criterios de aceptación:**
  - Cada tarea puede tener fecha de inicio y fecha de entrega.
  - La fecha de inicio nunca queda después de la fecha de entrega.
  - Las tareas existentes se migran sin perder información.
  - Las fechas siguen persistiendo en `localStorage`.

#### 6.2. Habilitar la navegación Kanban / Línea de tiempo

- **Estado:** Terminada
- **Alcance:** Habilitar la opción `Línea de tiempo` del sidebar para acceder a la visualización semanal, manteniendo `Mi tablero` como entrada al Kanban.
- **Criterios de aceptación:**
  - El cambio de vista no modifica ni duplica tareas.
  - La vista seleccionada se conserva al recargar.
  - El control funciona con teclado y comunica cuál vista está activa.

#### 6.3. Construir la navegación semanal

- **Estado:** Terminada
- **Alcance:** Mostrar una semana de lunes a domingo con acciones para avanzar, retroceder y volver a la semana actual.
- **Criterios de aceptación:**
  - La interfaz comunica claramente las fechas inicial y final de la semana visible.
  - Se puede navegar a la semana anterior y siguiente.
  - Se puede regresar directamente a la semana actual.
  - La navegación no altera las fechas de las tareas.

#### 6.4. Representar las tareas en la Línea de tiempo

- **Estado:** Terminada
- **Alcance:** Dibujar cada tarea desde su fecha de inicio hasta su fecha de entrega dentro de la semana seleccionada.
- **Criterios de aceptación:**
  - Las tareas aparecen en los días que les corresponden.
  - Una tarea que cruza el inicio o final de la semana se recorta visualmente sin cambiar sus fechas.
  - Desde la Línea de tiempo se puede abrir el mismo detalle editable usado por Kanban.
  - El nivel de esfuerzo es visible para facilitar la lectura de carga semanal.

#### 6.5. Mostrar correctamente tareas terminadas

- **Estado:** Terminada
- **Alcance:** Reflejar el estado terminado de forma diferente en cada visualización.
- **Criterios de aceptación:**
  - Una tarea terminada permanece en `DONE` en Kanban.
  - La misma tarea permanece en su posición temporal original en Línea de tiempo.
  - En Línea de tiempo aparece tachada, opaca y sin confundirse con una tarea activa.
  - Abrir o editar una tarea terminada no cambia su estado involuntariamente.

#### 6.6. Permitir planificación directa desde la Línea de tiempo

- **Estado:** Terminada
- **Alcance:** Permitir mover o ajustar tareas temporalmente desde la vista semanal después de estabilizar la visualización inicial.
- **Criterios de aceptación:**
  - Una tarea puede cambiar de día conservando su duración.
  - Los cambios se reflejan inmediatamente en Kanban, Hoy y Reportes.
  - La interacción ofrece una alternativa accesible al arrastre.
  - Los cambios persisten al recargar.

### 7. Persistencia en la nube y portal de seguimiento externo

- **Estado:** Pendiente
- **Prioridad:** Alta
- **Objetivo:** Guardar las tareas de manera centralizada y permitir que superiores autorizados consulten Reportes y el detalle de las tareas desde internet sin poder modificar información.
- **Principios acordados:**
  - La base de datos en la nube pasa a ser la fuente de verdad de tareas, columnas y estados.
  - Ricardo mantiene acceso completo para crear, editar, mover, terminar y deprecar tareas.
  - Los supervisores utilizan un perfil externo de solo lectura.
  - El perfil externo accede a Reportes y al detalle de las tareas, pero no puede crear, editar, mover ni eliminar información.
  - El acceso requiere autenticación y puede revocarse sin desplegar código nuevamente.

#### 7.1. Definir arquitectura, proveedor y modelo de datos

- **Estado:** Terminada
- **Alcance:** Diseñar las entidades necesarias para tareas, columnas, usuarios y permisos sobre la arquitectura seleccionada.
- **Decisiones tomadas:**
  - Supabase será la fuente de verdad, usando PostgreSQL, Supabase Auth y Row Level Security.
  - El plan gratuito será suficiente para la primera etapa y se revisará si aumentan el uso o las necesidades de disponibilidad.
  - Notion recibirá copias periódicas unidireccionales, pero no actuará como base principal.
  - Cada supervisor tendrá una cuenta individual para permitir revocación y trazabilidad independientes.
  - La duración de las sesiones y la política de revocación se definirán durante la subtarea 7.4.
- **Criterios de aceptación:**
  - Las credenciales y secretos permanecen exclusivamente en el servidor.
  - El modelo contempla los roles `owner` y `viewer`.
  - Las reglas de acceso impiden escrituras desde un perfil `viewer` aunque se intente llamar directamente a la API.

#### 7.2. Persistir tareas y columnas en la nube

- **Estado:** En curso — cliente y repositorio preparados; pendiente de conectar una instancia Supabase
- **Alcance:** Reemplazar `localStorage` como fuente principal por una API y base de datos remota.
- **Criterios de aceptación:**
  - Las tareas, columnas personalizadas, posiciones, esfuerzo, fechas y estados persisten entre dispositivos.
  - Las modificaciones se reflejan en Kanban, Hoy, Línea de tiempo y Reportes.
  - Los errores de red se comunican sin hacer creer que un cambio fue guardado.
  - Existe una estrategia de respaldo o exportación de datos.

#### 7.3. Migrar los datos locales existentes

- **Estado:** En curso — importación idempotente y verificación preparadas; pendiente ejecutarlas contra la instancia
- **Alcance:** Importar a la base de datos las tareas y columnas actualmente almacenadas en el navegador de Ricardo.
- **Criterios de aceptación:**
  - La migración no duplica ni pierde tareas.
  - Se conservan fechas, estados, esfuerzo, columnas y nombres personalizados.
  - Se puede verificar la cantidad de registros antes y después de migrar.
  - `localStorage` deja de actuar como fuente de verdad después de una migración exitosa.

#### 7.4. Implementar autenticación y permisos por rol

- **Estado:** En curso — sesión, permisos y revocación preparados; pendiente conectar la experiencia autenticada
- **Alcance:** Crear sesiones seguras para el propietario y los supervisores de solo lectura.
- **Criterios de aceptación:**
  - Un usuario no autenticado no puede consultar tareas ni reportes.
  - El rol `owner` conserva todas las funciones actuales.
  - El rol `viewer` solo puede ejecutar operaciones de lectura.
  - El propietario puede cambiar o revocar el acceso de un supervisor.
  - Las contraseñas nunca se almacenan en texto plano ni se incluyen en el frontend.

#### 7.5. Crear la experiencia externa de Reportes

- **Estado:** Pendiente
- **Alcance:** Ofrecer al perfil `viewer` una entrada enfocada en seguimiento, sin controles de edición ni navegación operativa innecesaria.
- **Criterios de aceptación:**
  - Al iniciar sesión, el supervisor llega directamente a Reportes.
  - Puede cambiar los periodos disponibles y consultar las métricas autorizadas.
  - Puede abrir el detalle de cada tarea incluida en el reporte.
  - El detalle muestra nombre, descripción, fechas, estado, nivel de esfuerzo y columna.
  - No se renderizan acciones de crear, editar, mover, completar, deprecar o eliminar.
  - La interfaz comunica claramente que el acceso es de solo lectura.
  - El CTA `Compartir` genera una URL privada y revocable para el reporte cuando esta capacidad sea habilitada.

#### 7.6. Publicar y proteger la aplicación

- **Estado:** Pendiente
- **Alcance:** Desplegar la aplicación y los servicios necesarios en una URL estable, incorporando la mejora 2.
- **Criterios de aceptación:**
  - La aplicación cuenta con una URL pública estable y HTTPS.
  - Las rutas privadas requieren una sesión válida.
  - El acceso del propietario y el acceso de supervisores respetan sus permisos en frontend y servidor.
  - El despliegue permite actualizar secretos y revocar accesos sin modificar el repositorio.
  - La experiencia funciona correctamente desde equipos externos y dispositivos móviles.

#### 7.7. Exportar periódicamente una copia de seguimiento a Notion

- **Estado:** Pendiente
- **Alcance:** Sincronizar periódicamente desde Supabase hacia una base de datos de Notion para mantener una copia consultable dentro de las herramientas de la empresa.
- **Principios acordados:**
  - Supabase continúa siendo la única fuente de verdad.
  - La sincronización inicial es unidireccional: Supabase → Notion.
  - Los cambios manuales realizados en la copia de Notion no regresan automáticamente al dashboard.
- **Criterios de aceptación:**
  - Cada registro de Notion conserva el identificador estable de la tarea en Supabase.
  - Las ejecuciones posteriores actualizan los registros existentes sin crear duplicados.
  - La copia incluye al menos nombre, descripción, fechas, estado, columna, esfuerzo y fecha de última actualización.
  - La rutina permite una exportación completa y exportaciones incrementales basadas en `updated_at`.
  - La periodicidad se configura fuera del código fuente mediante un programador confiable.
  - Los tokens de Supabase y Notion se almacenan como secretos y nunca se envían al frontend.
  - Cada ejecución registra inicio, término, cantidad de registros creados o actualizados y errores.
  - Un fallo parcial puede reintentarse sin duplicar información.
  - La exportación también puede ejecutarse manualmente para validación o recuperación.

### 8. Incorporar apariencia clara, oscura y automática

- **Estado:** Terminada
- **Prioridad:** Media
- **Objetivo:** Adaptar la interfaz a la preferencia visual del sistema y permitir una selección manual persistente.
- **Criterios de aceptación:**
  - La apariencia inicial sigue la preferencia clara u oscura del sistema operativo.
  - Un único control alterna entre Sistema, Claro y Oscuro.
  - La preferencia manual persiste al recargar.
  - El control muestra etiqueta con el sidebar abierto y solo el icono al estar colapsado.
  - Las vistas principales, tarjetas, formularios, modales y reportes conservan contraste suficiente en modo oscuro.

## Ruta de implementación recomendada

La ruta está ordenada por dependencias técnicas y por la posibilidad de entregar valor verificable en cada etapa.

### Fase 0. Cerrar mejoras pequeñas ya iniciadas

1. **Mejora 1 — Opacar opciones aún no habilitadas.** Terminada.

### Fase 1. Estabilizar el modelo de datos

2. **6.1 — Extender el modelo de fechas.** Agregar fecha de inicio, validaciones y migración local. Esta información será utilizada por Línea de tiempo, Reportes y la futura base de datos.
3. **7.1 — Definir el esquema de Supabase.** Diseñar tablas, relaciones, roles y políticas usando el modelo completo de tareas antes de migrar datos.

### Fase 2. Completar el producto de Reportes

4. **Mejora 4 — Periodos de día, semana, mes y trimestre.** Establecer rangos de fecha consistentes antes de exponer información externamente.
5. **Mejora 3 — Lista y detalle de tareas terminadas.** Permitir pasar desde las métricas a las tareas concretas que las explican.

### Fase 3. Llevar la información a la nube

6. **7.2 — Persistir tareas y columnas en Supabase.** Reemplazar `localStorage` como fuente principal.
7. **7.3 — Migrar los datos existentes.** Importar y verificar las tareas actuales una vez estabilizado el esquema remoto.
8. **7.4 — Implementar autenticación y permisos.** Habilitar los roles `owner` y `viewer` con políticas de seguridad aplicadas desde la base de datos.

### Fase 4. Habilitar el seguimiento externo

9. **7.5 — Crear la experiencia externa de Reportes.** Mostrar métricas y detalles sin controles de edición para supervisores.
10. **7.6 / Mejora 2 — Publicar y proteger la aplicación.** Desplegar en Vercel con sesiones seguras y acceso externo verificable.

### Fase 5. Construir la planificación semanal

11. **6.2 — Agregar el selector Kanban / Línea de tiempo.** Ambas vistas consumirán las mismas tareas persistidas.
12. **6.3 — Construir la navegación semanal.** Incorporar semanas de lunes a domingo y navegación temporal.
13. **6.4 — Representar tareas en Línea de tiempo.** Dibujar duración, fechas y esfuerzo.
14. **6.5 — Mostrar tareas terminadas.** Mantenerlas visibles, tachadas y opacas.
15. **6.6 — Permitir planificación directa.** Agregar movimiento y ajuste de fechas una vez estabilizada la visualización.

### Fase 6. Automatizar continuidad y respaldo corporativo

16. **7.7 — Exportar periódicamente a Notion.** Implementar la copia incremental cuando Supabase y el modelo de datos ya sean estables.

### Fase 7. Ampliaciones posteriores

17. **Mejora 5 — Metas.** Retomar su definición después de estabilizar tareas, periodos, reportes y planificación temporal.
