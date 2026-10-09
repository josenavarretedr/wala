// src/stores/expensesStore.js
import { ref } from 'vue';
import { useExpenses } from '@/composables/useExpenses';
import { v4 as uuidv4 } from 'uuid';

const expensesInStore = ref([]);

const expenseToAdd = ref({
  uuid: null,
  description: null,
  cost: null,
  createdAt: null,
  account: null,
  category1: null,
  category2: null,
  category3: null,
  transactionRef: null
});

export function useExpensesStore() {
  const {
    // Nuevas funciones
    searchExpensesByDescription,
    createExpenseWithLog,
    addLogToExpense,
    updateExpenseMetadata,
    getExpenseById,
    getAllExpensesWithMetadata,
    // Funciones legacy
    createExpense,
    updateExpense,
    getAllExpenses,
    deleteExpenseByID,
    deleteExpenseByTransactionRef
  } = useExpenses();

  // ===== NUEVAS FUNCIONES =====

  /**
   * Busca expenses por descripción
   * @param {string} searchTerm - Término de búsqueda
   * @returns {Promise<Array>} Array de expenses
   */
  const searchExpenses = async (searchTerm) => {
    try {
      return await searchExpensesByDescription(searchTerm);
    } catch (error) {
      console.error("Error searching expenses: ", error);
      return [];
    }
  };

  /**
   * Carga todos los expenses con metadata en el store local
   */
  const loadExpensesWithMetadata = async () => {
    try {
      expensesInStore.value = await getAllExpensesWithMetadata();
      console.log(`✅ Loaded ${expensesInStore.value.length} expenses with metadata`);
    } catch (error) {
      console.error("Error loading expenses: ", error);
    }
  };

  /**
   * Obtiene un expense específico por ID
   * @param {string} expenseId - UUID del expense
   * @returns {Promise<Object|null>} Expense o null
   */
  const getExpense = async (expenseId) => {
    try {
      return await getExpenseById(expenseId);
    } catch (error) {
      console.error("Error getting expense: ", error);
      return null;
    }
  };

  // ===== FUNCIONES LEGACY (mantener por compatibilidad) =====

  const addExpense = async (transactionRef) => {
    try {
      expenseToAdd.value.uuid = uuidv4();
      await createExpense(expenseToAdd.value, transactionRef);
      console.log("⚠️ Legacy expense added (consider using createExpenseWithLog)");
      // Opcional: agregar al store local
      expensesInStore.value.push({ ...expenseToAdd.value });
      resetExpenseToAdd();
    } catch (error) {
      console.error("Error adding expense: ", error);
    }
  };

  const getExpenses = async () => {
    try {
      expensesInStore.value = await getAllExpenses();
    } catch (error) {
      console.error("Error fetching expenses: ", error);
    }
  };

  const modifyExpense = async (expenseId, updatedData) => {
    try {
      await updateExpense(expenseId, updatedData);
      const index = expensesInStore.value.findIndex(e => e.uuid === expenseId);
      if (index !== -1) {
        expensesInStore.value[index] = { ...expensesInStore.value[index], ...updatedData };
      }
    } catch (error) {
      console.error("Error updating expense: ", error);
    }
  };

  const modifyExpenseToAddDescription = (description) => {
    expenseToAdd.value.description = description;
  }

  const modifyExpenseToAddCost = (cost) => {
    expenseToAdd.value.cost = cost;
  }

  const modifyExpenseToAddAccount = (account) => {
    expenseToAdd.value.account = account;
  }

  const deleteOneExpenseByID = async (expenseID) => {
    try {
      await deleteExpenseByID(expenseID);
      console.log('Expense deleted successfully in FIRESTORE');
      await getExpenses(); // Refresca la lista de gastos después de eliminar
    } catch (error) {
      console.error('Error deleting expense: ', error);
      throw error;
    }
  };

  const deleteExpenseByTransactionRefStore = async (transactionRef) => {
    try {
      await deleteExpenseByTransactionRef(transactionRef);
    } catch (error) {
      console.error('Error deleting expenses by transactionRef: ', error);
      throw error
    }
  }

  const resetExpenseToAdd = () => {
    expenseToAdd.value = {
      uuid: null,
      description: null,
      cost: null,
      date: null,
      account: null,
      category1: null,
      category2: null,
      category3: null,
      transactionRef: null
    };
  };

  return {
    // Estado
    expensesInStore,
    expenseToAdd,
    // Nuevas funciones
    searchExpenses,
    loadExpensesWithMetadata,
    getExpense,
    // Funciones legacy
    addExpense,
    getExpenses,
    modifyExpense,
    modifyExpenseToAddDescription,
    modifyExpenseToAddCost,
    modifyExpenseToAddAccount,
    deleteOneExpenseByID,
    deleteExpenseByTransactionRefStore,
    resetExpenseToAdd,
  };
}
