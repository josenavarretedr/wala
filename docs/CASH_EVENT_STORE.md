# `cashEventStore.js` — Documentación del Store de Eventos de Caja

**Archivo:** `src/stores/cashEventStore.js`
**Tipo:** Composable Store (no Pinia, exportado como función)
**Módulo:** Apertura y Cierre de Caja

---

## ⚠️ Nota Importante

Este store es un **composable-style store** (no usa `defineStore`). Define variables **module-level** reactivas accesibles vía `useCashEventStore()`.

---

## Descripción General

Gestiona los **eventos de caja**: apertura (inicio del día) y cierre (fin del día). Calcula los balances esperados vs reales y registra diferencias. Trabaja en conjunto con `useCashEvent` (composable Firestore) y `useDailySummary` (composable de resumen).

---

## State (Module-Level)

| Variable             | Tipo                | Descripción                               |
| -------------------- | ------------------- | ----------------------------------------- |
| `cashEventsForToday` | `Ref<Array>`        | Eventos de caja del día actual            |
| `allCashEvents`      | `Ref<Array>`        | Todos los eventos de caja del negocio     |
| `expectedBalances`   | `Ref<{cash, bank}>` | Balances esperados calculados             |
| `realBalances`       | `Ref<{cash, bank}>` | Balances reales ingresados por el usuario |
| `differences`        | `Ref<{cash, bank}>` | Diferencias entre esperado y real         |
| `isProcessingCash`   | `Ref<Boolean>`      | Indicador de operación en progreso        |
| `cashEventToAdd`     | `Ref<Object>`       | Evento de caja en construcción            |

### Estructura de `cashEventToAdd`

```javascript
{
  uuid: null,
  date: null,
  type: null,       // 'opening' | 'closure'
  accounts: [],
  status: null,
  notes: null,
}
```

---

## Getters (Computed)

| Getter                | Descripción                                       |
| --------------------- | ------------------------------------------------- |
| `expectedCashBalance` | Balance de efectivo esperado                      |
| `expectedBankBalance` | Balance bancario esperado                         |
| `cashDifference`      | Diferencia en efectivo                            |
| `bankDifference`      | Diferencia bancaria                               |
| `cashEventDataToSave` | Datos del evento listos para guardar              |
| `eventAccounts`       | Cuentas del evento en construcción                |
| `streakCashEvents`    | Eventos para cálculo de streak                    |
| `hasClosureForToday`  | Si ya existe un cierre para el día actual         |
| `saldoInicial`        | `{cash, bank}` calculado desde la apertura de hoy |

---

## Actions

| Action                            | Descripción                                                     |
| --------------------------------- | --------------------------------------------------------------- |
| `startCashEventProcess()`         | Inicia el proceso de evento de caja                             |
| `setRealBalance(account, amount)` | Establece el balance real para una cuenta                       |
| `calculateDifferences()`          | Calcula las diferencias entre balances esperados y reales       |
| `performCashEvent()`              | Ejecuta el evento de caja (abre o cierra) y guarda en Firestore |
| `resetCashEventState()`           | Resetea el estado del evento en construcción                    |
| `getCashEventForToday()`          | Carga los eventos de caja del día actual                        |
| `getAllCashEvents()`              | Carga todos los eventos de caja del negocio                     |
| `calcularSaldoInicial()`          | Calcula el saldo inicial desde la apertura del día              |

---

## Uso en Componentes

- `CajaDiaria.vue`
- `ClashClosureBtn.vue`
- `MonthlyCashCalendar.vue`
- `RecordsDetails.vue` (vista)
- `CashClosureApp.vue` (vista)
- `CashClosureDetails.vue` (vista)

---

## Changelog

### [Creado - Auditoría Marzo 2026]

- Documentación inicial creada en auditoría de código fuente.
- Store verificado como activo en producción.
