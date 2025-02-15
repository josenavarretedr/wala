// src/stores/cashClosureStore.js
import { ref } from "vue";
import { v4 as uuidv4 } from "uuid";
import { useCashClosure } from "@/composables/useCashClosure";
import { useTransactionStore } from "@/stores/transactionStore"; // Importa el store de transacciones

const cashClosuresInStore = ref([]);

const cashClosureToAdd = ref({
  uuid: null,
  date: null,
  user: null,
  accounts: [],
  status: "pending", // 'pending', 'success', 'success_with_adjustments'
  notes: "",
  createdAt: null,
});

export function useCashClosureStore() {
  const { getExpectedBalances, createCashClosure, getCashClosures } = useCashClosure();
  const {
    getAllIncomeTransactionsInStore,
    getAllExpenseTransactionsInStore,
    getAllCashTransactionsInStore,
    getAllBankTransactionsInStore,
    addTransaction
  } = useTransactionStore();

  /**
   * Realiza un arqueo de caja comparando ingresos y egresos
   */
  const performCashClosure = async (userId, realBalances, businessId = "ferrercard") => {
    try {
      let adjustments = [];

      // Calcula diferencias y genera ajustes en caso de discrepancias
      let accountsToStore = ["cash", "bank"].map((account) => {
        const expectedBalance = expectedBalances[account] || 0;
        const realBalance = realBalances[account] || 0;
        const difference = realBalance - expectedBalance;
        let adjustmentTransactionUuid = null;

        if (difference !== 0) {
          // Se crea una transacción de ajuste
          const adjustmentTransaction = {
            uuid: uuidv4(),
            type: difference > 0 ? "income" : "expense",
            account: account,
            description: `Ajuste de arqueo de caja (${account})`,
            total: Math.abs(difference),
            createdAt: new Date(),
          };
          addTransaction(adjustmentTransaction);
          adjustmentTransactionUuid = adjustmentTransaction.uuid;
          adjustments.push(adjustmentTransactionUuid);
        }

        return {
          account,
          expectedBalance,
          realBalance,
          difference,
          adjustmentTransactionUuid,
        };
      });

      // Definir el estado del cierre
      const closureStatus = adjustments.length > 0 ? "success_with_adjustments" : "success";

      // Guardar el cierre en Firestore
      const closureUuid = uuidv4();
      const closureData = {
        uuid: closureUuid,
        date: new Date(),
        user: userId,
        accounts: accountsToStore,
        status: closureStatus,
        notes: cashClosureToAdd.value.notes,
        createdAt: new Date(),
      };

      await createCashClosure(closureData, businessId);
      return closureData;
    } catch (error) {
      console.error("Error performing cash closure: ", error);
      throw error;
    }
  };

  return {
    cashClosuresInStore,
    cashClosureToAdd,
    performCashClosure,
    getCashClosures,
  };
}
