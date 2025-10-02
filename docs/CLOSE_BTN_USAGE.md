# CloseBtn - Componente Reutilizable

El componente `CloseBtn` ha sido refactorizado para ser completamente reutilizable con cualquier tipo de flow, permitiendo ejecutar funciones de reset específicas para cada contexto.

## Uso Básico

### Opción Simple (Solo navegación)

```vue
<template>
  <CloseBtn />
</template>
```

### Opción Completa (Con reset de flows)

```vue
<template>
  <CloseBtn v-bind="closeBtnConfig" />
</template>

<script setup>
import CloseBtn from "@/components/ui/CloseBtn.vue";
import { useTransactionFlowStore } from "@/stores/transaction/transactionFlowStore";
import { useTransactionStore } from "@/stores/transaction/transactionStore";

const flow = useTransactionFlowStore();
const transactionStore = useTransactionStore();

const closeBtnConfig = {
  flowStore: flow,
  additionalStores: {
    transactionStore,
  },
  flowType: "TRANSACTION",
  confirmBeforeClose: true,
  confirmMessage:
    "¿Estás seguro de que quieres cerrar? Se perderá el progreso.",
};
</script>
```

## Ejemplos con Diferentes Flows

### Transaction Flow

```vue
<script setup>
import { useTransactionFlowStore } from "@/stores/transaction/transactionFlowStore";
import { useTransactionStore } from "@/stores/transaction/transactionStore";

const flow = useTransactionFlowStore();
const transactionStore = useTransactionStore();

const closeBtnConfig = {
  flowStore: flow,
  additionalStores: { transactionStore },
  flowType: "TRANSACTION",
};
</script>

<template>
  <CloseBtn v-bind="closeBtnConfig" />
</template>
```

### Cash Closure Flow

```vue
<script setup>
import { useCashClosureStore } from "@/stores/cashClosureStore";

const cashClosureStore = useCashClosureStore();

const closeBtnConfig = {
  additionalStores: { cashClosureStore },
  flowType: "CASH_CLOSURE",
};
</script>

<template>
  <CloseBtn v-bind="closeBtnConfig" />
</template>
```

### Cash Event Flow

```vue
<script setup>
import { useCashEventStore } from "@/stores/cashEventStore";

const cashEventStore = useCashEventStore();

const closeBtnConfig = {
  additionalStores: { cashEventStore },
  flowType: "CASH_EVENT",
};
</script>

<template>
  <CloseBtn v-bind="closeBtnConfig" />
</template>
```

### Expenses Flow

```vue
<script setup>
import { useExpensesStore } from "@/stores/expensesStore";

const expensesStore = useExpensesStore();

const closeBtnConfig = {
  additionalStores: { expensesStore },
  flowType: "EXPENSES",
};
</script>

<template>
  <CloseBtn v-bind="closeBtnConfig" />
</template>
```

## Props del Componente

| Prop                 | Tipo    | Requerido | Default            | Descripción                                     |
| -------------------- | ------- | --------- | ------------------ | ----------------------------------------------- |
| `flowStore`          | Object  | ❌        | null               | Store principal del flow (debe tener resetFlow) |
| `additionalStores`   | Object  | ❌        | {}                 | Stores adicionales que necesitan reset          |
| `flowType`           | String  | ❌        | 'TRANSACTION'      | Tipo de flow (define qué resets ejecutar)       |
| `autoNavigate`       | Boolean | ❌        | true               | Si debe navegar al dashboard automáticamente    |
| `tooltipText`        | String  | ❌        | 'Cerrar'           | Texto del tooltip                               |
| `confirmBeforeClose` | Boolean | ❌        | false              | Mostrar confirmación antes de cerrar            |
| `confirmMessage`     | String  | ❌        | '¿Estás seguro...' | Mensaje de confirmación                         |

## Eventos

| Evento        | Descripción                             | Payload |
| ------------- | --------------------------------------- | ------- |
| `beforeClose` | Se emite antes de ejecutar el cierre    | -       |
| `afterClose`  | Se emite después de completar el cierre | -       |

## Tipos de Flow Disponibles

```javascript
export const FLOW_RESET_CONFIGS = {
  TRANSACTION: {
    flowResets: ["resetFlow"],
    storeResets: ["resetTransactionToAdd"],
  },
  CASH_CLOSURE: {
    flowResets: ["resetFlow"],
    storeResets: ["resetCashClosureState"],
  },
  CASH_EVENT: {
    flowResets: ["resetFlow"],
    storeResets: ["resetCashEventState"],
  },
  EXPENSES: {
    flowResets: [],
    storeResets: ["resetExpenseToAdd"],
  },
  SAVINGS: {
    flowResets: [],
    storeResets: ["resetStore", "resetSavingRequestsDetails"],
  },
  INVENTORY: {
    flowResets: ["resetFlow"],
    storeResets: ["resetInventoryState"],
  },
  BUSINESS: {
    flowResets: ["resetFlow"],
    storeResets: ["resetBusinessState"],
  },
};
```

## Configuraciones Predefinidas

### Transaction Flow (Completo)

```javascript
const transactionCloseConfig = {
  flowStore: useTransactionFlowStore(),
  additionalStores: {
    transactionStore: useTransactionStore(),
  },
  flowType: "TRANSACTION",
  confirmBeforeClose: true,
  confirmMessage: "Se perderá el progreso de la transacción.",
};
```

### Cash Closure (Solo store)

```javascript
const cashClosureConfig = {
  additionalStores: {
    cashClosureStore: useCashClosureStore(),
  },
  flowType: "CASH_CLOSURE",
  confirmBeforeClose: true,
};
```

## Uso con Eventos

```vue
<template>
  <CloseBtn
    v-bind="closeBtnConfig"
    @before-close="handleBeforeClose"
    @after-close="handleAfterClose"
  />
</template>

<script setup>
const handleBeforeClose = () => {
  console.log("Preparando cierre...");
  // Guardar datos temporales, mostrar loading, etc.
};

const handleAfterClose = () => {
  console.log("Cierre completado");
  // Limpiar datos, actualizar UI, etc.
};
</script>
```

## Uso Sin Navegación Automática

```vue
<template>
  <CloseBtn
    :flow-store="flow"
    :additional-stores="{ transactionStore }"
    flow-type="TRANSACTION"
    :auto-navigate="false"
    @after-close="customNavigation"
  />
</template>

<script setup>
const customNavigation = () => {
  // Lógica de navegación personalizada
  router.push("/custom-route");
};
</script>
```

## Migración desde la Versión Anterior

**Antes:**

```vue
<CloseBtn />
```

**Después (Solo navegación):**

```vue
<CloseBtn />
```

**Después (Con reset de flows):**

```vue
<CloseBtn v-bind="closeBtnConfig" />

<script setup>
const closeBtnConfig = {
  flowStore: yourFlowStore,
  additionalStores: { yourStore },
  flowType: "YOUR_FLOW_TYPE",
};
</script>
```

## Personalizaciones Avanzadas

### Confirmación Personalizada

```vue
<CloseBtn
  :confirm-before-close="true"
  confirm-message="¿Deseas salir sin guardar los cambios?"
  tooltip-text="Salir"
/>
```

### Múltiples Stores

```vue
<script setup>
const closeBtnConfig = {
  flowStore: useTransactionFlowStore(),
  additionalStores: {
    transactionStore: useTransactionStore(),
    expensesStore: useExpensesStore(),
    inventoryStore: useInventoryStore(),
  },
  flowType: "TRANSACTION",
};
</script>
```
