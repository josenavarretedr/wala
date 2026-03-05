# `useSavingsStore.js` — Documentación del Store de Ahorros

**Archivo:** `src/stores/useSavingsStore.js`
**Store ID:** `savings`
**Tipo:** Pinia Store (Composition API)
**Módulo:** Ahorros (módulo sin uso activo en producción)

---

## ⚠️ Estado del Store

> **Nota de Auditoría (Marzo 2026):** Este store está **definido y compilado**, pero **no se encontraron llamadas a `useSavingsStore()`** en ningún componente `.vue` ni composable activo del proyecto. Podría ser parte de una funcionalidad futura o un módulo deshabilitado.

---

## Descripción General

El `useSavingsStore` gestiona solicitudes y registros de ahorro de usuarios. Se conecta con Firestore para suscripciones en tiempo real.

---

## State

| Propiedad                | Tipo          | Descripción                       |
| ------------------------ | ------------- | --------------------------------- |
| `savings`                | `Ref<Array>`  | Lista de registros de ahorro      |
| `savingsRequestsDetails` | `Ref<Object>` | Detalles de solicitudes de ahorro |

---

## Actions

| Action                               | Descripción                                          |
| ------------------------------------ | ---------------------------------------------------- |
| `subscribeToSavings(userId)`         | Suscripción en tiempo real a los ahorros del usuario |
| `getUserSavingsToStore(userId)`      | Carga los ahorros del usuario desde Firestore        |
| `getApprovedSavingsRequests(userId)` | Obtiene solicitudes aprobadas                        |
| `resetSavingRequestsDetails()`       | Resetea `savingsRequestsDetails`                     |
| `resetStore()`                       | Resetea todo el estado del store                     |

---

## Uso en Componentes

**Ninguno** — este store no está siendo consumido en ningún componente activo.

---

## Changelog

### [Creado - Auditoría Marzo 2026]

- Documentación inicial creada en auditoría de código fuente.
- Marcado como sin uso activo en componentes. Funcionalidad pendiente o deshabilitada.
