//  @/src/stores/transaction/transactionStore.js 

import { ref, computed } from 'vue';

import { useTransaccion } from '@/composables/useTransaction';
import { useInventory } from '@/composables/useInventory';
import { useTraceability } from '@/composables/useTraceability';

import { v4 as uuidv4 } from "uuid";

import { useExpensesStore } from "@/stores/expensesStore"; // Importa el store de expenses
import { fromJSON } from 'postcss';
const expensesStore = useExpensesStore(); // Usa el store



const status = ref(null);
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
  category: null,
  subcategory: null,
  amount: null,
  // Campos para transfers:
  fromAccount: null,
  toAccount: null,
});

const itemToAddInTransaction = ref({
  description: null,
  quantity: null,
  price: null,
  oldOrNewProduct: null,
  selectedProductUuid: null,
  unit: null,
});


const currentStepOfAddTransaction = ref(0);

export function useTransactionStore() {
  const { createTransaction, updateTransaction, getAllTransactions, deleteTransactionByID, getTransactionsTodayCmps } = useTransaccion();
  const { createStockLog, deleteStockLog } = useInventory();
  const { logTransactionOperation, logInventoryOperation, startOperationChain } = useTraceability();

  const addTransaction = async () => {
    let traceId = null;

    try {
      // Asignar un UUID para la transacción
      transactionToAdd.value.uuid = uuidv4();

      // === TRAZABILIDAD: Iniciar operación compleja ===
      const operationChain = startOperationChain('add_transaction');

      // Preparar datos para trazabilidad
      const relatedEntities = [];

      if (transactionToAdd.value.type === 'income') {
        // Procesar transacción de ingreso:
        transactionToAdd.value.amount = getTransactionToAddTotal();

        // === TRAZABILIDAD: Log de items relacionados ===
        for (const item of transactionToAdd.value.items) {
          relatedEntities.push({
            type: 'inventory',
            id: item.uuid || item.selectedProductUuid,
            relationship: 'stock_affected',
            impact: 'high'
          });
        }

        // Procesar cada ítem y registrar los stockLogs con trazabilidad
        for (const item of transactionToAdd.value.items) {
          // === TRAZABILIDAD: Log antes de crear stock log ===
          await operationChain.addStep('update', 'inventory', item.uuid || item.selectedProductUuid, {
            previousState: { stock: item.currentStock || 0 },
            newState: { stock: (item.currentStock || 0) + item.quantity },
            reason: 'stock_increase_from_income_transaction',
            severity: 'high',
            tags: ['stock_update', 'income_transaction']
          });

          const stockLogUuid = await createStockLog(item);
          const itemUuid = item.uuid;
          const itemStockLog = { itemUuid, stockLogUuid };
          transactionToAdd.value.itemsAndStockLogs.push(itemStockLog);
        }
      } else if (transactionToAdd.value.type === 'expense') {
        transactionToAdd.value.amount = transactionToAdd.value.amount || 0;

        // === TRAZABILIDAD: Log de gasto relacionado ===
        relatedEntities.push({
          type: 'expense',
          id: transactionToAdd.value.uuid,
          relationship: 'generates_expense'
        });

        expensesStore.resetExpenseToAdd();
      }

      // === TRAZABILIDAD: Log de creación de transacción ===
      traceId = await logTransactionOperation(
        'create',
        transactionToAdd.value.uuid,
        transactionToAdd.value,
        {
          reason: 'user_transaction_creation',
          severity: transactionToAdd.value.amount > 10000 ? 'high' : 'medium',
          tags: [
            'transaction_creation',
            `transaction_${transactionToAdd.value.type}`,
            `payment_${transactionToAdd.value.account}`,
            transactionToAdd.value.amount > 10000 ? 'high_value' : 'standard_value'
          ],
          relatedEntities,
          component: 'TransactionStore.addTransaction'
        }
      );

      // Crear la transacción en Firestore (eliminar duplicación)
      await createTransaction(transactionToAdd.value);
      console.log('✅ Transaction added successfully with traceId:', traceId);

      // === TRAZABILIDAD: Finalizar operación compleja ===
      await operationChain.finish({
        reason: 'transaction_creation_completed',
        metadata: {
          transactionId: transactionToAdd.value.uuid,
          transactionType: transactionToAdd.value.type,
          totalValue: transactionToAdd.value.total,
          itemsCount: transactionToAdd.value.items?.length || 0
        }
      });

      status.value = 'success';

    } catch (error) {
      console.error('❌ Error adding transaction:', error);

      // === TRAZABILIDAD: Log de error ===
      if (traceId) {
        await logTransactionOperation(
          'error',
          transactionToAdd.value.uuid || 'unknown',
          { error: error.message },
          {
            reason: 'transaction_creation_failed',
            severity: 'critical',
            tags: ['transaction_error', 'creation_failure'],
            component: 'TransactionStore.addTransaction'
          }
        );
      }

      status.value = 'error';
      throw error;
    }
  };

  const getTransactions = async () => {
    try {
      // === TRAZABILIDAD: Log de acceso a datos ===
      await logTransactionOperation(
        'read',
        'all_transactions',
        { action: 'fetch_all_transactions' },
        {
          reason: 'data_access_all_transactions',
          severity: 'low',
          tags: ['data_read', 'transaction_list'],
          component: 'TransactionStore.getTransactions'
        }
      );

      transactionsInStore.value = await getAllTransactions();
      console.log('✅ Transactions fetched with traceability');

    } catch (error) {
      console.error('❌ Error fetching transactions:', error);

      // === TRAZABILIDAD: Log de error ===
      await logTransactionOperation(
        'error',
        'all_transactions',
        { error: error.message },
        {
          reason: 'fetch_transactions_failed',
          severity: 'medium',
          tags: ['data_error', 'fetch_failure'],
          component: 'TransactionStore.getTransactions'
        }
      );
    }
  };

  const getTransactionsToday = async () => {
    try {
      // === TRAZABILIDAD: Log de acceso a datos del día ===
      await logTransactionOperation(
        'read',
        'today_transactions',
        { action: 'fetch_today_transactions', date: new Date().toISOString().split('T')[0] },
        {
          reason: 'data_access_today_transactions',
          severity: 'low',
          tags: ['data_read', 'transaction_list', 'daily_data'],
          component: 'TransactionStore.getTransactionsToday'
        }
      );

      transactionsInStore.value = await getTransactionsTodayCmps();
      console.log('✅ Today transactions fetched with traceability');

    } catch (error) {
      console.error('❌ Error fetching today transactions:', error);

      // === TRAZABILIDAD: Log de error ===
      await logTransactionOperation(
        'error',
        'today_transactions',
        { error: error.message },
        {
          reason: 'fetch_today_transactions_failed',
          severity: 'medium',
          tags: ['data_error', 'fetch_failure', 'daily_data'],
          component: 'TransactionStore.getTransactionsToday'
        }
      );
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
      category: null,
      subcategory: null,
      amount: null,
      fromAccount: null,
      toAccount: null,

    };

    currentStepOfAddTransaction.value = getSteps()[0] === "CajaDiaria" ? 0 : 1;
    resetItemToAddInTransaction();


  };

  const modifyTransaction = async (transactionId, updatedData) => {
    try {
      // Obtener estado anterior
      const previousTransaction = transactionsInStore.value.find(t => t.uuid === transactionId);

      // === TRAZABILIDAD: Log de modificación ===
      const traceId = await logTransactionOperation(
        'update',
        transactionId,
        updatedData,
        {
          reason: 'user_transaction_modification',
          severity: 'medium',
          tags: ['transaction_update', 'data_modification'],
          component: 'TransactionStore.modifyTransaction',
          previousState: previousTransaction
        }
      );

      await updateTransaction(transactionId, updatedData);

      // Actualizar estado local
      const index = transactionsInStore.value.findIndex(t => t.uuid === transactionId);
      if (index !== -1) {
        transactionsInStore.value[index] = { ...transactionsInStore.value[index], ...updatedData };
      }

      console.log('✅ Transaction modified with traceId:', traceId);

    } catch (error) {
      console.error('❌ Error updating transaction:', error);

      // === TRAZABILIDAD: Log de error ===
      await logTransactionOperation(
        'error',
        transactionId,
        { error: error.message },
        {
          reason: 'transaction_modification_failed',
          severity: 'high',
          tags: ['transaction_error', 'update_failure'],
          component: 'TransactionStore.modifyTransaction'
        }
      );

      throw error;
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
    if (currentStepOfAddTransaction.value < totalSteps.value - 1) {
      currentStepOfAddTransaction.value++;
    }
  }

  const prevStepToAddTransaction = () => {
    if (currentStepOfAddTransaction.value > 0) {
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
    itemToAddInTransaction.value.unit = product.unit;
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

  const setExpenseDescription = (description) => { transactionToAdd.value.description = description; };
  const setExpenseAmount = (amount) => { transactionToAdd.value.amount = Number(amount) || 0; };
  const setExpenseCategory = (category) => { transactionToAdd.value.category = category; }; // 'materials'|'labor'|'overhead'
  const setExpenseSubcategory = (subcategory) => { transactionToAdd.value.subcategory = subcategory; }; // 'office'|'travel'|'utilities' etc.

  // Funciones para manejar transferencias
  const setTransferFromAccount = (fromAccount) => { transactionToAdd.value.fromAccount = fromAccount; };
  const setTransferToAccount = (toAccount) => { transactionToAdd.value.toAccount = toAccount; };

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
      // Obtener la transacción antes de eliminarla para trazabilidad
      const transactionToDelete = transactionsInStore.value.find(t => t.uuid === transactionID);

      if (!transactionToDelete) {
        throw new Error(`Transaction with ID ${transactionID} not found in store`);
      }

      // === TRAZABILIDAD: Log de eliminación ===
      const traceId = await logTransactionOperation(
        'delete',
        transactionID,
        transactionToDelete,
        {
          reason: 'user_transaction_deletion',
          severity: 'high',
          tags: ['transaction_delete', 'data_removal'],
          component: 'TransactionStore.deleteOneTransactionByID'
        }
      );

      // Eliminar de Firebase
      await deleteTransactionByID(transactionID);
      console.log('✅ Transaction deleted successfully in FIRESTORE with traceId:', traceId);

      // Actualizar el store local
      await getTransactions();

    } catch (error) {
      console.error('❌ Error deleting transaction: ', error);

      // === TRAZABILIDAD: Log de error ===
      await logTransactionOperation(
        'error',
        transactionID,
        { error: error.message },
        {
          reason: 'transaction_deletion_failed',
          severity: 'critical',
          tags: ['transaction_error', 'deletion_failure'],
          component: 'TransactionStore.deleteOneTransactionByID'
        }
      );

      throw error;
    }
  };

  const getSteps = () => {
    const baseSteps = [
      "IncomeOrExpense",
      "CashOrBank",
      "AddIncomeOrExpense",
      "Summary",
    ];
    return transactionsInStore.value.length === 0
      ? ["CajaDiaria", ...baseSteps]
      : baseSteps;
  };

  const totalSteps = computed(() => getSteps().length);


  const hasCajaDiaria = computed(() => getSteps()[0] === "CajaDiaria");


  return {
    transactionsInStore,
    transactionToAdd,
    currentStepOfAddTransaction,
    itemToAddInTransaction,
    status,
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
    setExpenseDescription,
    setExpenseAmount,
    setExpenseCategory,
    setTransferFromAccount,
    setTransferToAccount,
    removeItemToTransaction,
    getSteps,
    totalSteps,
    hasCajaDiaria
  };
}