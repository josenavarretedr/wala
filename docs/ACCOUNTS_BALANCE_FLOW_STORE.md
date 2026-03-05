# `accountsBalanceFlowStore.js` — Documentación del Store de Flujo de Balance

**Archivo:** `src/stores/AccountsBalanceApp/accountsBalanceFlowStore.js`
**Store ID:** `accountBalanceFlow`
**Tipo:** Pinia Store (Options API)
**Módulo:** Apertura/Cierre de Caja — Wizard de Balance

---

## Descripción General

El `useAccountsBalanceFlowStore` gestiona el wizard de apertura y cierre de caja (módulo AccountsBalance). Maneja los 3 pasos del proceso y almacena los datos de cada paso.

---

## State

| Propiedad               | Tipo           | Descripción                            |
| ----------------------- | -------------- | -------------------------------------- |
| `currentStep`           | `Number`       | Paso actual (0-based)                  |
| `steps`                 | `Array`        | Configuración de pasos del wizard      |
| `accountBalanceLoading` | `Boolean`      | Carga de la operación principal        |
| `stepLoading`           | `Boolean`      | Carga específica de un paso            |
| `accountBalanceError`   | `String\|null` | Último error                           |
| `dataAlreadyLoaded`     | `Boolean`      | Flag para evitar recargas innecesarias |
| `stepsData`             | `Object`       | Datos recopilados en cada paso         |

### Pasos del Wizard

| Paso | Componente              | Descripción                         |
| ---- | ----------------------- | ----------------------------------- |
| 0    | `StepLastReference.vue` | Referencia anterior (último cierre) |
| 1    | `StepCashBalance.vue`   | Balance de efectivo                 |
| 2    | `StepBankBalance.vue`   | Balance bancario                    |

### Estructura de `stepsData`

```javascript
{
  lastClosureData: null,      // Datos del cierre anterior
  openingData: null,          // Datos de la apertura
  selectedCashOption: null,   // Opción seleccionada para efectivo
  realCashBalance: 0,         // Balance real de efectivo ingresado
  expectedCashBalance: 0,     // Balance esperado de efectivo
  selectedBankOption: null,   // Opción seleccionada para banco
  realBankBalance: 0,         // Balance real bancario ingresado
  expectedBankBalance: 0,     // Balance esperado bancario
}
```

---

## Getters

| Getter              | Descripción                             |
| ------------------- | --------------------------------------- |
| `currentStepConfig` | `{ ...step, allSteps: steps }`          |
| `isFirstStep`       | Si está en el paso 0                    |
| `isLastStep`        | Si está en el último paso (y steps > 1) |

---

## Actions

| Action                            | Descripción                           |
| --------------------------------- | ------------------------------------- |
| `nextStep()`                      | Avanza al siguiente paso              |
| `prevStep()`                      | Retrocede al paso anterior            |
| `resetFlow()`                     | Resetea wizard completo y datos       |
| `resetStepsData()`                | Solo resetea los datos de los pasos   |
| `updateStepData(stepLabel, data)` | Actualiza datos de un paso específico |
| `setStepLoading(loading)`         | Actualiza `stepLoading`               |
| `markDataAsLoaded()`              | Marca `dataAlreadyLoaded = true`      |
| `resetDataLoadedFlag()`           | Resetea `dataAlreadyLoaded = false`   |

---

## Uso en Componentes

`AccountBalanceBtn.vue`, `NavigationBtnsAccountsBalance.vue`, `StepBankBalance.vue`, `StepCashBalance.vue`, `StepLastReference.vue`, `ResumenDay.vue`, `AccountBalanceAppWrapper.vue`

---

## Changelog

### [Creado - Auditoría Marzo 2026]

- Documentación inicial creada en auditoría de código fuente.
