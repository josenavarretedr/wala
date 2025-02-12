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
  const { createExpense, updateExpense, getAllExpenses, deleteExpenseByID, deleteExpenseByTransactionRef } = useExpenses();

  const addExpense = async (transactionRef) => {
    try {
      expenseToAdd.value.uuid = uuidv4();
      await createExpense(expenseToAdd.value, transactionRef);
      console.log("Expense added successfully");
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
      // TODO hacer que se vuelvan a cargar todos los expenses y que se actualice el store local con getExpenses()
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
    expensesInStore,
    expenseToAdd,
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
