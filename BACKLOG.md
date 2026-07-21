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
- **Alcance inicial:** Aplicar un estilo visual deshabilitado únicamente a las opciones cuyo comportamiento no estuviera implementado.
- **Criterios de aceptación:**
  - Las opciones no habilitadas tienen menor contraste y no muestran estados de interacción engañosos.
  - El cursor y los atributos de accesibilidad comunican que la opción está deshabilitada.
  - Las funciones disponibles, como Semana, Archivo y el buscador disponible para escritura, mantienen su apariencia e interacción actuales.

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
- **Objetivo:** Permitir planificar y revisar las mismas tareas tanto en Kanban como en una distribución temporal semanal de días hábiles.
- **Principios acordados:**
  - Kanban y Línea de tiempo son dos representaciones de las mismas tareas; no duplican información.
  - La Línea de tiempo muestra los días hábiles, de lunes a viernes; sábado y domingo permanecen ocultos.
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
- **Alcance:** Mostrar una semana laboral de lunes a viernes con acciones para avanzar, retroceder y volver a la semana actual.
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

#### 6.7. Refinar la Línea de tiempo como Kanban–Gantt

- **Estado:** Terminada
- **Alcance:** Presentar cinco días hábiles como columnas contiguas, ampliar las tarjetas y combinar navegación semanal con selección directa de fecha.
- **Criterios de aceptación:**
  - El calendario utiliza todo el ancho disponible de la vista.
  - Cada día se percibe como una columna Kanban unida a las demás.
  - Las tareas muestran título, descripción, fechas y esfuerzo en tarjetas más legibles.
  - Arrastrar una tarjeta hacia otro día conserva su duración y actualiza sus fechas.
  - Se puede navegar con semana anterior/siguiente, volver a la semana actual o elegir una fecha.
  - Un gesto de scroll horizontal hacia la izquierda o derecha cambia una semana por vez.

#### 6.8. Refinar la experiencia semanal de planificación

- **Estado:** Terminada
- **Alcance:** Consolidar la planificación semanal como una vista de trabajo diaria, con feriados, estados legibles, vencimientos y carga visible.
- **Criterios de aceptación:**
  - Un doble clic en una celda libre abre una tarea nueva con ese día como inicio y fin.
  - Cada día permite marcarse o desmarcarse como feriado; un feriado se atenúa y bloquea creación, arrastre y redimensionamiento de tareas.
  - Los estados TO-DO, DOING y DONE se distinguen con un semáforo pastel en el tablero y en las cards semanales.
  - Las tareas vencidas se distinguen con borde rojo y fondo `--color-danger-soft`; el tablero enlaza a la semana que contiene la tarea vencida.
  - Las cards semanales muestran el esfuerzo con cinco barras: verde para 1–2, amarillo para 3–4 y rojo para 5.

### 7. Persistencia en la nube y portal de seguimiento externo

- **Estado:** En curso
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

- **Estado:** En curso — carga y sincronización implementadas; pendiente verificar contra la instancia Supabase
- **Alcance:** Reemplazar `localStorage` como fuente principal por una API y base de datos remota.
- **Criterios de aceptación:**
  - Las tareas, columnas personalizadas, posiciones, esfuerzo, fechas y estados persisten entre dispositivos.
  - Las modificaciones se reflejan en Kanban, Hoy, Línea de tiempo y Reportes.
  - Los errores de red se comunican sin hacer creer que un cambio fue guardado.
  - Existe una estrategia de respaldo o exportación de datos.

#### 7.3. Migrar los datos locales existentes

- **Estado:** En curso — importación automática idempotente implementada; pendiente ejecutarla contra la instancia
- **Alcance:** Importar a la base de datos las tareas y columnas actualmente almacenadas en el navegador de Ricardo.
- **Criterios de aceptación:**
  - La migración no duplica ni pierde tareas.
  - Se conservan fechas, estados, esfuerzo, columnas y nombres personalizados.
  - Se puede verificar la cantidad de registros antes y después de migrar.
  - `localStorage` deja de actuar como fuente de verdad después de una migración exitosa.

