//  @/src/stores/transaction/transactionStore.js 

import { ref, computed } from 'vue';

import { useTransaccion } from '@/composables/useTransaction';
import { useInventory } from '@/composables/useInventory';
import { useTraceability } from '@/composables/useTraceability';
import { useExpenses } from '@/composables/useExpenses';
import { round2, multiplyMoney, addMoney, parseMoneyFloat } from '@/utils/mathUtils';
import { serverTimestamp } from 'firebase/firestore';

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
  amount: 0,
  expenseId: null, // ID del expense individual en Firestore
  oldOrNewExpense: null, // 'new' o 'old'
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
  stock: null,
  trackStock: false,
  proceedAnyway: false, // Flag para indicar que se procedió con stock insuficiente
});


const currentStepOfAddTransaction = ref(0);

export function useTransactionStore() {
  const { createTransaction, updateTransaction, getAllTransactions, deleteTransactionByID, getTransactionsTodayCmps, getTransactionsByDay, getLastClosureTransactions } = useTransaccion();
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

          // Agregar transactionId al item para registrarlo en el stockLog
          const itemWithTransaction = {
            ...item,
            transactionId: transactionToAdd.value.uuid,
            // IMPORTANTE: quantity siempre es la cantidad solicitada por el usuario
            // El ajuste de stock se hace en updateStock() de useInventory
            quantity: item.quantity,
            // Pasar también la cantidad máxima disponible para el ajuste
            quantityForStock: item.quantityForStock
          };

          // Log de advertencia si se vendió con stock insuficiente
          if (item.proceedAnyway && item.requestedQuantity > item.actualQuantity) {
            console.warn('⚠️ Venta con stock insuficiente:', {
              producto: item.description,
              cantidadSolicitada: item.requestedQuantity,
              cantidadRealDescontada: item.actualQuantity,
              stockDisponible: item.stock,
              mensaje: 'StockLog registrará la cantidad solicitada, pero el stock solo se reducirá según disponibilidad'
            });
          }

          const stockLogUuid = await createStockLog(itemWithTransaction);
          const itemUuid = item.uuid;
          const itemStockLog = { itemUuid, stockLogUuid };
          transactionToAdd.value.itemsAndStockLogs.push(itemStockLog);
        }
      } else if (transactionToAdd.value.type === 'expense') {
        transactionToAdd.value.amount = transactionToAdd.value.amount || 0;

        // Importar funciones de useExpenses para gestionar expenses
        const { createExpenseWithLog, addLogToExpense, updateExpenseMetadata } = useExpenses();

        // Preparar log data (usar new Date() en lugar de serverTimestamp para arrays)
        const logData = {
          amount: transactionToAdd.value.amount,
          date: new Date(), // Usar Date() en lugar de serverTimestamp()
          transactionRef: transactionToAdd.value.uuid,
          account: transactionToAdd.value.account,
          notes: null
        };

        let expenseId = null;

        // Verificar si es expense nuevo o existente
        if (transactionToAdd.value.oldOrNewExpense === 'old' && transactionToAdd.value.expenseId) {
          // Expense existente: agregar log
          expenseId = transactionToAdd.value.expenseId;

          console.log('📊 Agregando log a expense existente:', {
            expenseId,
            amount: logData.amount,
            description: transactionToAdd.value.description
          });

          await addLogToExpense(expenseId, logData);
          await updateExpenseMetadata(expenseId);

          console.log('✅ Log agregado y metadata actualizada para expense:', expenseId);
        } else {
          // Expense nuevo: crear con primer log
          const expenseData = {
            description: transactionToAdd.value.description,
            category: transactionToAdd.value.category,
            subcategory: transactionToAdd.value.subcategory || null,
          };

          console.log('✨ Creando nuevo expense con primer log:', expenseData);

          expenseId = await createExpenseWithLog(expenseData, logData);

          // Actualizar el expenseId en la transacción
          transactionToAdd.value.expenseId = expenseId;

          console.log('✅ Nuevo expense creado con ID:', expenseId);
        }

        // === TRAZABILIDAD: Log de gasto relacionado ===
        relatedEntities.push({
          type: 'expense',
          id: expenseId,
          relationship: 'generates_expense_log',
          impact: 'medium',
          metadata: {
            isNew: transactionToAdd.value.oldOrNewExpense === 'new',
            category: transactionToAdd.value.category,
            amount: transactionToAdd.value.amount
          }
        });

        // Mantener compatibilidad con expensesStore (legacy)
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

  /**
   * Obtiene las transacciones de un día específico y las almacena en transactionsInStore
   * @param {string} dayString - Fecha en formato 'yyyy-MM-dd'
   */
  const getTransactionsByDayStore = async (dayString) => {
    try {
      // === TRAZABILIDAD: Log de acceso a datos del día específico ===
      await logTransactionOperation(
        'read',
        'day_transactions',
        { action: 'fetch_day_transactions', date: dayString },
        {
          reason: 'data_access_specific_day_transactions',
          severity: 'low',
          tags: ['data_read', 'transaction_list', 'daily_data', 'specific_date'],
          component: 'TransactionStore.getTransactionsByDayStore'
        }
      );

      transactionsInStore.value = await getTransactionsByDay(dayString);
      console.log(`✅ Transactions for ${dayString} fetched with traceability`);

    } catch (error) {
      console.error(`❌ Error fetching transactions for ${dayString}:`, error);

      // === TRAZABILIDAD: Log de error ===
      await logTransactionOperation(
        'error',
        'day_transactions',
        { error: error.message, date: dayString },
        {
          reason: 'fetch_day_transactions_failed',
          severity: 'medium',
          tags: ['data_error', 'fetch_failure', 'daily_data', 'specific_date'],
          component: 'TransactionStore.getTransactionsByDayStore'
        }
      );
    }
  }

  /**
   * Obtiene las últimas transacciones de tipo "closure" del negocio
   * @param {number} limit - Número de transacciones a obtener (por defecto 5)
   * @returns {Promise<Array>} Array de transacciones de cierre
   */
  const getLastClosures = async (limit = 5) => {
    try {
      // === TRAZABILIDAD: Log de acceso a datos ===
      await logTransactionOperation(
        'read',
        'last_closure_transactions',
        { action: 'fetch_last_closures', limit },
        {
          reason: 'data_access_last_closures',
          severity: 'low',
          tags: ['data_read', 'closure_list', 'historical_data'],
          component: 'TransactionStore.getLastClosures'
        }
      );

      const closures = await getLastClosureTransactions(limit);
      console.log(`✅ Last ${closures.length} closure transactions fetched with traceability`);

      return closures;

    } catch (error) {
      console.error('❌ Error fetching last closures:', error);

      // === TRAZABILIDAD: Log de error ===
      await logTransactionOperation(
        'error',
        'last_closure_transactions',
        { error: error.message },
        {
          reason: 'fetch_last_closures_failed',
          severity: 'medium',
          tags: ['data_error', 'fetch_failure', 'historical_data'],
          component: 'TransactionStore.getLastClosures'
        }
      );

      return [];
    }
  };

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
      expenseId: null,
      oldOrNewExpense: null,
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
    // Si no hay items o el array está vacío, devolver el amount o 0
    if (!transactionToAdd.value.items || transactionToAdd.value.items.length === 0) {
      return round2(transactionToAdd.value.amount || 0);
    }

    // Calcular total basado en items
    const total = transactionToAdd.value.items.reduce((sum, item) => {
      return addMoney(sum, multiplyMoney(item.price, item.quantity));
    }, 0);
    return round2(total);
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
    itemToAddInTransaction.value.stock = product.stock ?? null;
    itemToAddInTransaction.value.trackStock = product.trackStock ?? false;
  }

  const resetItemToAddInTransaction = () => {
    itemToAddInTransaction.value = {
      description: null,
      quantity: null,
      price: null,
      oldOrNewProduct: null,
      selectedProductUuid: null,
      unit: null,
      stock: null,
      trackStock: false,
      proceedAnyway: false,
    };
  }

  const resetTransactionInStore = () => {
    transactionsInStore.value = [];
  }

  const setExpenseDescription = (description) => { transactionToAdd.value.description = description; };
  const setExpenseAmount = (amount) => { transactionToAdd.value.amount = parseMoneyFloat(amount); };
  const setExpenseCategory = (category) => { transactionToAdd.value.category = category; }; // 'materials'|'labor'|'overhead'
  const setExpenseSubcategory = (subcategory) => { transactionToAdd.value.subcategory = subcategory; }; // 'office'|'travel'|'utilities' etc.

  // Funciones para manejar transferencias
  const setTransferFromAccount = (fromAccount) => { transactionToAdd.value.fromAccount = fromAccount; };
  const setTransferToAccount = (toAccount) => { transactionToAdd.value.toAccount = toAccount; };

  const addItemToTransaction = () => {
    const item = { ...itemToAddInTransaction.value };

    // Si el producto tiene seguimiento de stock y se marcó "proceder de todos modos"
    if (item.trackStock && item.proceedAnyway) {
      const requestedQuantity = parseFloat(item.quantity) || 0;
      const availableStock = parseFloat(item.stock) || 0;

      // Calcular la cantidad real que se puede vender
      const actualQuantity = Math.min(requestedQuantity, availableStock);

      // Guardar la cantidad solicitada original y la cantidad real
      item.requestedQuantity = requestedQuantity;
      item.actualQuantity = actualQuantity;

      // La cantidad que se registrará en el stock es la real
      item.quantityForStock = actualQuantity;

      console.log('📊 Agregando item con stock insuficiente:', {
        descripcion: item.description,
        cantidadSolicitada: requestedQuantity,
        stockDisponible: availableStock,
        cantidadReal: actualQuantity,
        stockFinal: availableStock - actualQuantity
      });
    }

    transactionToAdd.value.items.push(item);

    // Resetear el item
    itemToAddInTransaction.value = {
      description: null,
      quantity: null,
      price: null,
      oldOrNewProduct: null,
      selectedProductUuid: null,
      unit: null,
      stock: null,
      trackStock: false,
      proceedAnyway: false,
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

  // Función helper para verificar si una transacción es de hoy
  const isTransactionFromToday = (transaction) => {
    if (!transaction.createdAt) return false;

    const today = new Date();
    const transactionDate = transaction.createdAt.toDate ? transaction.createdAt.toDate() : new Date(transaction.createdAt);

    return (
      transactionDate.getDate() === today.getDate() &&
      transactionDate.getMonth() === today.getMonth() &&
      transactionDate.getFullYear() === today.getFullYear()
    );
  };

  // Función para verificar si hay un cierre hoy
  const hasClosureToday = () => {
    return transactionsInStore.value.some(
      (transaction) => transaction.type === "closure" && isTransactionFromToday(transaction)
    );
  };

  return {
    transactionsInStore,
    transactionToAdd,
    currentStepOfAddTransaction,
    itemToAddInTransaction,
    status,
    addTransaction,
    getTransactions,
    getTransactionsToday,
    getTransactionsByDayStore,
    getLastClosures,
    getOneTransactionDataByID,
    getAllIncomeTransactionsInStore,
    getAllExpenseTransactionsInStore,
    getAllCashTransactionsInStore,
    getAllBankTransactionsInStore,
    deleteOneTransactionByID,
    resetTransactionToAdd,
    resetTransactionInStore,
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
    hasCajaDiaria,
    hasClosureToday,
    isTransactionFromToday
  };
}