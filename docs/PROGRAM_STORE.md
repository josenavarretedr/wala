# `programStore.js` — Documentación del Módulo Juntos

**Archivo:** `src/stores/programStore.js`  
**Store ID:** `program`  
**Tipo:** Pinia Store (Composition API)  
**Módulo:** Juntos — Programas de Acompañamiento Empresarial

---

## Tabla de Contenidos

1. [Descripción General](#descripción-general)
2. [Dependencias e Imports](#dependencias-e-imports)
3. [Arquitectura Firestore](#arquitectura-firestore)
4. [State](#state)
5. [Getters](#getters)
6. [Actions](#actions)
   - [loadActivePrograms](#1-loadactiveprograms)
   - [loadProgram](#2-loadprogram)
   - [loadCurrentProgram](#3-loadcurrentprogram)
   - [joinProgramByCode](#4-joinprogrambycode)
   - [joinProgramAsFacilitator](#5-joinprogramasfacilitator)
   - [leaveProgram](#6-leaveprogram)
   - [loadAssessments](#7-loadassessments)
   - [submitAssessment](#8-submitassessment)
   - [loadFacilitatorPrograms](#9-loadfacilitatorprograms)
   - [loadProgramParticipants](#10-loadprogramparticipants)
   - [loadParticipantDetail](#11-loadparticipantdetail)
   - [clearProgramData](#12-clearprogramdata)
7. [Composable `usePrograms`](#composable-useprograms)
8. [Ejemplos de Uso](#ejemplos-de-uso)
9. [Flujo de Unión a un Programa](#flujo-de-unión-a-un-programa)
10. [Roles y Permisos](#roles-y-permisos)
11. [Guías Relacionadas](#guías-relacionadas)

---

## Descripción General

`useProgramStore` gestiona el ciclo de vida completo de los **Programas de Acompañamiento Empresarial** (Módulo "Juntos"). Permite que ONGs, municipalidades u otras organizaciones acompañen a negocios sin acceder a sus datos financieros sensibles.

Existen dos roles dentro de un programa:

| Rol           | Descripción                                                          |
| ------------- | -------------------------------------------------------------------- |
| `participant` | Negocio (gerente) inscrito al programa vía código `codUser`          |
| `facilitator` | Persona de la organización que hace seguimiento vía código `codTeam` |

Todo acceso a Firestore se realiza **directamente desde el cliente** (no usa Cloud Functions).

---

## Dependencias e Imports

```js
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import {} from /* Firestore SDK */ "firebase/firestore";
import { db } from "@/firebaseInit";
import { useAuthStore } from "./authStore";
import { useUserStore } from "./useUserStore";
```

| Dependencia    | Uso                                                                   |
| -------------- | --------------------------------------------------------------------- |
| `useAuthStore` | Obtener `user.uid` y `user.email` del usuario autenticado             |
| `useUserStore` | Obtener `currentBusiness.businessId`, `userBusinesses`, `userProfile` |
| `db`           | Instancia de Firestore                                                |

---

## Arquitectura Firestore

```
/programs/{programId}
├── (doc raíz: name, organizationName, isActive, codUser, codTeam, metadata, members[], ...)
├── /participants/{userId}         ← Inscripción del participante (nueva estructura)
├── /facilitators/{userId}         ← Inscripción del facilitador (nueva estructura)
└── /memberships/{businessId}      ← Datos de afiliación + evaluaciones
    └── /assessments/{assessmentId}

/businesses/{businessId}
└── programs: string[]             ← Array de programIds a los que pertenece el negocio
```

> **Nota de migración:** La estructura antigua usaba un array `members[]` dentro del doc raíz del programa. La nueva estructura usa las subcolecciones `participants/` y `facilitators/`. Algunas acciones (como `loadProgramParticipants`) aún leen el array `members[]` ya que los datos históricos permanecen ahí.

---

## State

```ts
const activePrograms = ref([]); // Lista de programas activos del usuario
const currentProgram = ref(null); // Programa actualmente visualizado
const currentProgramAssessments = ref([]); // Evaluaciones del programa actual
const loading = ref(false);
const error = ref(null);
```

| Propiedad                   | Tipo              | Descripción                                                                   |
| --------------------------- | ----------------- | ----------------------------------------------------------------------------- |
| `activePrograms`            | `Program[]`       | Programas activos para el negocio actual (participante) o para el facilitador |
| `currentProgram`            | `Program \| null` | Programa cargado para vista de detalle. Incluye `membership` si existe        |
| `currentProgramAssessments` | `Assessment[]`    | Evaluaciones del negocio en el programa actual, ordenadas por fecha desc      |
| `loading`                   | `boolean`         | `true` mientras hay operaciones async en curso                                |
| `error`                     | `string \| null`  | Mensaje del último error ocurrido                                             |

---

## Getters

### `hasActiveProgram`

```ts
computed(() => activePrograms.value.length > 0): boolean
```

Retorna `true` si el usuario tiene al menos un programa activo. Usado para mostrar el badge verde en el ícono "Juntos" del `MainLayout`.

---

### `isParticipant`

```ts
computed(() => currentProgram.value?.membership?.status === 'active'): boolean
```

Retorna `true` si el negocio actual tiene una membresía `active` en el `currentProgram`.

---

### `currentProgramName`

```ts
computed(() => currentProgram.value?.name || ''): string
```

---

### `currentProgramOrganization`

```ts
computed(() => currentProgram.value?.organizationName || ''): string
```

---

## Actions

### 1. `loadActivePrograms`

Carga los programas activos del negocio actual leyendo el array `programs[]` del documento `businesses/{businessId}`.

```ts
async function loadActivePrograms(): Promise<void>;
```

**Precondiciones:**

- `authStore.user.uid` disponible
- `userStore.currentBusiness.businessId` disponible

**Flujo interno:**

1. Lee `businesses/{businessId}` → extrae el array `programs[]`
2. Por cada `programId`, lee `programs/{programId}`
3. Filtra los que tienen `isActive !== false`
4. Busca la `memberInfo` del usuario en el array `members[]` del programa
5. Asigna `activePrograms.value`

**Efecto en state:** Actualiza `activePrograms`, `loading`, `error`.

---

### 2. `loadProgram`

Carga el detalle completo de un programa específico e intenta cargar su membresía.

```ts
async function loadProgram(programId: string): Promise<Program>;
```

**Parámetros:**

| Nombre      | Tipo     | Descripción                     |
| ----------- | -------- | ------------------------------- |
| `programId` | `string` | ID del documento en `/programs` |

**Flujo interno:**

1. Lee `programs/{programId}`
2. Si hay `currentBusiness`, intenta leer `programs/{programId}/memberships/{businessId}`
3. Si existe membresía, la adjunta como `programData.membership`
4. Asigna `currentProgram.value`

**Efecto en state:** Actualiza `currentProgram`, `loading`, `error`.

**Lanza:** `Error('Programa no encontrado')` si el doc no existe.

---

### 3. `loadCurrentProgram`

Versión simplificada de `loadProgram`, usada por `FacilitatorLayout`. No carga membresía.

```ts
async function loadCurrentProgram(programId: string): Promise<void>;
```

**Efecto en state:** Actualiza `currentProgram`, `loading`, `error`.

---

### 4. `joinProgramByCode`

Inscribe el negocio actual en un programa como **participante** usando el código `codUser`.

```ts
async function joinProgramByCode(code: string): Promise<JoinResult>;
```

**Parámetros:**

| Nombre | Tipo     | Descripción                                                            |
| ------ | -------- | ---------------------------------------------------------------------- |
| `code` | `string` | Código de invitación para participantes (campo `codUser` del programa) |

**Precondiciones:**

- `code` no vacío
- `authStore.user.uid` disponible
- `userStore.currentBusiness` disponible
- El usuario debe tener `rol === 'gerente'` en el business actual

**Flujo interno:**

1. Verifica que el usuario sea `gerente` del negocio
2. Busca en `/programs` por `codUser == codeUpper && isActive == true`
3. Verifica si ya existe un doc en `programs/{programId}/participants/{userId}`
   - Si existe y `status === 'active'` → lanza error
   - Si existe con otro status → reactiva
4. Crea/actualiza `programs/{programId}/participants/{userId}` con `setDoc(..., { merge: true })`
5. Incrementa `metadata.totalParticipants` en el doc del programa
6. Agrega `programId` al array `businesses/{businessId}.programs` (con `arrayUnion`)
7. Llama `loadActivePrograms()` para refrescar state

**Retorna:**

```ts
{
  success: true,
  programId: string,
  programName: string,
  organizationName: string
}
```

**Lanza:** `Error` con mensaje legible en caso de fallo.

**Estructura creada en Firestore:**

```js
// programs/{programId}/participants/{userId}
{
  userId, userEmail, userName,
  businessId, businessName,
  role: 'participant',
  status: 'active',
  joinedAt: serverTimestamp(),
  currentPhase: 'baseline',
  metadata: {
    totalActivitiesCompleted: 0,
    lastActivityAt: null,
    progressPercentage: 0,
    attendanceRate: 0
  }
}
```

---

### 5. `joinProgramAsFacilitator`

Inscribe al usuario como **facilitador** de un programa usando el código `codTeam`.

```ts
async function joinProgramAsFacilitator(code: string): Promise<JoinResult>;
```

**Parámetros:**

| Nombre | Tipo     | Descripción                                          |
| ------ | -------- | ---------------------------------------------------- |
| `code` | `string` | Código de facilitador (campo `codTeam` del programa) |

**Precondiciones:**

- `code` no vacío
- `authStore.user.uid` disponible

**Flujo interno:**

1. Busca en `/programs` por `codTeam == codeUpper && isActive == true`
2. Verifica si ya existe en `programs/{programId}/facilitators/{userId}`
3. Crea/actualiza el doc en `facilitators/{userId}` con `setDoc(..., { merge: true })`
4. Incrementa `metadata.totalFacilitators`
5. Llama `loadFacilitatorPrograms()` para refrescar state

**Estructura creada en Firestore:**

```js
// programs/{programId}/facilitators/{userId}
{
  userId, userEmail, userName,
  role: 'facilitator',
  status: 'active',
  joinedAt: serverTimestamp(),
  permissions: {
    canCreateActivities: true,
    canGradeActivities: true,
    canManageParticipants: true
  }
}
```

---

### 6. `leaveProgram`

Realiza el **opt-out** del programa para el negocio actual. Marca la membresía como `'left'`.

```ts
async function leaveProgram(programId: string): Promise<void>;
```

**Precondiciones:**

- `userStore.currentBusiness.businessId` disponible

**Flujo interno:**

1. Actualiza `programs/{programId}/memberships/{businessId}` → `{ status: 'left', leftAt: now }`
2. Actualiza `users/{uid}/programs/{programId}` → `{ status: 'left', leftAt: now }`
3. Llama `loadActivePrograms()`
4. Si `currentProgram.id === programId`, limpia `currentProgram` y `currentProgramAssessments`

> **Nota:** No elimina ningún documento, solo cambia el `status` a `'left'` para permitir reactivación futura.

---

### 7. `loadAssessments`

Carga las evaluaciones del negocio actual en un programa, ordenadas por `submittedAt` descending.

```ts
async function loadAssessments(programId: string): Promise<Assessment[]>;
```

**Precondiciones:**

- `userStore.currentBusiness.businessId` disponible

**Ruta Firestore:** `programs/{programId}/memberships/{businessId}/assessments`

**Efecto en state:** Actualiza `currentProgramAssessments`.

---

### 8. `submitAssessment`

Guarda una nueva evaluación para el negocio actual en un programa.

```ts
async function submitAssessment(
  programId: string,
  assessmentData: object,
): Promise<string>;
```

**Parámetros:**

| Nombre           | Tipo     | Descripción                                              |
| ---------------- | -------- | -------------------------------------------------------- |
| `programId`      | `string` | ID del programa                                          |
| `assessmentData` | `object` | Datos de la evaluación (campos libres según el programa) |

**Ruta Firestore:** `programs/{programId}/memberships/{businessId}/assessments` (nueva doc)

Los campos `submittedBy` (uid) y `submittedAt` (serverTimestamp) se añaden automáticamente.

**Retorna:** el `id` del documento creado.

**Efecto en state:** Llama `loadAssessments` internamente para refrescar `currentProgramAssessments`.

---

### 9. `loadFacilitatorPrograms`

Carga todos los programas donde el usuario autenticado es **facilitador activo**.

```ts
async function loadFacilitatorPrograms(): Promise<void>;
```

**Flujo interno:**

1. Obtiene todos los programas con `isActive != false`
2. Por cada uno, verifica si existe `programs/{programId}/facilitators/{userId}` con `status === 'active'`
3. Los que cumplen la condición se adjuntan con `facilitatorInfo`

**Efecto en state:** Actualiza `activePrograms` (comparte el mismo ref que el flujo de participantes).

> **Rendimiento:** Realiza N lecturas de Firestore (una por programa global). Puede optimizarse con un índice en la colección de facilitadores si el número de programas crece.

---

### 10. `loadProgramParticipants`

Obtiene la lista enriquecida de participantes de un programa. **Para uso de facilitadores.**

```ts
async function loadProgramParticipants(
  programId: string,
): Promise<Participant[]>;
```

**Flujo interno:**

1. Lee el doc del programa y extrae el array `members[]` filtrado a `role === 'participant'`
2. Por cada participante:
   - Lee `businesses/{businessId}` → datos del negocio
   - Lee `programs/{programId}/memberships/{businessId}/assessments` → conteo y scores
   - Lee `users/{userId}` → nombre del gerente
3. Calcula `progress` y `score` promedio

**Retorna:** Array de objetos `Participant` con campos:

```ts
{
  (id,
    businessId,
    businessName,
    businessType,
    managerName,
    managerEmail,
    managerId,
    status,
    joinedAt,
    leftAt,
    currentPhase,
    totalAssessments,
    score,
    progress);
}
```

> **Nota:** No actualiza `activePrograms` ni `currentProgram`. Los datos se retornan directamente al componente que llama la función.

---

### 11. `loadParticipantDetail`

Carga el detalle completo de un participante específico incluyendo historial de evaluaciones. **Para uso de facilitadores.**

```ts
async function loadParticipantDetail(
  programId: string,
  businessId: string,
): Promise<ParticipantDetail>;
```

**Retorna:**

```ts
{
  membership: { id: businessId, ...memberData },
  business:   { id: businessId, ...businessDetails },
  manager:    { id: userId, ...managerDetails },
  assessments: Assessment[]  // ordenadas por submittedAt desc
}
```

**Lanza:**

- `Error('Programa no encontrado')`
- `Error('Participante no encontrado en el programa')`

---

### 12. `clearProgramData`

Limpia todo el estado del store. Llamar en el ciclo de vida de limpieza (logout, cambio de negocio, etc.).

```ts
function clearProgramData(): void;
```

Resetea `activePrograms`, `currentProgram`, `currentProgramAssessments` y `error` a sus valores iniciales.

---

## Composable `usePrograms`

**Archivo:** [`src/composables/usePrograms.js`](../src/composables/usePrograms.js)

Wrapper ligero sobre `useProgramStore` que expone la API simplificada para los componentes Vue. **Preferir este composable** en vez de acceder al store directamente desde las vistas.

```js
import { usePrograms } from "@/composables/usePrograms";

const {
  // State (computed readonly)
  activePrograms,
  currentProgram,
  currentProgramAssessments,
  loading,
  error,
  isParticipant,
  hasActiveProgram,
  canAccessPrograms, // computed: !!userStore.currentBusinessId
  canJoinPrograms, // computed: rol === 'gerente'

  // Métodos
  loadPrograms,
  loadProgram,
  joinByCode,
  joinAsFacilitator,
  leaveProgram, // incluye confirm() nativo del navegador
  loadAssessments,
  submitAssessment,
  loadParticipants,
  loadParticipantDetail,
} = usePrograms();
```

> `leaveProgram` en el composable incluye un `confirm()` del navegador. Si necesitas un modal personalizado, llama `programStore.leaveProgram(id)` directamente.

---

## Ejemplos de Uso

### Cargar programas activos al montar

```vue
<script setup>
import { onMounted } from "vue";
import { usePrograms } from "@/composables/usePrograms";

const { activePrograms, loading, loadPrograms } = usePrograms();

onMounted(() => loadPrograms());
</script>
```

---

### Unirse a un programa por código

```vue
<script setup>
import { ref } from "vue";
import { usePrograms } from "@/composables/usePrograms";

const { joinByCode, loading, error } = usePrograms();
const code = ref("");

async function handleJoin() {
  try {
    const result = await joinByCode(code.value);
    console.log(`Unido a: ${result.programName}`);
  } catch (e) {
    // error.value ya tiene el mensaje
  }
}
</script>
```

---

### Guardar una evaluación

```js
const { submitAssessment } = usePrograms();

await submitAssessment(programId, {
  score: 3,
  comments: "Excelente progreso este mes",
  phase: "growth",
});
```

---

### Vista de facilitador — listar participantes

```js
import { useProgramStore } from "@/stores/programStore";

const programStore = useProgramStore();

const participants = await programStore.loadProgramParticipants(programId);
```

---

## Flujo de Unión a un Programa

```
1. Gerente del negocio ingresa código en JoinProgramModal
   ↓
2. joinProgramByCode(code) verifica:
   - rol === 'gerente'
   - código válido (codUser) en /programs activo
   - no inscrito previamente
   ↓
3. Crea doc en programs/{programId}/participants/{userId}
   ↓
4. Incrementa metadata.totalParticipants
   ↓
5. Agrega programId a businesses/{businessId}.programs[]
   ↓
6. loadActivePrograms() refresca el state
   ↓
7. MainLayout muestra badge verde en ícono "Juntos"
```

---

## Roles y Permisos

| Acción                      | Participante (gerente) | Participante (empleado) | Facilitador |
| --------------------------- | :--------------------: | :---------------------: | :---------: |
| Ver lista de programas      |           ✅           |      ✅ (solo ver)      |     ✅      |
| Unirse por código           |           ✅           |           ❌            |      —      |
| Unirse como facilitador     |           —            |            —            |     ✅      |
| Ver detalle del programa    |           ✅           |           ✅            |     ✅      |
| Enviar evaluaciones         |           ✅           |           ❌            |     ❌      |
| Ver participantes           |           ❌           |           ❌            |     ✅      |
| Ver detalle de participante |           ❌           |           ❌            |     ✅      |
| Salir del programa          |           ✅           |           ❌            |      —      |

> La validación de rol `gerente` se realiza en `joinProgramByCode` comparando contra `userStore.userBusinesses`.

---

## Guías Relacionadas

| Documento                                                           | Descripción                                                        |
| ------------------------------------------------------------------- | ------------------------------------------------------------------ |
| [`docs/MODULO_JUNTOS_RESUMEN.md`](./MODULO_JUNTOS_RESUMEN.md)       | Checklist completo de implementación del módulo                    |
| [`docs/MODULO_JUNTOS_DEPLOYMENT.md`](./MODULO_JUNTOS_DEPLOYMENT.md) | Pasos de deploy, estructura Firestore manual y reglas de seguridad |
| [`docs/SETUP_PROGRAMS_GUIDE.md`](./SETUP_PROGRAMS_GUIDE.md)         | Cómo poblar Firestore con datos de prueba del módulo               |