#### 7.4. Implementar autenticación y permisos por rol

- **Estado:** En curso — experiencia autenticada y administración segura por correo implementadas; pendiente desplegar y verificar contra la instancia
- **Alcance:** Crear sesiones seguras para el propietario y los supervisores de solo lectura.
- **Criterios de aceptación:**
  - Un usuario no autenticado no puede consultar tareas ni reportes.
  - El rol `owner` conserva todas las funciones actuales.
  - El rol `viewer` solo puede ejecutar operaciones de lectura.
  - El propietario puede cambiar o revocar el acceso de un supervisor.
  - Las contraseñas nunca se almacenan en texto plano ni se incluyen en el frontend.

#### 7.5. Crear la experiencia externa de Reportes

- **Estado:** En curso — portal de solo lectura implementado; pendiente validarlo con una cuenta `viewer`
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

- **Estado:** En curso — configuración Vercel y protección por sesión preparadas; pendiente enlazar proyecto, variables y desplegar
- **Alcance:** Desplegar la aplicación y los servicios necesarios en una URL estable, incorporando la mejora 2.
- **Criterios de aceptación:**
  - La aplicación cuenta con una URL pública estable y HTTPS.
  - Las rutas privadas requieren una sesión válida.
  - El acceso del propietario y el acceso de supervisores respetan sus permisos en frontend y servidor.
  - El despliegue permite actualizar secretos y revocar accesos sin modificar el repositorio.
  - La experiencia funciona correctamente desde equipos externos y dispositivos móviles.

#### 7.7. Exportar periódicamente una copia de seguimiento a Notion

- **Estado:** En curso — rutina y agenda idempotentes implementadas; pendiente configurar secretos y validar la primera exportación
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

### 9. Incorporar bloc de Notas vinculado a tareas

- **Estado:** Pendiente
- **Prioridad:** Alta — posterior a 7.2, para que las notas y sus vínculos nazcan directamente en Supabase.
- **Objetivo:** Reemplazar la opción `Filtros` por `Notas` en la navegación y ofrecer un bloc para resúmenes de reuniones, transcripciones y apuntes operativos, siempre asociado a una tarea.
- **Alcance:**
  - La navegación `Filtros` pasa a llamarse `Notas` y utiliza un icono de nota/documento.
  - Una nota requiere asociarse a una tarea antes de guardarse.
  - Desde una tarea, el usuario puede vincular opcionalmente una nota existente o crear una nota nueva sin salir del flujo.
  - Las notas incluyen título, contenido enriquecible a futuro, tarea asociada, autor y marcas de creación/actualización.
  - Los perfiles `viewer` podrán consultar las notas de las tareas a las que tengan acceso, sin editarlas.
- **Decisiones de modelado:**
  - Crear una entidad `task_notes` separada de las `notes` de texto que hoy viven dentro de una tarea; al implementar la épica, renombrar el campo actual a una etiqueta inequívoca como `Notas de la tarea`.
  - La primera versión vincula cada nota a exactamente una tarea; vínculos con varias tareas se evaluarán después.
  - La eliminación de una tarea debe definir explícitamente si archiva o elimina las notas asociadas.
- **Criterios de aceptación:**
  - No puede guardarse una nota sin una tarea vinculada.
  - La lista permite encontrar notas por título, contenido y tarea vinculada.
  - El detalle de una tarea muestra sus notas vinculadas y permite abrirlas.
  - Crear una nota desde una tarea la deja asociada automáticamente.
  - Supabase aplica RLS para impedir que un `viewer` cree, edite o elimine notas.
  - La migración conserva el texto existente de `Notas de la tarea` y no lo confunde con las nuevas notas del bloc.

### 10. Administrar múltiples proyectos con el mismo tablero

