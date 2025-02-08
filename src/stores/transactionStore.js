import { ref } from 'vue';

import { useTransaccion } from '@/composables/useTransaction';
import { useInventory } from '@/composables/useInventory';

import { v4 as uuidv4 } from "uuid";



const transactionsInStore = ref([]);

const transactionToAdd = ref({
  uuid: null,
  type: null,
  account: null,
  items: [],
  itemsAndStockLogs: [],
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
  const { createTransaction, updateTransaction, getAllTransactions, deleteTransactionByID } = useTransaccion();
  const { createStockLog, deleteStockLog } = useInventory();

  const addTransaction = async () => {
    try {
      transactionToAdd.value.total = getTransactionToAddTotal();
      transactionToAdd.value.uuid = uuidv4();
      for (const item of transactionToAdd.value.items) {
        const stockLogUuid = await createStockLog(item);
        const itemUuid = item.uuid;


        const itemStockLog = {
          itemUuid,
          stockLogUuid,
        }

        console.log('itemStockLog: ', itemStockLog);

        transactionToAdd.value.itemsAndStockLogs.push(itemStockLog);
        await createTransaction(transactionToAdd.value);

        // transactionToAdd.value.itemsAndStockLogs.push({ itemUuid, stockLogUuid });
      }
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

  const getOneTransactionDataByID = (transactionId) => {
    return transactionsInStore.value.filter(t => t.uuid === transactionId);
  };

  const resetTransactionToAdd = () => {
    transactionToAdd.value = {
      uuid: null,
      type: null,
      account: null,
      items: [],
      itemsAndStockLogs: [],

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
      await deleteStockLog(transactionDataById);
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
    getOneTransactionDataByID,
    deleteOneTransactionByID,
    resetTransactionToAdd,
    modifyTransaction,
    modifyTransactionToAddType,
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