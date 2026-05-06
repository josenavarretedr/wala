# Flow Stores de Inventario — Documentación

Este documento cubre los tres stores de flujo wizard del módulo de inventario:

| Store                        | Archivo                                      | Store ID             |
| ---------------------------- | -------------------------------------------- | -------------------- |
| `useAddStockFlowStore`       | `src/stores/Inventory/AddStockFlow.js`       | `addStockFlow`       |
| `useRemoveStockFlowStore`    | `src/stores/Inventory/RemoveStockFlow.js`    | `removeStockFlow`    |
| `useInventoryCountFlowStore` | `src/stores/Inventory/InventoryCountFlow.js` | `inventoryCountFlow` |

Todos son **Pinia Stores (Options API)** que implementan el patrón wizard multi-paso.

---

## `useAddStockFlowStore` — Flujo de Adición de Stock

### Descripción

Gestiona el wizard para agregar stock a un producto existente en el inventario.

### State

| Propiedad         | Tipo           | Descripción                |
| ----------------- | -------------- | -------------------------- |
| `currentStep`     | `Number`       | Paso actual (0-based)      |
| `steps`           | `Array`        | Pasos del wizard           |
| `addStockLoading` | `Boolean`      | Indicador de carga         |
| `addStockError`   | `String\|null` | Último error               |
| `addStockData`    | `Object`       | Datos del flujo de adición |

### Pasos del Wizard

| Paso | Componente                 | Descripción                 |
| ---- | -------------------------- | --------------------------- |
| 0    | `StepAddStockQuantity.vue` | Cantidad y precio de compra |
| 1    | `StepCashOrBank.vue`       | Método de pago              |
| 2    | `StepAddStockPreview.vue`  | Vista previa y confirmación |

### Estructura de `addStockData`

```javascript
{
  productId: null,        // UUID del producto
  productData: null,      // Datos completos del producto
  quantity: 0,            // Cantidad a agregar
  cost: 0,                // Costo de compra
  priceConfirmed: false,  // Si el costo fue confirmado
  account: null,          // 'cash' | 'bank'
}
```

### Actions

| Action                | Descripción                      |
| --------------------- | -------------------------------- |
| `nextStep()`          | Avanza al siguiente paso         |
| `prevStep()`          | Retrocede al paso anterior       |
| `resetFlow()`         | Resetea el wizard completo       |
| `resetAddStockData()` | Solo resetea los datos del flujo |

### Getters

`currentStepConfig`, `isFirstStep`, `isLastStep`

### Usado en

`NavigationBtnsAddStock.vue`, `StepAddStockQuantity.vue`, `StepAddStockPreview.vue`, `StepCashOrBank.vue`, `AddStock.vue`, `InventoyStock.vue`

---

## `useRemoveStockFlowStore` — Flujo de Remoción de Stock

### Descripción

Gestiona el wizard para registrar una salida/remoción de stock de un producto.

### State

| Propiedad            | Tipo           | Descripción                 |
| -------------------- | -------------- | --------------------------- |
| `currentStep`        | `Number`       | Paso actual (0-based)       |
| `steps`              | `Array`        | Pasos del wizard            |
| `removeStockLoading` | `Boolean`      | Indicador de carga          |
| `removeStockError`   | `String\|null` | Último error                |
| `removeStockData`    | `Object`       | Datos del flujo de remoción |

### Pasos del Wizard

| Paso | Componente                    | Descripción                                 |
| ---- | ----------------------------- | ------------------------------------------- |
| 0    | `StepRemoveStockType.vue`     | Tipo de remoción (merma, uso interno, etc.) |
| 1    | `StepRemoveStockQuantity.vue` | Cantidad a remover                          |
| 2    | `StepRemoveStockPreview.vue`  | Vista previa y confirmación                 |

### Actions

`nextStep()`, `prevStep()`, `resetFlow()`, `resetRemoveStockData()`

### Usado en

`NavigationBtnsRemoveStock.vue`, `StepRemoveStockType.vue`, `StepRemoveStockQuantity.vue`, `StepRemoveStockPreview.vue`, `StepCashOrBank.vue`, `RemoveStock.vue`

---

## `useInventoryCountFlowStore` — Flujo de Conteo de Inventario

### Descripción

Gestiona el wizard para realizar un conteo de inventario físico.

### State

| Propiedad               | Tipo           | Descripción                  |
| ----------------------- | -------------- | ---------------------------- |
| `currentStep`           | `Number`       | Paso actual                  |
| `steps`                 | `Array`        | Pasos del wizard             |
| `inventoryCountLoading` | `Boolean`      | Indicador de carga           |
| `inventoryCountError`   | `String\|null` | Último error                 |
| `countData`             | `Object`       | Datos del conteo en progreso |

### Pasos del Wizard

| Paso | Componente                       | Descripción               |
| ---- | -------------------------------- | ------------------------- |
| 0    | `StepInventoryCountQuantity.vue` | Ingresar cantidad contada |

### Actions

`nextStep()`, `prevStep()`, `resetFlow()`, `resetCountData()`

### Usado en

`NavigationBtnInventoryCount.vue`, `StepInventoryCountQuantity.vue`, `InventoryCount.vue`

---

## Patrón Común

Todos estos stores implementan el patrón wizard con:

```javascript
// Getters comunes:
currentStepConfig; // { ...step, allSteps: steps }
isFirstStep; // currentStep === 0
isLastStep; // currentStep === steps.length - 1

// Actions comunes:
nextStep(); // avanza (puede tener lógica de validación)
prevStep(); // retrocede
resetFlow(); // resetea wizard completo
```

---

## Changelog

### [Creado - Auditoría Marzo 2026]

- Documentación inicial creada en auditoría de código fuente.
- Los tres stores verificados como activos en producción.
