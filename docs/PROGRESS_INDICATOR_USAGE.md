# ProgressIndicator - Componente Reutilizable

El componente `ProgressIndicator` ha sido refactorizado para ser completamente reutilizable con cualquier tipo de flow (transactionFlow, cashFlow, inventoryFlow, etc.).

## Uso Básico

### Opción 1: Pasando props directamente

```vue
<template>
  <ProgressIndicator :current-step="flow.currentStep" :steps="flow.steps" />
</template>

<script setup>
import ProgressIndicator from "@/components/ui/ProgressIndicator.vue";
import { useTransactionFlowStore } from "@/stores/transaction/transactionFlowStore";

const flow = useTransactionFlowStore();
</script>
```

### Opción 2: Usando el composable (Recomendado)

```vue
<template>
  <ProgressIndicator v-bind="progressProps" />
</template>

<script setup>
import { computed } from "vue";
import ProgressIndicator from "@/components/ui/ProgressIndicator.vue";
import {
  getProgressIndicatorProps,
  FLOW_TYPES,
} from "@/composables/useProgressIndicator";
import { useTransactionFlowStore } from "@/stores/transaction/transactionFlowStore";

const flow = useTransactionFlowStore();

// Props para el ProgressIndicator con colores específicos del tipo de flow
const progressProps = computed(() =>
  getProgressIndicatorProps(flow, FLOW_TYPES.TRANSACTION)
);
</script>
```

## Ejemplos con Diferentes Flows

### Transaction Flow

```vue
<script setup>
import { useTransactionFlowStore } from "@/stores/transaction/transactionFlowStore";
import {
  getProgressIndicatorProps,
  FLOW_TYPES,
} from "@/composables/useProgressIndicator";

const flow = useTransactionFlowStore();
const progressProps = computed(() =>
  getProgressIndicatorProps(flow, FLOW_TYPES.TRANSACTION)
);
</script>

<template>
  <ProgressIndicator v-bind="progressProps" />
</template>
```

### Cash Flow (ejemplo hipotético)

```vue
<script setup>
import { useCashFlowStore } from "@/stores/cashFlowStore";
import {
  getProgressIndicatorProps,
  FLOW_TYPES,
} from "@/composables/useProgressIndicator";

const flow = useCashFlowStore();
const progressProps = computed(() =>
  getProgressIndicatorProps(flow, FLOW_TYPES.CASH)
);
</script>

<template>
  <ProgressIndicator v-bind="progressProps" />
</template>
```

### Inventory Flow (ejemplo hipotético)

```vue
<script setup>
import { useInventoryFlowStore } from "@/stores/inventoryFlowStore";
import {
  getProgressIndicatorProps,
  FLOW_TYPES,
} from "@/composables/useProgressIndicator";

const flow = useInventoryFlowStore();
const progressProps = computed(() =>
  getProgressIndicatorProps(flow, FLOW_TYPES.INVENTORY)
);
</script>

<template>
  <ProgressIndicator v-bind="progressProps" />
</template>
```

## Props del Componente

| Prop               | Tipo   | Requerido | Default         | Descripción                    |
| ------------------ | ------ | --------- | --------------- | ------------------------------ |
| `currentStep`      | Number | ✅        | 0               | Paso actual (0-indexed)        |
| `steps`            | Array  | ✅        | []              | Array de pasos del flow        |
| `activeColor`      | String | ❌        | 'bg-blue-500'   | Color de los pasos completados |
| `inactiveColor`    | String | ❌        | 'bg-gray-200'   | Color de los pasos pendientes  |
| `counterBgColor`   | String | ❌        | 'bg-gray-100'   | Color de fondo del contador    |
| `counterTextColor` | String | ❌        | 'text-gray-600' | Color del texto del contador   |

## Tipos de Flow Disponibles

```javascript
export const FLOW_TYPES = {
  TRANSACTION: "transaction",
  CASH: "cash",
  INVENTORY: "inventory",
  BUSINESS: "business",
};
```

## Colores por Tipo de Flow

- **TRANSACTION**: Azul (`bg-blue-500`)
- **CASH**: Verde (`bg-green-500`)
- **INVENTORY**: Púrpura (`bg-purple-500`)
- **BUSINESS**: Naranja (`bg-orange-500`)

## Personalización Avanzada

Si necesitas colores personalizados, puedes pasarlos directamente:

```vue
<template>
  <ProgressIndicator
    :current-step="flow.currentStep"
    :steps="flow.steps"
    active-color="bg-red-500"
    inactive-color="bg-red-100"
    counter-bg-color="bg-red-50"
    counter-text-color="text-red-600"
  />
</template>
```

## Compatibilidad con Stores

El componente es compatible con cualquier store que tenga las siguientes propiedades:

- `currentStep` (Number): Paso actual
- `steps` (Array): Lista de pasos

Esto significa que puedes usarlo con:

- `useTransactionFlowStore`
- `useCashClosureStore` (si tiene pasos)
- Cualquier store personalizado que siga esta estructura

## Migración desde la Versión Anterior

**Antes:**

```vue
<ProgressIndicator />
```

**Después:**

```vue
<ProgressIndicator v-bind="progressProps" />

<script setup>
import { computed } from "vue";
import {
  getProgressIndicatorProps,
  FLOW_TYPES,
} from "@/composables/useProgressIndicator";

const progressProps = computed(() =>
  getProgressIndicatorProps(yourFlowStore, FLOW_TYPES.TRANSACTION)
);
</script>
```
