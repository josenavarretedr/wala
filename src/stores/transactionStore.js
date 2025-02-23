import { ref } from 'vue';

import { useTransaccion } from '@/composables/useTransaction';
import { useInventory } from '@/composables/useInventory';

import { v4 as uuidv4 } from "uuid";

import { useExpensesStore } from "@/stores/expensesStore"; // Importa el store de expenses
const expensesStore = useExpensesStore(); // Usa el store




const transactionsInStore = ref([]);

const transactionToAdd = ref({
  uuid: null,
  type: null,      // 'income' o 'expense'
  account: null,
  // Campos para transacciones de ingreso:
  items: [],
  itemsAndStockLogs: [],
  // Campos para transacciones de egreso:
  description: null,
  cost: null,
});

const itemToAddInTransaction = ref({
  description: null,
  quantity: null,
  price: null,
  oldOrNewProduct: null,
  selectedProductUuid: null,
});


const currentStepOfAddTransaction = ref(1);

export function useTransactionStore() {
  const { createTransaction, updateTransaction, getAllTransactions, deleteTransactionByID, getTransactionsTodayCmps } = useTransaccion();
  const { createStockLog, deleteStockLog } = useInventory();

  const addTransaction = async () => {
    try {
      // Asignar un UUID para la transacción
      transactionToAdd.value.uuid = uuidv4();

      if (transactionToAdd.value.type === 'income') {
        // Procesar transacción de ingreso:
        transactionToAdd.value.total = getTransactionToAddTotal();
        // Procesar cada ítem y registrar los stockLogs
        for (const item of transactionToAdd.value.items) {
          const stockLogUuid = await createStockLog(item);
          const itemUuid = item.uuid;
          const itemStockLog = { itemUuid, stockLogUuid };
          transactionToAdd.value.itemsAndStockLogs.push(itemStockLog);
        }
      } else if (transactionToAdd.value.type === 'expense') {
        transactionToAdd.value.total = transactionToAdd.value.cost;
        await expensesStore.addExpense(transactionToAdd.value.uuid);
        // Llama a la acción para agregar el gasto desde el store
        expensesStore.resetExpenseToAdd();
        // Limpia el formulario después de agregar

        // Procesar transacción de egreso:
        // Para gastos, se toma directamente el costo ingresado como total
        // No se requieren arrays de items ni stockLogs.
        // Se debe asegurar que los campos 'description' y 'cost' estén asignados.
      }

      // Crear la transacción en Firestore
      await createTransaction(transactionToAdd.value);
      console.log('Transaction added successfully');

    } catch (error) {
      console.error('Error adding transaction: ', error);
    }
  };


  const getTransactions = async () => {
    try {
      transactionsInStore.value = await getAllTransactions();

    } catch (error) {
      console.error('Error fetching transactions: ', error);
    }
  };

  const getTransactionsToday = async () => {
    try {
      transactionsInStore.value = await getTransactionsTodayCmps();
    } catch (error) {
      console.error('Error fetching transactions: ', error);
    }
  }

  const getOneTransactionDataByID = (transactionId) => {
    return transactionsInStore.value.filter(t => t.uuid === transactionId);
  };

  const getAllIncomeTransactionsInStore = () => {
    return transactionsInStore.value.filter(t => t.type === 'income');
  }

  const getAllExpenseTransactionsInStore = () => {
    return transactionsInStore.value.filter(t => t.type === 'expense');
  }

  const getAllCashTransactionsInStore = () => {
    return transactionsInStore.value.filter(t => t.account === 'cash');
  }

  const getAllBankTransactionsInStore = () => {
    return transactionsInStore.value.filter(t => t.account === 'bank');
  }

  const resetTransactionToAdd = () => {
    transactionToAdd.value = {
      uuid: null,
      type: null,
      account: null,
      items: [],
      itemsAndStockLogs: [],
      description: null,
      cost: null,

    };

    currentStepOfAddTransaction.value = 1;

    resetItemToAddInTransaction();


  };

  const modifyTransaction = async (transactionId, updatedData) => {
    try {
      await updateTransaction(transactionId, updatedData);
      const index = transactions.value.findIndex(t => t.id === transactionId);
      if (index !== -1) {
        transactions.value[index] = { ...transactions.value[index], ...updatedData };
      }
    } catch (error) {
      console.error('Error updating transaction: ', error);
    }
  };

  const modifyTransactionToAddType = (type) => {
    transactionToAdd.value.type = type;
  };


  const modifyTransactionExpenseDescriptionAndCost = (description, cost) => {
    transactionToAdd.value.description = description;
    transactionToAdd.value.cost = cost
  }

  const modifyTransactionExpenseDescription = (description) => {
    transactionToAdd.value.description = description;
  }

  const modifyTransactionExpenseCost = (cost) => {
    transactionToAdd.value.cost = cost;
  }

  const getTransactionToAddTotal = () => {
    return transactionToAdd.value.items.reduce((sum, item) => {
      return sum + item.price * item.quantity;
    }, 0);
  }

  const modifyTransactionToAddAccount = (account) => {
    transactionToAdd.value.account = account;
  }

  const nextStepToAddTransaction = () => {
    if (currentStepOfAddTransaction.value < 4) {
      currentStepOfAddTransaction.value++;
    }
  }

  const prevStepToAddTransaction = () => {
    if (currentStepOfAddTransaction.value > 1) {
      currentStepOfAddTransaction.value--;
    }
  }


  const modifyItemToAddInTransaction = (product) => {
    if (product.oldOrNewProduct === "old") {
      itemToAddInTransaction.value.uuid = product.selectedProductUuid;
    } else {
      itemToAddInTransaction.value.uuid = uuidv4();
    }
    itemToAddInTransaction.value.description = product.description;
    itemToAddInTransaction.value.quantity = product.quantity;
    itemToAddInTransaction.value.price = product.price;
    itemToAddInTransaction.value.oldOrNewProduct = product.oldOrNewProduct;
    itemToAddInTransaction.value.selectedProductUuid = product.selectedProductUuid;
  }

  const resetItemToAddInTransaction = () => {
    itemToAddInTransaction.value = {
      description: null,
      quantity: null,
      price: null,
      oldOrNewProduct: null,
      selectedProductUuid: null,
    };
  }

  const addItemToTransaction = () => {
    transactionToAdd.value.items.push({ ...itemToAddInTransaction.value });
    itemToAddInTransaction.value = {
      description: null,
      quantity: null,
      price: null,
      oldOrNewProduct: null,
      selectedProductUuid: null,
    };
  }

  const removeItemToTransaction = (uuid) => {
    const index = transactionToAdd.value.items.findIndex(i => i.uuid === uuid);
    if (index !== -1) {
      transactionToAdd.value.items.splice(index, 1);
    }
  }

  const deleteOneTransactionByID = async (transactionID) => {
    try {
      const transactionDataById = getOneTransactionDataByID(transactionID);
      if (transactionDataById[0].type === 'income') {
        if (transactionDataById[0].items) {
          await deleteStockLog(transactionDataById);
        }
      } else {
        await expensesStore.deleteExpenseByTransactionRefStore(transactionID);
      }
      await deleteTransactionByID(transactionID);
      console.log('Transaction deleted successfully in FIRESTORE');
      await getTransactions();

    } catch (error) {
      console.error('Error adding transaction: ', error);
    }
  };



  return {
    transactionsInStore,
    transactionToAdd,
    currentStepOfAddTransaction,
    itemToAddInTransaction,
    addTransaction,
    getTransactions,
    getTransactionsToday,
    getOneTransactionDataByID,
    getAllIncomeTransactionsInStore,
    getAllExpenseTransactionsInStore,
    getAllCashTransactionsInStore,
    getAllBankTransactionsInStore,
    deleteOneTransactionByID,
    resetTransactionToAdd,
    modifyTransaction,
    modifyTransactionToAddType,
    modifyTransactionExpenseDescriptionAndCost,
    modifyTransactionExpenseDescription,
    modifyTransactionExpenseCost,
    getTransactionToAddTotal,
    modifyTransactionToAddAccount,
    nextStepToAddTransaction,
    prevStepToAddTransaction,
    modifyItemToAddInTransaction,
    resetItemToAddInTransaction,
    addItemToTransaction,
    removeItemToTransaction,
  };
}