- **Estado:** Pendiente
- **Prioridad:** Alta — posterior a la validación de la persistencia base en Supabase.
- **Objetivo:** Replicar la estructura y el manejo actual del tablero para múltiples proyectos, manteniendo las tareas, columnas, planificación, reportes, archivo y accesos aislados por proyecto.
- **Alcance:**
  - Incorporar una entidad de proyectos y una administración para crear, renombrar, archivar y elegir proyectos.
  - Reemplazar el selector temporal del encabezado por un dropdown funcional que permita cambiar el proyecto activo desde las vistas principales.
  - Cada proyecto parte con la misma estructura base de columnas y las mismas reglas de tareas, checklist, esfuerzo, vencimientos y ordenamiento.
  - Tablero, Semana, Hoy, Terminadas, Archivo, Notas y Reportes consumen exclusivamente la información del proyecto activo.
  - Definir la relación de propietarios y supervisores por proyecto, sin ampliar los permisos de un proyecto a otro por defecto.
- **Criterios de aceptación:**
  - El usuario puede crear y administrar más de un proyecto sin mezclar sus tareas, columnas ni archivos.
  - Cambiar el dropdown actualiza de inmediato todas las vistas al proyecto seleccionado.
  - Cada proyecto conserva su propia configuración de columnas, feriados, tareas, orden manual y métricas.
  - Los roles y enlaces compartidos respetan el alcance del proyecto correspondiente.
  - La creación de un proyecto nuevo entrega una configuración inicial utilizable y consistente con el tablero actual.

### 11. Internacionalizar la interfaz al inglés

- **Estado:** Pendiente
- **Prioridad:** Media
- **Objetivo:** Permitir que toda la interfaz pueda mostrarse en inglés, manteniendo el español como idioma inicial.
- **Alcance:**
  - Centralizar los textos visibles de la interfaz para que puedan traducirse de forma consistente.
  - Preparar una preferencia de idioma dentro de Configuración con Español e Inglés.
  - Dejar el control de idioma visible como preparación de la función, pero desactivado hasta que la traducción completa esté disponible.
  - Traducir navegación, vistas, formularios, validaciones, mensajes, estados, fechas y elementos de accesibilidad.
- **Criterios de aceptación:**
  - No quedan textos de interfaz, mensajes de error o etiquetas operativas sin una traducción al inglés definida.
  - El idioma elegido se conserva entre sesiones cuando la función se habilite.
  - La preferencia no altera tareas, notas ni contenido escrito por el usuario.
  - Mientras la función esté desactivada, Configuración comunica claramente que el cambio de idioma estará disponible próximamente.

### 12. Habilitar una experiencia responsive mínima para teléfono

- **Estado:** Pendiente
- **Prioridad:** Alta
- **Objetivo:** Permitir consultar y gestionar las funciones esenciales del tablero desde un teléfono sin depender de una pantalla de escritorio.
- **Alcance:**
  - Ajustar navegación, encabezado, formularios, modales, tablero, Semana, Hoy, Terminadas, Archivo y Reportes a pantallas pequeñas.
  - Definir una versión móvil mínima de Kanban y de planificación semanal que priorice lectura, navegación y acciones esenciales.
  - Mantener táctiles y accesibles los controles de creación, edición, checklist, ordenamiento y navegación temporal.
  - Revisar densidad, truncado de textos, scroll y zonas de toque para evitar pérdida de información o acciones inaccesibles.
- **Criterios de aceptación:**
  - La aplicación se puede usar correctamente en un viewport móvil de 360 px de ancho sin scroll horizontal involuntario.
  - Se pueden crear, editar, completar y consultar tareas desde teléfono.
  - El tablero conserva estados, vencimientos y esfuerzo legibles; la planificación semanal mantiene una alternativa utilizable cuando el ancho no permite la distribución de escritorio.
  - Modales, formularios y menús no quedan recortados fuera del viewport.
  - La navegación y los objetivos táctiles cumplen un tamaño mínimo cómodo para interacción con dedo.

