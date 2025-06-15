// composables/useTransactionFlow.js
import { computed } from 'vue';
import { useTransactionStore } from '@/stores/transaction/transactionStore';

export function useTransactionFlow() {
  const transactionStore = useTransactionStore();

  // Pasos dinámicos según si existen transacciones
  const steps = computed(() => {
    const baseSteps = [
      "IncomeOrExpense",
      "CashOrBank",
      "AddIncomeOrExpense",
      "Summary",
    ];
    return transactionStore.transactionsInStore.value.length === 0
      ? ["CajaDiaria", ...baseSteps]
      : baseSteps;
  });

  const hasCajaDiaria = computed(() => steps.value[0] === "CajaDiaria");

  const startStep = computed(() => (hasCajaDiaria.value ? 0 : 1));
  const endStep = computed(() => startStep.value + steps.value.length - 1);

  const isFirstStep = computed(() =>
    transactionStore.currentStepOfAddTransaction.value === startStep.value
  );

  const isFinalStep = computed(() => {
    return transactionStore.currentStepOfAddTransaction.value === endStep.value;
  });


  const goNext = () => {
    if (transactionStore.currentStepOfAddTransaction.value < endStep.value) {
      transactionStore.currentStepOfAddTransaction.value++;
    }
  };

  const goBack = () => {
    if (transactionStore.currentStepOfAddTransaction.value > startStep.value) {
      transactionStore.currentStepOfAddTransaction.value--;
    }
  };

  return {
    steps,
    hasCajaDiaria,
    startStep,
    endStep,
    isFirstStep,
    isFinalStep,
    goNext,
    goBack,
  };
}
