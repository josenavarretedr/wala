# Refactor Actividades y Participación (Marzo 2026)

## Objetivo

Documentar los cambios implementados para homogeneizar el módulo Juntos bajo el concepto de **Actividad** (en UI), manteniendo compatibilidad con el modelo de datos existente en Firestore.

---

## Resumen de cambios implementados

### 1) Nomenclatura en UI

- Se renombraron etiquetas visibles de **Formulario** a **Actividad** en vistas de facilitador.
- Se mantuvo el `type: 'form'` internamente para preservar compatibilidad con datos existentes.

### 2) Lógica de “Completado”

Para actividades tipo `form`, una participación se considera completada cuando:

- Todos los campos `required` están respondidos, y
- Si existe campo de tipo `attendance`, ese campo está marcado con `attended: true`.

Implementación principal en store:

- `isParticipationComplete(activity, participation)`

### 3) Matriz de participación de inscritos

Se implementó una matriz que combina:

- Participantes activos del programa (`/programs/{programId}/participants`), y
- Participaciones enviadas de la actividad (`/programs/{programId}/participations`).

Acción principal:

- `buildParticipationMatrix(programId, activityId)`

Estado nuevo en store:

- `participationMatrix`

Esto permite mostrar **todos los inscritos**, incluso quienes aún no han enviado respuesta.

### 4) Vista de detalle de actividad (facilitador)

Se integró nueva UI para actividades tipo `form`:

- Estadísticas por matriz (`ActivityStats.vue`)
- Listado responsive (`ActivityParticipationList.vue`)
  - Tabla en desktop (`lg`+)
  - Tarjetas en mobile
  - Búsqueda por participante/negocio
  - Botón de exportación deshabilitado (placeholder)
  - Gestión masiva de asistencia por campos `attendance`

### 5) Navegación y rutas

- Ruta de participación de negocio renombrada a:
  - `name: 'activity-participation'`
  - `path: programs/:programId/:activityId/activity`
- Se actualizaron referencias en dashboard de negocio para usar la nueva ruta.

### 6) Acción rápida de programa

`ActionBtnProgram.vue` dejó de emitir eventos para modal y ahora navega directamente a:

- `name: 'NewActivity'` con `programId`

### 7) Ajustes en creación de actividad

En `NewActivity.vue`:

- Etiquetas visibles alineadas a “Actividad”
- Se mantiene persistencia con `type: 'form'` a nivel Firestore

---

## Archivos impactados

- `src/stores/activitiesStore.js`
- `src/composables/useActivities.js`
- `src/router/index.js`
- `src/views/facilitator/ActivityDetail.vue`
- `src/components/activities/detail/ActivityParticipationList.vue`
- `src/components/activities/detail/ActivityStats.vue`
- `src/components/programs/ActionBtnProgram.vue`
- `src/views/facilitator/ProgramDetail.vue`
- `src/views/facilitator/ProgramActivities.vue`
- `src/components/programs/ItemsProgram.vue`
- `src/components/activities/cards/FormCard.vue`
- `src/views/business/programs/ProgramDashboard.vue`
- `src/views/facilitator/NewActivity.vue`

---

## Compatibilidad

- Se conserva `activity.type === 'form'` en Firestore.
- Se conserva `submitFormParticipation` y estructura de `responses`.
- El cambio es principalmente de UX/nomenclatura y de lógica de completitud para facilitador.

---

## Pendientes funcionales

- Exportación de participación (CSV/PDF) actualmente en placeholder visual.

---

## Changelog

### [Marzo 2026]

- Implementado refactor de nomenclatura UI: formulario → actividad.
- Implementada matriz de participación sobre inscritos activos.
- Implementada lógica de completitud basada en requeridos + asistencia.
- Implementada gestión masiva de asistencia en listado de participación.
- Actualizada navegación de acción rápida a `NewActivity`.
