# `accountsBalanceStore.js` — Documentación del Store de Balance de Cuentas

**Archivo:** `src/stores/AccountsBalanceApp/accountsBalanceStore.js`
**Store ID:** `accountsBalance`
**Tipo:** Pinia Store (Composition API)
**Módulo:** Balance Financiero — Apertura/Cierre de Caja

---

## Descripción General

El `useAccountsBalanceStore` es el engine de cálculos financieros del sistema de caja empresarial. Implementa una arquitectura **híbrida DailySummary + cálculo manual**:

1. **Prioridad:** Usa `dailySummary` (pre-calculado en backend) si está disponible
2. **Fallback:** Calcula manualmente desde transacciones si `dailySummary` no existe

También construye las transacciones de apertura y cierre de caja.

---

## State

| Propiedad              | Tipo                | Descripción                              |
| ---------------------- | ------------------- | ---------------------------------------- |
| `transactions`         | `Ref<Array>`        | Transacciones del día para cálculos      |
| `openingTransaction`   | `Ref<Object\|null>` | Transacción de apertura del día          |
| `dailySummary`         | `Ref<Object\|null>` | Resumen diario pre-calculado del backend |
| `isLoadingFromSummary` | `Ref<Boolean>`      | Cargando el dailySummary                 |
| `summaryLoadError`     | `Ref<String\|null>` | Error al cargar dailySummary             |

---

## Getters (Computed)

### Ingresos

| Getter          | Descripción               |
| --------------- | ------------------------- |
| `totalIngresos` | Total de ingresos del día |
| `ingresosCash`  | Ingresos en efectivo      |
| `ingresosBank`  | Ingresos bancarios        |

### Egresos

| Getter         | Descripción             |
| -------------- | ----------------------- |
| `totalEgresos` | Total de gastos del día |
| `egresosCash`  | Gastos en efectivo      |
| `egresosBank`  | Gastos bancarios        |

### Transferencias

| Getter                       | Descripción                       |
| ---------------------------- | --------------------------------- |
| `totalTransferencias`        | Total transferido                 |
| `transferenciasSalidaCash`   | Transferencias salida de efectivo |
| `transferenciasEntradaCash`  | Transferencias entrada a efectivo |
| `transferenciasSalidaBank`   | Transferencias salida bancario    |
| `transferenciasEntradaBank`  | Transferencias entrada bancario   |
| `efectoTransferenciasEnCash` | Efecto neto en efectivo           |
| `efectoTransferenciasEnBank` | Efecto neto en banco              |

### Saldos

| Getter               | Descripción                        |
| -------------------- | ---------------------------------- |
| `saldoInicial`       | Saldo al inicio del día (apertura) |
| `saldoInicialCash`   | Saldo inicial en efectivo          |
| `saldoInicialBank`   | Saldo inicial bancario             |
| `saldoActual`        | Saldo actual del día               |
| `saldoActualCash`    | Saldo actual en efectivo           |
| `saldoActualBank`    | Saldo actual bancario              |
| `expectedFinalCash`  | Balance final esperado en efectivo |
| `expectedFinalBank`  | Balance final esperado en banco    |
| `expectedFinalTotal` | Balance final esperado total       |

### Resultados

| Getter                 | Descripción                         |
| ---------------------- | ----------------------------------- |
| `resultadoOperacional` | Resultado neto del día              |
| `flujoNetoCash`        | Flujo neto en efectivo              |
| `flujoNetoBank`        | Flujo neto bancario                 |
| `financialSummary`     | Resumen financiero completo del día |

### Validaciones

| Getter            | Descripción                     |
| ----------------- | ------------------------------- |
| `hasOpening`      | Si hay apertura de caja         |
| `hasTransactions` | Si hay transacciones            |
| `hasActivity`     | Si hay actividad financiera     |
| `hasDailySummary` | Si el dailySummary está cargado |

---

## Actions

### Carga de datos (DailySummary)

| Action                                        | Descripción                                     |
| --------------------------------------------- | ----------------------------------------------- |
| `loadFromDailySummary(summary)`               | Carga datos desde un dailySummary existente     |
| `loadDailySummary(businessId, date)`          | Carga el dailySummary desde Firestore           |
| `forceReloadSummary(businessId, date)`        | Fuerza recarga del dailySummary                 |
| `startDailySummaryListener(businessId, date)` | Inicia listener en tiempo real del dailySummary |
| `stopDailySummaryListener()`                  | Detiene el listener en tiempo real              |

### Setters

| Action                             | Descripción                                       |
| ---------------------------------- | ------------------------------------------------- |
| `setTransactions(transactions)`    | Establece las transacciones y detecta la apertura |
| `setOpening(opening)`              | Establece la transacción de apertura              |
| `updateTransactions(transactions)` | Actualiza las transacciones en el store           |
| `reset()`                          | Resetea el store a su estado inicial              |

### Constructores de transacciones

| Action                          | Descripción                                            |
| ------------------------------- | ------------------------------------------------------ |
| `buildOpeningTransaction(data)` | Construye la estructura de una transacción de apertura |
| `buildOpeningAdjustments(data)` | Construye los ajustes de apertura                      |
| `buildClosureTransaction(data)` | Construye la estructura de una transacción de cierre   |
| `buildClosureAdjustments(data)` | Construye los ajustes de cierre                        |

### Utilidades

| Action                                | Descripción                                      |
| ------------------------------------- | ------------------------------------------------ |
| `calculateDifference(expected, real)` | Calcula diferencia entre balance esperado y real |
| `isSignificantDifference(difference)` | Verifica si la diferencia supera un umbral       |

### Ajustes

| Getter                         | Descripción            |
| ------------------------------ | ---------------------- |
| `ajustesAperturaCash/Bank`     | Ajustes en la apertura |
| `ajustesCierreCash/Bank`       | Ajustes en el cierre   |
| `totalAjustes/Apertura/Cierre` | Totales de ajustes     |

---

## Uso en Componentes

- `NavigationBtnsAccountsBalance.vue`
- `StepBankBalance.vue`
- `StepCashBalance.vue`
- `StepLastReference.vue`
- `AccountsReceivablePanel.vue`
- `CashFlowWidget.vue`
- `ResumenDay.vue`
- `NavigationBtnProductDetails.vue`
- `StepAddExpenseDetails.vue`
- `StepTransferDetails.vue`
- `AccountBalanceAppWrapper.vue`
- `AccountsReceivable.vue` (vista)

---

## Changelog

### [Creado - Auditoría Marzo 2026]

- Documentación inicial creada en auditoría de código fuente.
- Store verificado como activo en producción con listener en tiempo real.
