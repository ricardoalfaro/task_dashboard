# Backlog de mejoras

Este documento reúne las mejoras planificadas para Task Dashboard. Las tareas están pendientes salvo que se indique lo contrario.

## Estados

- `Pendiente`: todavía no se ha iniciado.
- `En curso`: se está trabajando activamente.
- `Bloqueada`: necesita una decisión o dependencia externa.
- `Terminada`: la mejora ya está disponible y verificada.

## Mejoras planificadas

### 1. Opacar las opciones que aún no están habilitadas

- **Estado:** Pendiente
- **Prioridad:** Media
- **Objetivo:** Diferenciar claramente las funciones disponibles de las que todavía no se pueden utilizar.
- **Alcance inicial:** Aplicar un estilo visual deshabilitado a opciones como Buscador, Filtros y etiquetas, Deprecadas, Notificaciones y Contraer menú mientras no tengan comportamiento implementado.
- **Criterios de aceptación:**
  - Las opciones no habilitadas tienen menor contraste y no muestran estados de interacción engañosos.
  - El cursor y los atributos de accesibilidad comunican que la opción está deshabilitada.
  - Las funciones disponibles mantienen su apariencia e interacción actuales.

### 2. Publicar en Vercel con acceso mediante contraseña

- **Estado:** Pendiente
- **Prioridad:** Alta
- **Objetivo:** Permitir que el tablero sea accesible desde internet, protegiéndolo con una contraseña.
- **Alcance inicial:** Desplegar la aplicación en Vercel e incorporar una pantalla de acceso previa al tablero.
- **Criterios de aceptación:**
  - La aplicación cuenta con una URL pública estable.
  - Cualquier visitante debe ingresar una contraseña válida antes de acceder.
  - Una sesión autenticada permanece activa durante un periodo definido.
  - La contraseña no queda expuesta en el código enviado al navegador ni en el repositorio.
  - El acceso puede revocarse o cambiarse sin modificar el código fuente.

### 3. Ver las tareas terminadas desde Reportes

- **Estado:** Pendiente
- **Prioridad:** Alta
- **Objetivo:** Pasar de una métrica resumida a la lista concreta de logros del periodo.
- **Alcance inicial:** Permitir abrir la métrica de tareas terminadas y mostrar las tareas incluidas en el cálculo actual.
- **Criterios de aceptación:**
  - La lista respeta los filtros de fecha seleccionados en Reportes.
  - Cada elemento muestra al menos nombre, descripción y fecha de finalización.
  - Desde la lista se puede abrir el detalle de la tarea.
  - El total de la lista coincide con la métrica de tareas terminadas.

### 4. Agregar periodos de día, semana, mes y trimestre a Reportes

- **Estado:** Pendiente
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

## Orden sugerido

1. Opacar las opciones aún no habilitadas.
2. Ampliar los filtros temporales de Reportes.
3. Mostrar la lista de tareas terminadas en Reportes.
4. Publicar y proteger la aplicación en Vercel.
5. Definir e implementar la sección de Metas.
