# `activitiesStore.js` — Documentación del Store de Actividades

**Archivo:** `src/stores/activitiesStore.js`  
**Store ID:** `activities`  
**Tipo:** Pinia Store (Composition API)  
**Módulo:** Juntos — Actividades y Participaciones

---

## Tabla de Contenidos

1. [Descripción General](#descripción-general)
2. [Dependencias e Imports](#dependencias-e-imports)
3. [Arquitectura Firestore](#arquitectura-firestore)
4. [Tipos de Actividad](#tipos-de-actividad)
5. [State](#state)
6. [Getters](#getters)
7. [Actions](#actions)
   - [createActivity](#1-createactivity)
   - [loadActivities](#2-loadactivities)
   - [loadActivity](#3-loadactivity)
   - [updateActivity](#4-updateactivity)
   - [deleteActivity](#5-deleteactivity)
   - [loadActivityParticipations](#6-loadactivityparticipations)
   - [markAttendance](#7-markattendance)
   - [submitConsulting](#8-submitconsulting)
   - [loadUserActivities](#9-loaduseractivities)
   - [getUserConsultingCount](#10-getuserconsultingcount)
   - [getUserSessionsAttended](#11-getusersessionsattended)
   - [$reset](#12-reset)
8. [Aliases de Compatibilidad](#aliases-de-compatibilidad)
9. [Ejemplos de Uso](#ejemplos-de-uso)
10. [Estructura de Datos de Participación](#estructura-de-datos-de-participación)
11. [Guías Relacionadas](#guías-relacionadas)

---

## Descripción General

`useActivitiesStore` gestiona las **actividades** que los facilitadores crean dentro de un programa (módulo Juntos) y el registro de **participaciones** de los negocios en dichas actividades.

Existen dos tipos principales de actividad:

- **Sesiones (`session`):** Talleres o reuniones grupales con registro de asistencia.
- **Asesorías (`consulting`):** Evaluaciones individuales por negocio con formulario de categorías y scores.

Todo acceso a Firestore se realiza **directamente desde el cliente** sin Cloud Functions.

---

## Dependencias e Imports

```js
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import {} from /* Firestore SDK */ "firebase/firestore";
import { db } from "@/firebaseInit";
import { useAuthStore } from "./authStore";
```

| Dependencia    | Uso                                            |
| -------------- | ---------------------------------------------- |
| `useAuthStore` | Obtener `user.uid` del facilitador autenticado |
| `db`           | Instancia de Firestore                         |

---

## Arquitectura Firestore

```
/programs/{programId}
├── /activities/{activityId}
│   ├── type: 'session' | 'consulting' | 'monitoring'
│   ├── title, description, date, ...
│   ├── consultingConfig / monitoringConfig   ← Solo para asesorías
│   └── metadata: { totalParticipants, completionRate }
│
└── /participations/{participationId}
    ├── activityId          ← Relación con la actividad
    ├── activityType        ← 'session' | 'consulting' | 'monitoring'
    ├── userId / businessId / businessName
    ├── attendance          ← Solo para sesiones
    ├── consultingData      ← Solo para asesorías
    ├── monitoringData      ← Alias de backward compatibility
    └── status: 'completed' | 'absent'
```

> Las participaciones se almacenan en una subcolección **plana** por programa (`/participations`), no anidadas dentro de cada actividad. Se filtran por `activityId` en cada query.

---

## Tipos de Actividad

| Tipo                 | Campo `type` | Descripción                       | Configuración automática                           |
| -------------------- | ------------ | --------------------------------- | -------------------------------------------------- |
| Sesión               | `session`    | Taller o reunión grupal           | Ninguna                                            |
| Asesoría             | `consulting` | Evaluación individual por negocio | `consultingConfig` con 7 categorías y 21 preguntas |
| Monitoreo _(legacy)_ | `monitoring` | Alias antiguo de `consulting`     | Igual que `consulting`                             |

---

## State

```ts
const activities = ref([]); // Lista de actividades del programa actual
const currentActivity = ref(null); // Actividad actualmente en detalle
const participations = ref([]); // Participaciones de la actividad actual
const loading = ref(false);
const error = ref(null);
```

| Propiedad         | Tipo               | Descripción                                                         |
| ----------------- | ------------------ | ------------------------------------------------------------------- |
| `activities`      | `Activity[]`       | Actividades cargadas del programa, ordenadas por `createdAt` desc   |
| `currentActivity` | `Activity \| null` | Actividad actualmente visualizada                                   |
| `participations`  | `Participation[]`  | Participaciones de la última llamada a `loadActivityParticipations` |
| `loading`         | `boolean`          | `true` durante cualquier operación async                            |
| `error`           | `string \| null`   | Mensaje del último error                                            |

---

## Getters

### `activitiesByType`

```ts
computed(() => (type: string) => Activity[]): Function
```

Función que filtra `activities` por tipo. Uso: `activitiesByType('session')`.

---

### `sessionActivities`

```ts
computed(() => activities.value.filter(a => a.type === 'session')): Activity[]
```

Acceso directo a las actividades de tipo sesión.

---

### `consultingActivities`

```ts
computed(() => activities.value.filter(
  a => a.type === 'consulting' || a.type === 'monitoring'
)): Activity[]
```

Incluye tanto `consulting` como `monitoring` (legacy) para compatibilidad.

> **Alias:** `monitoringActivities` apunta al mismo computed.

---

### `userParticipations`

```ts
computed(() => (userId: string) => Participation[]): Function
```

Filtra `participations` por `userId` sobre los datos ya cargados en state.  
Requiere haber llamado `loadActivityParticipations` previamente.

---

## Actions

### 1. `createActivity`

Crea una nueva actividad dentro de un programa.

```ts
async function createActivity(
  programId: string,
  activityData: object,
): Promise<Activity>;
```

**Parámetros:**

| Nombre         | Tipo     | Descripción                                         |
| -------------- | -------- | --------------------------------------------------- |
| `programId`    | `string` | ID del programa en `/programs`                      |
| `activityData` | `object` | Datos de la actividad (ver campos requeridos abajo) |

**Campos de `activityData` (mínimos recomendados):**

```ts
{
  type: 'session' | 'consulting' | 'monitoring',
  title: string,
  description?: string,
  date?: string,
  requiredEvidence?: boolean   // Solo para asesorías
}
```

**Comportamiento automático:**

- Agrega `createdBy` (uid del facilitador) y `createdAt` (serverTimestamp)
- Inicializa `metadata: { totalParticipants: 0, completionRate: 0 }`
- Si `type === 'consulting'` o `'monitoring'` y no se provee `consultingConfig`:  
  crea `consultingConfig` por defecto con 7 categorías y 21 preguntas:
  ```js
  consultingConfig: {
    formTemplate: 'standard',
    categories: ['negocio', 'marketing', 'controlStock', 'compras',
                 'costeo', 'mantenimientoRegistros', 'planificacion'],
    totalQuestions: 21,
    requiredEvidence: false
  }
  ```
  También duplica en `monitoringConfig` por compatibilidad.

**Retorna:** `{ id, ...activityData }` del documento creado.

**Ruta Firestore:** `programs/{programId}/activities` (nueva doc con `addDoc`)

---

### 2. `loadActivities`

Carga todas las actividades de un programa, con soporte de filtro opcional por tipo.

```ts
async function loadActivities(
  programId: string,
  filters?: { type?: string },
): Promise<Activity[]>;
```

**Parámetros:**

| Nombre         | Tipo      | Descripción                                     |
| -------------- | --------- | ----------------------------------------------- |
| `programId`    | `string`  | ID del programa                                 |
| `filters.type` | `string?` | Si se provee, filtra por `type == filters.type` |

**Ordenamiento:** `createdAt` descendente.

**Efecto en state:** Actualiza `activities`, `loading`, `error`.

---

### 3. `loadActivity`

Carga el detalle de una actividad específica.

```ts
async function loadActivity(
  programId: string,
  activityId: string,
): Promise<Activity>;
```

**Ruta Firestore:** `programs/{programId}/activities/{activityId}`

**Efecto en state:** Actualiza `currentActivity`, `loading`, `error`.

**Lanza:** `Error('Actividad no encontrada')` si el doc no existe.

---

### 4. `updateActivity`

Actualiza campos de una actividad existente.

```ts
async function updateActivity(
  programId: string,
  activityId: string,
  updates: object,
): Promise<true>;
```

Agrega `updatedAt: serverTimestamp()` automáticamente.

**Efecto en state:**

- Si `currentActivity.id === activityId` → actualiza `currentActivity` localmente.
- Actualiza el item correspondiente en `activities[]` localmente (sin releer Firestore).

---

### 5. `deleteActivity`

Elimina una actividad de Firestore y del state local.

```ts
async function deleteActivity(
  programId: string,
  activityId: string,
): Promise<true>;
```

> No elimina las participaciones asociadas. Si se requiere limpieza en cascada, debe hacerse manualmente o vía Cloud Function.

**Efecto en state:** Remueve de `activities[]`. Si `currentActivity.id === activityId` → lo pone en `null`.

---

### 6. `loadActivityParticipations`

Carga todas las participaciones de una actividad específica, ordenadas por `submittedAt` desc.

```ts
async function loadActivityParticipations(
  programId: string,
  activityId: string,
): Promise<Participation[]>;
```

**Ruta Firestore:** `programs/{programId}/participations` (filtrado por `activityId == activityId`)

**Efecto en state:** Actualiza `participations`, `loading`, `error`.

---

### 7. `markAttendance`

Registra o actualiza la asistencia de un usuario a una sesión.

```ts
async function markAttendance(
  programId: string,
  activityId: string,
  userId: string,
  userData: UserData,
  attended?: boolean, // default: true
  notes?: string, // default: ''
): Promise<string>; // Retorna participationId
```

**Parámetros de `userData`:**

```ts
{
  userName?: string,
  name?: string,       // Fallback de userName
  businessId?: string,
  businessName?: string
}
```

**Lógica upsert:**

- Si **no existe** participación para `(activityId, userId)` → crea nueva con `addDoc`
- Si **ya existe** → actualiza con `updateDoc`

**Campos en `attendance`:**

```ts
{
  attended: boolean,
  markedAt: Timestamp,
  markedBy: string,   // uid del facilitador
  notes: string
}
```

**Status resultante:** `'completed'` si `attended === true`, `'absent'` si `false`.

**Efecto colateral:** Incrementa `metadata.totalParticipants` en la actividad solo si es una nueva participación.

**Retorna:** `participationId` del documento creado o actualizado.

---

### 8. `submitConsulting`

Registra una asesoría completa con formulario de evaluación por categorías.

```ts
async function submitConsulting(
  programId: string,
  activityId: string,
  consultingData: ConsultingData,
): Promise<Participation>;
```

**Estructura de `consultingData`:**

```ts
{
  userId: string,
  userName?: string,
  businessId?: string,
  businessName?: string,
  modality: string,               // 'presencial' | 'virtual' | etc.
  consultingDate: string,         // Fecha de la asesoría
  responses: {                    // Respuestas por categoría
    [category: string]: {
      [questionKey: string]: number  // Valores numéricos (escala)
    }
  },
  categoryComments?: { [category: string]: string },
  evidenceUrls?: string[],
  additionalComments?: string
}
```

**Cálculo de scores:**

- **Por categoría:** Sumatoria de las respuestas de la categoría (no promedio)
- **Score general:** Sumatoria de todos los `categoryScores`

```js
// Ejemplo:
categoryScores = { negocio: 8, marketing: 6, controlStock: 9, ... }
overallScore   = 8 + 6 + 9 + ...   // Suma total
```

**Backward compatibility:** Los datos se guardan tanto en `consultingData` como en `monitoringData` (campo duplicado).

**Efecto colateral:** Incrementa `metadata.totalParticipants` en la actividad.

**Retorna:** `{ id, ...participacion }` del documento creado.

> **Alias:** `submitMonitoring` apunta a la misma función.

---

### 9. `loadUserActivities`

Carga todas las participaciones de un usuario específico en un programa, ordenadas por `submittedAt` desc.

```ts
async function loadUserActivities(
  programId: string,
  userId: string,
): Promise<Participation[]>;
```

**Ruta Firestore:** `programs/{programId}/participations` (filtrado por `userId`)

> No actualiza `participations` en el state; retorna los datos directamente al componente.

---

### 10. `getUserConsultingCount`

Retorna el número total de asesorías completadas por un usuario (considera los tipos `consulting` y `monitoring`).

```ts
async function getUserConsultingCount(
  programId: string,
  userId: string,
): Promise<number>;
```

Ejecuta **dos queries en paralelo** (`Promise.all`) para sumar ambos tipos:

- `activityType == 'consulting' && status == 'completed'`
- `activityType == 'monitoring' && status == 'completed'`

**Retorna:** Total combinado. Retorna `0` si hay error (no lanza).

> **Alias:** `getUserMonitoringCount` apunta a la misma función.

---

### 11. `getUserSessionsAttended`

Retorna el número de sesiones a las que asistió un usuario (con `attendance.attended === true`).

```ts
async function getUserSessionsAttended(
  programId: string,
  userId: string,
): Promise<number>;
```

**Retorna:** Conteo de participaciones. Retorna `0` si hay error (no lanza).

---

### 12. `$reset`

Limpia todo el state del store a sus valores iniciales.

```ts
function $reset(): void;
```

Llamar en logout, al desmontar el layout del facilitador o al cambiar de programa.

---

## Aliases de Compatibilidad

El store exporta varios aliases para mantener compatibilidad con código antiguo que usa el término `monitoring`:

| Nombre exportado         | Apunta a                          |
| ------------------------ | --------------------------------- |
| `monitoringActivities`   | `consultingActivities` (getter)   |
| `submitMonitoring`       | `submitConsulting` (action)       |
| `getUserMonitoringCount` | `getUserConsultingCount` (action) |

> Estos aliases **no deben usarse en código nuevo**. Usar siempre los nombres `consulting`.

---

## Ejemplos de Uso

### Crear una sesión

```js
import { useActivitiesStore } from "@/stores/activitiesStore";

const activitiesStore = useActivitiesStore();

const activity = await activitiesStore.createActivity(programId, {
  type: "session",
  title: "Taller de Marketing Digital",
  description: "Introducción a redes sociales para negocios",
  date: "2026-03-15",
});
```

---

### Crear una asesoría (con config por defecto)

```js
const activity = await activitiesStore.createActivity(programId, {
  type: "consulting",
  title: "Asesoría Mensual - Marzo 2026",
  requiredEvidence: true,
});
// consultingConfig se genera automáticamente con 7 categorías
```

---

### Cargar actividades filtradas por tipo

```js
// Todas las actividades
await activitiesStore.loadActivities(programId);

// Solo sesiones
await activitiesStore.loadActivities(programId, { type: "session" });

// Acceder desde el getter
const sesiones = activitiesStore.sessionActivities;
```

---

### Marcar asistencia

```js
await activitiesStore.markAttendance(
  programId,
  activityId,
  userId,
  {
    userName: "Juan Quispe",
    businessId: "biz-001",
    businessName: "Pollería El Sabor",
  },
  true, // attended
  "Llegó puntual",
);
```

---

### Enviar asesoría con formulario

```js
await activitiesStore.submitConsulting(programId, activityId, {
  userId: "usr-abc",
  userName: "Ana Torres",
  businessId: "biz-001",
  businessName: "Bodega La Esquina",
  modality: "presencial",
  consultingDate: "2026-03-10",
  responses: {
    negocio: { q1: 2, q2: 3, q3: 2 },
    marketing: { q1: 1, q2: 2, q3: 1 },
    controlStock: { q1: 3, q2: 3, q3: 2 },
    // ... resto de categorías
  },
  categoryComments: {
    negocio: "Buen manejo del registro de ventas",
    marketing: "Necesita mejorar presencia en redes",
  },
  additionalComments: "Negocio con potencial de crecimiento.",
});
```

---

### Obtener estadísticas de un participante

```js
const [consultings, sessions] = await Promise.all([
  activitiesStore.getUserConsultingCount(programId, userId),
  activitiesStore.getUserSessionsAttended(programId, userId),
]);

console.log(`Asesorías: ${consultings}, Sesiones: ${sessions}`);
```

---

## Estructura de Datos de Participación

### Participación de Sesión

```js
// programs/{programId}/participations/{participationId}
{
  activityId: string,
  activityType: 'session',
  userId: string,
  userName: string,
  businessId: string,
  businessName: string,
  attendance: {
    attended: boolean,
    markedAt: Timestamp,
    markedBy: string,   // uid del facilitador
    notes: string
  },
  status: 'completed' | 'absent',
  submittedAt: Timestamp
}
```

### Participación de Asesoría

```js
// programs/{programId}/participations/{participationId}
{
  activityId: string,
  activityType: 'consulting',
  userId: string,
  userName: string,
  businessId: string,
  businessName: string,
  consultingData: {
    modality: string,
    consultingDate: string,
    facilitatorId: string,
    responses: { [category]: { [question]: number } },
    categoryComments: { [category]: string },
    categoryScores: { [category]: number },   // Sumatoria por categoría
    overallScore: number,                      // Sumatoria total
    evidenceUrls: string[],
    additionalComments: string
  },
  monitoringData: { /* copia idéntica de consultingData */ },
  status: 'completed',
  submittedAt: Timestamp
}
```

---

## Guías Relacionadas

| Documento                                                           | Descripción                                                                     |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| [`docs/PROGRAM_STORE.md`](./PROGRAM_STORE.md)                       | Documentación del store de programas (gestión de participantes y facilitadores) |
| [`docs/MODULO_JUNTOS_RESUMEN.md`](./MODULO_JUNTOS_RESUMEN.md)       | Checklist completo de implementación del módulo Juntos                          |
| [`docs/MODULO_JUNTOS_DEPLOYMENT.md`](./MODULO_JUNTOS_DEPLOYMENT.md) | Guía de deploy y estructura Firestore                                           |
| [`docs/SETUP_PROGRAMS_GUIDE.md`](./SETUP_PROGRAMS_GUIDE.md)         | Cómo poblar Firestore con datos de prueba                                       |
