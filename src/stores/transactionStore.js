import { ref } from 'vue';

import { useTransaccion } from '@/composables/useTransaction';


const transactions = ref([]);

const transactionToAdd = ref({
  type: null,
  total: 0,
  account: null,
  items: [],
  timestamp: new Date(),
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
  const { createTransaction, updateTransaction } = useTransaccion();

  const addTransaction = async (transaction) => {
    try {
      const transactionId = await createTransaction(transaction);
      transactions.value.push({ ...transaction, id: transactionId });
    } catch (error) {
      console.error('Error adding transaction: ', error);
    }
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


  const modifyitemToAddInTransaction = (product) => {
    if (product.oldOrNewProduct === "old") {
      itemToAddInTransaction.value.uuid = product.selectedProductUuid;
    } else {
      itemToAddInTransaction.value.uuid = null;
    }
    itemToAddInTransaction.value.description = product.description;
    itemToAddInTransaction.value.quantity = product.quantity;
    itemToAddInTransaction.value.price = product.price;
    itemToAddInTransaction.value.oldOrNewProduct = product.oldOrNewProduct;
    itemToAddInTransaction.value.selectedProductUuid = product.selectedProductUuid;
  }


  return {
    transactions,
    transactionToAdd,
    currentStepOfAddTransaction,
    itemToAddInTransaction,
    addTransaction,
    modifyTransaction,
    modifyTransactionToAddType,
    modifyTransactionToAddAccount,
    nextStepToAddTransaction,
    prevStepToAddTransaction,
    modifyitemToAddInTransaction,
  };
}