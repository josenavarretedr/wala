# 📋 Sistema de Expedientes de Consultoría (Consulting Dossiers)

**Última actualización:** 6 de mayo de 2026
**Versión:** 1.0.0
**Estado:** ✅ Activo

---

## 📋 Descripción General

Sistema para gestionar **expedientes de consultoría empresarial** dentro del módulo Juntos. Cada participante de un programa tiene un expediente que rastrea su progreso a través de sesiones diagnósticas (S0), ciclos de consultoría (C1-C3) y evaluación final.

### Arquitectura

```
┌────────────────────────────────────────────┐
│ Firestore: programs/{id}/consultingDossiers│
└───────────────────┬────────────────────────┘
                    ↓
┌────────────────────────────────────────────┐
│ consultingDossierStore.js (Pinia)          │
│ → CRUD, transiciones de estado, ciclos     │
└───────────────────┬────────────────────────┘
                    ↓
┌────────────────────────────────────────────┐
│ useConsultingDossiers.js (Composable)      │
│ → Wrapper simplificado                     │
└───────────────────┬────────────────────────┘
                    ↓
┌────────────────────────────────────────────┐
│ Vistas del facilitador                     │
└────────────────────────────────────────────┘
```

| Archivo | Tipo | Ubicación |
|---------|------|-----------|
| `consultingDossierStore.js` | Store Pinia (Composition) | `src/stores/consultingDossierStore.js` |
| `useConsultingDossiers.js` | Composable wrapper | `src/composables/useConsultingDossiers.js` |
| `useConsultingMetrics.js` | Métricas derivadas | `src/composables/useConsultingMetrics.js` |

---

## 💾 Estructura Firestore

### Path: `programs/{programId}/consultingDossiers/{dossierId}`