### 13. Exportar manualmente el tablero completo a CSV

- **Estado:** Pendiente
- **Prioridad:** Media
- **Objetivo:** Entregar al propietario un respaldo manual, portable y consultable del tablero completo.
- **Alcance:**
  - Incorporar en la futura sección de Configuración una acción para exportar el proyecto activo como CSV.
  - Incluir tareas activas, terminadas y archivadas, junto con columnas, fechas, estados, esfuerzo, checklist, notas, links y marcas temporales disponibles.
  - Definir una estructura de archivo que permita abrirlo en herramientas habituales de planillas sin perder los campos principales.
  - Generar el archivo bajo demanda sin alterar ningún dato del tablero.
- **Criterios de aceptación:**
  - Solo el propietario puede iniciar la exportación.
  - El archivo se descarga con un nombre que identifica proyecto y fecha de exportación.
  - La exportación no modifica información ni bloquea el uso normal del tablero.
  - Cada tarea se representa de forma consistente, incluyendo los datos necesarios para una recuperación manual futura.

### 14. Incorporar un centro de notificaciones

- **Estado:** Pendiente — eventos por definir
- **Prioridad:** Media
- **Objetivo:** Comunicar novedades relevantes del tablero sin obligar al usuario a buscarlas manualmente.
- **Alcance inicial:**
  - Agregar una entrada de Notificaciones en el sidebar con icono de campana.
  - Mostrar un punto rojo cuando existan notificaciones nuevas sin leer.
  - Crear una vista o panel para revisar y marcar como leídas las notificaciones.
  - Definir posteriormente qué eventos generan una notificación, su prioridad y su persistencia.
- **Criterios de aceptación:**
  - El indicador se muestra solo cuando hay novedades no leídas.
  - El usuario puede distinguir entre notificaciones nuevas y revisadas.
  - La definición de eventos futuros no exige rediseñar la navegación ni el modelo visual del centro de notificaciones.

## Prioridades actuales

La planificación, los reportes y la apariencia visual están cerrados para la etapa actual. El foco pendiente es dejar operativo el acceso externo y la persistencia real.

1. **7.2 — Verificar persistencia en Supabase.** Conectar la instancia, ejecutar las comprobaciones y confirmar que tareas, columnas y esfuerzo se sincronizan entre sesiones.
2. **7.3 — Migrar datos locales.** Ejecutar y auditar la importación idempotente contra la instancia de producción.
3. **7.4 y 7.5 — Validar roles.** Probar el flujo completo con una cuenta `owner` y otra `viewer`, incluyendo revocación de acceso.
4. **7.6 / Mejora 2 — Desplegar en Vercel.** Enlazar el proyecto, configurar secretos, publicar y comprobar las rutas protegidas desde un dispositivo externo.
5. **7.7 — Habilitar exportación a Notion.** Configurar secretos, programador y la primera ejecución de respaldo.
6. **Mejora 9 — Bloc de Notas.** Construir las notas vinculadas después de verificar la persistencia base en Supabase.
7. **Mejora 10 — Múltiples proyectos.** Diseñar el modelo y la administración por proyecto después de validar la persistencia base.
8. **Mejora 12 — Responsive para teléfono.** Diseñar e implementar la experiencia móvil mínima sobre las vistas consolidadas.
9. **Mejora 11 — Inglés.** Centralizar las traducciones y preparar la preferencia cuando los textos operativos estén estabilizados.
10. **Mejora 13 — Exportación CSV.** Añadir el respaldo manual desde Configuración una vez estabilizada la administración del proyecto.
11. **Mejora 14 — Notificaciones.** Definir los eventos que generarán avisos antes de implementar su persistencia.
12. **Mejora 5 — Metas.** Retomar únicamente después de cerrar la nube y acordar su modelo funcional.

## Ruta de implementación histórica

Esta ruta conserva el orden en que se abordaron las dependencias técnicas y las entregas previas. La planificación vigente está en **Prioridades actuales**.

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
