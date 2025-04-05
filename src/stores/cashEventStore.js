// Store para gestionar eventos de caja: apertura (inicio del día) y cierre (fin del día).

import { ref, computed } from 'vue';
import { v4 as uuidv4 } from "uuid";
import { useTransaccion } from '@/composables/useTransaction';
import { useCashEvent } from '@/composables/useCashEvent';

const cashEventsForToday = ref([]);
const allCashEvents = ref([]);

const expectedBalances = ref({ cash: 0, bank: 0 });
const realBalances = ref({ cash: null, bank: null });
const differences = ref({ cash: 0, bank: 0 });

const isProcessingCash = ref(false);

const cashEventToAdd = ref({
  uuid: null,
  date: null,
  type: null, // 'opening' | 'closure'
  accounts: [],
  status: null,
  notes: null,
});

export function useCashEventStore() {
  const { getTransactionsTodayCmps, createTransaction } = useTransaccion();
  const {
    createCashEvent,
    checkCashEventForToday,
    getCashEventsForBusiness,
  } = useCashEvent();

  const accounts = ['cash', 'bank'];

  const startCashEventProcess = async (type) => {
    isProcessingCash.value = true;
    if (type === 'closure') {
      await calculateExpectedBalancesFromTransactions();
    } else {
      expectedBalances.value.cash = 0;
      expectedBalances.value.bank = 0;
    }
  };

  const calculateExpectedBalancesFromTransactions = async () => {
    expectedBalances.value.cash = 0;
    expectedBalances.value.bank = 0;

    try {
      const transactionsToday = await getTransactionsTodayCmps();
      transactionsToday.forEach(transaction => {
        const { account, type, total } = transaction;
        if (account === 'cash') {
          expectedBalances.value.cash += type === 'income' ? total : -total;
        } else if (account === 'bank') {
          expectedBalances.value.bank += type === 'income' ? total : -total;
        }
      });
    } catch (error) {
      console.error('Error al calcular saldos esperados:', error);
      isProcessingCash.value = false;
      throw error;
    }
  };

  const setRealBalance = (account, amount) => {
    realBalances.value[account] = parseFloat(amount);
    calculateDifferences();
  };

  const calculateDifferences = () => {
    ['cash', 'bank'].forEach(account => {
      differences.value[account] =
        (realBalances.value[account] ?? 0) - expectedBalances.value[account];
    });
  };

  const registerCashEventTransaction = async (eventData) => {
    const transaction = {
      uuid: uuidv4(),
      type: eventData.type, // 'opening' o 'closure'
      eventUuid: eventData.uuid,
      date: eventData.date,
      totalCash: realBalances.value.cash,
      totalBank: realBalances.value.bank,
      status: eventData.status,
      accounts: eventData.accounts,
      createdAt: new Date(),
    };
    await createTransaction(transaction);
    console.log('Transacción de evento de caja registrada:', transaction);
  };


  const performCashEvent = async (type) => {
    cashEventToAdd.value.uuid = uuidv4();
    cashEventToAdd.value.date = new Date();
    cashEventToAdd.value.type = type;
    cashEventToAdd.value.accounts = [];

    let eventStatus = 'success';

    for (const accountName of accounts) {
      let adjustmentTransactionUuid = null;
      const accountDifference = differences.value[accountName];

      if (type === 'closure' && accountDifference !== 0) {
        eventStatus = 'success_with_adjustments';
        const adjustmentTransaction = await createAdjustmentTransaction(accountName, accountDifference);
        adjustmentTransactionUuid = adjustmentTransaction.uuid;
      }

      cashEventToAdd.value.accounts.push({
        account: accountName,
        expectedBalance: expectedBalances.value[accountName],
        realBalance: realBalances.value[accountName],
        difference: accountDifference,
        adjustmentTransactionUuid,
      });
    }

    cashEventToAdd.value.status = eventStatus;

    try {
      console.log('QUe fue antes?')
      await createCashEvent(cashEventToAdd.value);
      await registerCashEventTransaction(cashEventToAdd.value);
    } catch (error) {
      console.error('Error al guardar el evento de caja en Firestore:', error);
      throw error;
    }

    return cashEventToAdd.value;
  };

  const createAdjustmentTransaction = async (accountName, difference) => {
    const adjustmentTransaction = {
      uuid: uuidv4(),
      type: difference > 0 ? 'income' : 'expense',
      account: accountName,
      description: `Ajuste de cierre de caja - ${difference > 0 ? 'Sobrante' : 'Faltante'}`,
      cost: Math.abs(difference),
      total: Math.abs(difference),
      createdAt: new Date(),
    };
    await createTransaction(adjustmentTransaction);
    return adjustmentTransaction;
  };

  const resetCashEventState = () => {
    realBalances.value.cash = null;
    realBalances.value.bank = null;
    differences.value.cash = 0;
    differences.value.bank = 0;
    cashEventToAdd.value = {
      uuid: null,
      date: null,
      type: null,
      accounts: [],
      status: null,
      notes: null,
    };
  };

  const getCashEventForToday = async (type) => {
    try {
      cashEventsForToday.value = await checkCashEventForToday(type);
    } catch (error) {
      console.error('Error verificando evento de caja de hoy:', error);
      throw error;
    }
  };

  const getAllCashEvents = async () => {
    try {
      allCashEvents.value = await getCashEventsForBusiness();
    } catch (error) {
      console.error('Error obteniendo eventos de caja:', error);
      throw error;
    }
  };

  return {
    expectedBalances,
    realBalances,
    differences,
    isProcessingCash,
    cashEventsForToday,
    allCashEvents,

    startCashEventProcess,
    setRealBalance,
    calculateDifferences,
    performCashEvent,
    resetCashEventState,
    getCashEventForToday,
    getAllCashEvents,

    expectedCashBalance: computed(() => expectedBalances.value.cash),
    expectedBankBalance: computed(() => expectedBalances.value.bank),
    cashDifference: computed(() => differences.value.cash),
    bankDifference: computed(() => differences.value.bank),
    cashEventDataToSave: computed(() => cashEventToAdd.value),
    eventAccounts: computed(() => cashEventToAdd.value.accounts),
    accounts,
  };
}