```javascript
{
  participantId: 'user-uid',
  participantName: 'Juan Pérez',
  businessId: 'business-uuid',
  businessName: 'Mi Negocio',
  facilitatorId: 'facilitator-uid',
  createdBy: 'facilitator-uid',
  isActive: true,
  currentStep: 's0_in_progress',  // Ver tabla de pasos
  riskLevel: 'low',               // 'low' | 'medium' | 'high'

  timeline: [
    { step: 's0_in_progress', changedBy: 'uid', changedAt: Timestamp }
  ],

  metrics: {
    completionRate: 0,
    scoreDelta: 0,
    stagnation: false
  },

  stageData: {
    s0: {                          // Sesión diagnóstica
      completed: false,
      entrepreneurNotes: '',
      criticalAreas: [],
      preScore: null,
      assessment: { /* 7 áreas × 3 indicadores */ }
    },
    c1: { completed: false, planActions: [], followUp: [] },
    c2: { completed: false, planActions: [], followUp: [] },
    c3: { completed: false, planActions: [], followUp: [] },
    programConsultingDossier: {
      diagnosticScores: {},
      criticalAreas: [],
      consultingCycles: [ /* c1, c2, c3 normalizados */ ],
      finalEvaluationByArea: {},
      closingSummary: {},
      cycleMetadata: { currentCycleKey, isFullyCompleted, ... }
    }
  },

  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

---

## 🔄 Flujo de Pasos (Steps)

| Step | Label | Significado |
|------|-------|-------------|
| `s0_in_progress` | S0 en progreso | Sesión diagnóstica iniciada |
| `s0_completed` | S0 completada | Diagnóstico terminado |
| `c1_in_progress` | Ciclo 1 en progreso | Primer ciclo de consultoría |
| `s1_completed` | Sesión 1 completada | Primera sesión del C1 |
| `c1_completed` | Ciclo 1 completado | C1 finalizado |
| `c2_in_progress` | Ciclo 2 en progreso | Segundo ciclo |
| `s3_completed` | Sesión 3 completada | Sesión del C2 |
| `c2_completed` | Ciclo 2 completado | C2 finalizado |
| `c3_in_progress` | Ciclo 3 en progreso | Tercer ciclo |
| `s5_completed` | Sesión 5 completada | Sesión del C3 |
| `s6_completed` | Evaluación final | Evaluación de cierre |
| `closed` | Expediente cerrado | Proceso completado |

---

## 📊 Evaluación Wala (7 áreas × 3 indicadores)

| Área | Indicadores |
|------|-------------|
| **Negocios y familia** | Se paga un salario, Paga salario a familiares, No retira dinero sin control |
| **Marketing** | Conoce clientes, Promueve el negocio, Comercializa competitivamente |
| **Compras** | Cotizaciones de proveedores, Verifica bienes, Planifica volumen |
| **Control de stock** | Registros actualizados, Renovación regular, Evita sobre/sub-stock |
| **Costeo** | Materiales directos, Mano de obra directa, Costos indirectos |
| **Registros** | Libros actualizados, Cuentas de clientes, Ganancias/pérdidas |
| **Planificación** | Proyecta ventas/costos, Planifica flujo de caja, Sigue plan de negocio |

---

## 🧩 API del Store

**Store ID:** `consultingDossier`

### State

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `dossiers` | `Object[]` | Lista de expedientes cargados |
| `currentDossier` | `Object \| null` | Expediente individual cargado |
| `loading` | `boolean` | Flag de carga |
| `error` | `string \| null` | Último error |

### Getters

| Getter | Retorno | Descripción |
|--------|---------|-------------|
| `activeDossiers` | `Object[]` | Solo expedientes con `isActive: true` |
| `dossiersByParticipant` | `Object` | Mapa `{ participantId: dossier }` |

### Actions principales

| Action | Firma | Descripción |
|--------|-------|-------------|
| `loadProgramDossiers(programId)` | `Promise<Object[]>` | Carga todos los expedientes de un programa |
| `loadDossier(programId, dossierId)` | `Promise<Object>` | Carga expediente individual |
| `createDossier(programId, participant)` | `Promise<Object>` | Crea expediente (idempotente por participante) |
| `updateDossierStep(programId, dossierId, nextStep)` | `Promise<void>` | Cambia paso con timeline |
| `saveS0Assessment(programId, dossierId, payload)` | `Promise<void>` | Guarda evaluación diagnóstica S0 |
| `saveProgramConsultingDossier(programId, dossierId, payload)` | `Promise<void>` | Guarda ciclos, evaluación final, cierre |
| `markCycleCompleted(programId, dossierId, cycleKey)` | `Promise<Object>` | Marca ciclo como completado (solo facilitador) |
| `reopenCycleWithCascade(programId, dossierId, cycleKey)` | `Promise<Object>` | Reabre ciclo + dependientes (c1→c2→c3) |

### Helpers exportados

| Función | Descripción |
|---------|-------------|
| `getStepLabel(step)` | Label legible de un paso |
| `getAllowedStepTransitions(step)` | Pasos válidos para transición |
| `CONSULTING_DOSSIER_STEPS` | Array ordenado de todos los pasos |
| `CONSULTING_DOSSIER_STEP_LABELS` | Mapa step→label |
| `WALA_EVALUATION_TEMPLATE` | Template de las 7 áreas de evaluación |

---

## 🔐 Reglas de negocio

1. **Idempotencia**: `createDossier` verifica si ya existe un expediente activo para el participante antes de crear uno nuevo.
2. **Solo facilitador**: `markCycleCompleted` y `reopenCycleWithCascade` validan que el usuario sea el `facilitatorId` asignado.
3. **Cascade en reapertura**: Reabrir C1 reabre automáticamente C2 y C3. Reabrir C2 reabre C3.
4. **Timeline inmutable**: Cada cambio de paso agrega una entrada al array `timeline` (vía `arrayUnion`).

---

## Changelog

### [v1.0.0 - Mayo 2026]
- Creación inicial del documento basado en auditoría de código fuente (931 líneas).
- Documentado: store, steps, evaluación, ciclos y reglas de negocio.
