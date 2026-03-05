# `transactionFlowStore.js` — Documentación del Store de Flujo de Transacción

**Archivo:** `src/stores/transaction/transactionFlowStore.js`
**Store ID:** `transactionFlow`
**Tipo:** Pinia Store (Options API)
**Módulo:** Wizard de Creación de Transacciones

---

## Descripción General

El `useTransactionFlowStore` gestiona la navegación wizard del flujo de creación de transacciones. Controla qué componente de paso mostrar en cada momento y maneja la lógica dinámica de pasos.

**Importante:** Este store **no** procesa el inventario ni guarda en Firestore. Esa responsabilidad es del `transactionStore`.

---

## State

| Propiedad            | Tipo           | Descripción                         |
| -------------------- | -------------- | ----------------------------------- |
| `currentStep`        | `Number`       | Índice del paso actual (0-based)    |
| `steps`              | `Array`        | Configuración dinámica de los pasos |
| `transactionLoading` | `Boolean`      | Indicador de carga                  |
| `transactionError`   | `String\|null` | Último error                        |

### Pasos base del Wizard

| Paso | Componente                | Descripción                              |
| ---- | ------------------------- | ---------------------------------------- |
| 0    | `StepIncomeOrExpense.vue` | Tipo de transacción                      |
| 1    | `StepCashOrBank.vue`      | Cuenta (efectivo/banco)                  |
| ...  | Dinámicos                 | Los pasos 2+ se configuran según el tipo |

Los pasos se configuran **dinámicamente** en `nextStep()` según el tipo de transacción seleccionado (ingreso, gasto, transferencia, cotización).

---

## Getters

| Getter              | Retorna   | Descripción                             |
| ------------------- | --------- | --------------------------------------- |
| `currentStepConfig` | `Object`  | `{ ...step, allSteps: steps }`          |
| `isFirstStep`       | `Boolean` | Si está en el primer paso               |
| `isLastStep`        | `Boolean` | Si está en el último paso (y steps > 1) |

---

## Actions

### `nextStep()`

**Descripción:** Avanza al siguiente paso. Determina dinámicamente los pasos siguientes según el tipo de transacción.

### `prevStep()`

**Descripción:** Retrocede al paso anterior.

### `resetFlow()`

**Descripción:** Resetea el wizard a su estado inicial (step 0, steps base).

### `setStepsForType(transactionType)`

**Descripción:** Configura los pasos según el tipo de transacción:

- `'income'` → pasos de ingreso
- `'expense'` → pasos de gasto
- `'transfer'` → pasos de transferencia
- `'quote'` → pasos de cotización

---

## Uso en Componentes

`StepIncomeOrExpense.vue`, `StepCashOrBank.vue`, `Header.vue`, `NavigationBtnBARB.vue`, `BasicAccountingRecordsWrapper.vue`, `StepAddExpenseDetails.vue`

---

## Changelog

### [Creado - Auditoría Marzo 2026]

- Documentación inicial creada en auditoría de código fuente.
