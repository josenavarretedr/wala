// Ejemplos de uso del CloseBtn refactorizado para diferentes flows

import { computed } from 'vue';

// ===============================
// EJEMPLO 1: Transaction Flow
// ===============================
export function useTransactionCloseExample() {
  const flow = useTransactionFlowStore();
  const transactionStore = useTransactionStore();

  const closeBtnConfig = computed(() => ({
    flowStore: flow,
    additionalStores: {
      transactionStore
    },
    flowType: 'TRANSACTION',
    confirmBeforeClose: true,
    confirmMessage: '¿Estás seguro de que quieres cerrar? Se perderá el progreso de la transacción.',
    tooltipText: 'Cerrar transacción'
  }));

  return { closeBtnConfig };
}

// ===============================
// EJEMPLO 2: Cash Closure Flow
// ===============================
export function useCashClosureCloseExample() {
  const cashClosureStore = useCashClosureStore();

  const closeBtnConfig = computed(() => ({
    additionalStores: {
      cashClosureStore
    },
    flowType: 'CASH_CLOSURE',
    confirmBeforeClose: true,
    confirmMessage: '¿Seguro que quieres cerrar? Los datos del cierre de caja se perderán.',
    tooltipText: 'Cerrar cierre de caja'
  }));

  return { closeBtnConfig };
}

// ===============================
// EJEMPLO 3: Cash Event Flow
// ===============================
export function useCashEventCloseExample() {
  const cashEventStore = useCashEventStore();

  const closeBtnConfig = computed(() => ({
    additionalStores: {
      cashEventStore
    },
    flowType: 'CASH_EVENT',
    confirmBeforeClose: false, // No confirmar para eventos rápidos
    tooltipText: 'Cerrar evento'
  }));

  return { closeBtnConfig };
}

// ===============================
// EJEMPLO 4: Expenses Flow
// ===============================
export function useExpensesCloseExample() {
  const expensesStore = useExpensesStore();

  const closeBtnConfig = computed(() => ({
    additionalStores: {
      expensesStore
    },
    flowType: 'EXPENSES',
    confirmBeforeClose: true,
    confirmMessage: '¿Deseas cerrar sin guardar el gasto?',
    tooltipText: 'Cerrar gasto'
  }));

  return { closeBtnConfig };
}

// ===============================
// EJEMPLO 5: Multiple Stores
// ===============================
export function useMultiStoreCloseExample() {
  const flow = useTransactionFlowStore();
  const transactionStore = useTransactionStore();
  const expensesStore = useExpensesStore();
  const inventoryStore = useInventoryStore();

  const closeBtnConfig = computed(() => ({
    flowStore: flow,
    additionalStores: {
      transactionStore,
      expensesStore,
      inventoryStore
    },
    flowType: 'TRANSACTION',
    confirmBeforeClose: true,
    confirmMessage: 'Se resetearán múltiples módulos. ¿Continuar?'
  }));

  return { closeBtnConfig };
}

// ===============================
// EJEMPLO 6: Custom Navigation
// ===============================
export function useCustomNavigationExample() {
  const router = useRouter();
  const flow = useTransactionFlowStore();
  const transactionStore = useTransactionStore();

  const closeBtnConfig = computed(() => ({
    flowStore: flow,
    additionalStores: { transactionStore },
    flowType: 'TRANSACTION',
    autoNavigate: false // Deshabilitamos navegación automática
  }));

  const handleAfterClose = () => {
    // Navegación personalizada
    router.push('/custom-dashboard');
  };

  return { closeBtnConfig, handleAfterClose };
}

// ===============================
// EJEMPLO 7: Con Eventos
// ===============================
export function useEventsExample() {
  const flow = useTransactionFlowStore();
  const transactionStore = useTransactionStore();
  const loading = ref(false);

  const closeBtnConfig = computed(() => ({
    flowStore: flow,
    additionalStores: { transactionStore },
    flowType: 'TRANSACTION'
  }));

  const handleBeforeClose = () => {
    loading.value = true;
    console.log('🔄 Preparando cierre...');
    // Aquí podrías guardar datos temporales
  };

  const handleAfterClose = () => {
    loading.value = false;
    console.log('✅ Cierre completado');
    // Aquí podrías mostrar notificaciones
  };

  return {
    closeBtnConfig,
    handleBeforeClose,
    handleAfterClose,
    loading
  };
}

/* 
===============================
USO EN COMPONENTES:
===============================

// En un componente Transaction
<template>
  <CloseBtn v-bind="closeBtnConfig" />
</template>

<script setup>
import { useTransactionCloseExample } from '@/examples/closeBtnExamples';
const { closeBtnConfig } = useTransactionCloseExample();
</script>

// En un componente Cash Closure
<template>
  <CloseBtn v-bind="closeBtnConfig" />
</template>

<script setup>
import { useCashClosureCloseExample } from '@/examples/closeBtnExamples';
const { closeBtnConfig } = useCashClosureCloseExample();
</script>

// Con eventos personalizados
<template>
  <CloseBtn 
    v-bind="closeBtnConfig"
    @before-close="handleBeforeClose"
    @after-close="handleAfterClose"
  />
</template>

<script setup>
import { useEventsExample } from '@/examples/closeBtnExamples';
const { closeBtnConfig, handleBeforeClose, handleAfterClose } = useEventsExample();
</script>
*/