// Store para gestionar eventos de caja: apertura (inicio del día) y cierre (fin del día).

import { ref, computed } from 'vue';
import { v4 as uuidv4 } from "uuid";
import { useTransaccion } from '@/composables/useTransaction';
import { useCashEvent } from '@/composables/useCashEvent';
import { round2, addMoney, subtractMoney, parseMoneyFloat } from '@/utils/mathUtils';
import { trackDayOpened, trackDayClosed, getNetResult } from '@/analytics';
import { ensureBusinessId } from '@/composables/useBusinessUtils';
import { useDailySummary } from '@/composables/useDailySummary';

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

  const saldoInicial = ref({
    cash: 0,
    bank: 0,
  });

  const calcularSaldoInicial = async () => {
    try {
      const transactionsToday = await getTransactionsTodayCmps();
      const opening = transactionsToday.find((tx) => tx.type === "opening");
      if (opening) {
        saldoInicial.value.cash = round2(opening.totalCash || 0);
        saldoInicial.value.bank = round2(opening.totalBank || 0);
      } else {
        saldoInicial.value.cash = 0;
        saldoInicial.value.bank = 0;
      }
    } catch (error) {
      console.error("Error calculando saldo inicial:", error);
      saldoInicial.value.cash = 0;
      saldoInicial.value.bank = 0;
    }
  };



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

    await calcularSaldoInicial();

    expectedBalances.value.cash = 0;
    expectedBalances.value.bank = 0;

    try {
      const transactionsToday = await getTransactionsTodayCmps();
      transactionsToday.forEach(transaction => {
        const { account, type, total } = transaction;
        if (account === 'cash') {
          expectedBalances.value.cash = addMoney(
            expectedBalances.value.cash,
            type === 'income' ? total : -total
          );
        } else if (account === 'bank') {
          expectedBalances.value.bank = addMoney(
            expectedBalances.value.bank,
            type === 'income' ? total : -total
          );
        }
      });
      expectedBalances.value.cash = addMoney(expectedBalances.value.cash, saldoInicial.value.cash);
      expectedBalances.value.bank = addMoney(expectedBalances.value.bank, saldoInicial.value.bank);

    } catch (error) {
      console.error('Error al calcular saldos esperados:', error);
      isProcessingCash.value = false;
      throw error;
    }
  };

  const setRealBalance = (account, amount) => {
    realBalances.value[account] = parseMoneyFloat(amount);
    calculateDifferences();
  };

  const calculateDifferences = () => {
    ['cash', 'bank'].forEach(account => {
      differences.value[account] = subtractMoney(
        realBalances.value[account] ?? 0,
        expectedBalances.value[account]
      );
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

      // === ANALYTICS: Trackear evento de apertura o cierre ===
      try {
        const businessId = ensureBusinessId();
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const dayId = `${year}-${month}-${day}`;

        if (type === 'opening') {
          // Calcular días desde última transacción válida
          let daysSinceLastValidTransaction = null;
          try {
            const { getDailySummary } = useDailySummary();
            // Buscar el día anterior
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
            const yesterdaySummary = await getDailySummary(yesterdayStr);

            if (yesterdaySummary && yesterdaySummary.day) {
              daysSinceLastValidTransaction = 1;
            }
          } catch (summaryError) {
            console.warn('⚠️ No se pudo calcular días desde última transacción:', summaryError);
          }

          trackDayOpened({
            businessId,
            dayId,
            daysSinceLastValidTransaction
          });
        } else if (type === 'closure') {
          // Contar transacciones y calcular net result
          const transactionsToday = await getTransactionsTodayCmps();
          const validTransactions = transactionsToday.filter(tx =>
            tx.type === 'income' || tx.type === 'expense'
          );
          const transactionsCount = validTransactions.length;

          // Calcular net result desde los saldos esperados
          const netTotal = expectedBalances.value.cash + expectedBalances.value.bank;
          const netResult = getNetResult(netTotal);

          trackDayClosed({
            businessId,
            dayId,
            transactionsCount,
            netResult
          });
        }
      } catch (analyticsError) {
        console.warn('⚠️ Error al trackear evento de analytics:', analyticsError);
        // No lanzar error, el evento se guardó correctamente
      }
    } catch (error) {
      console.error('Error al guardar el evento de caja en Firestore:', error);
      throw error;
    }

    return cashEventToAdd.value;
  };

  const createAdjustmentTransaction = async (accountName, difference) => {
    const absValue = round2(Math.abs(difference));
    const adjustmentTransaction = {
      uuid: uuidv4(),
      type: difference > 0 ? 'income' : 'expense',
      account: accountName,
      description: `Ajuste de cierre de caja - ${difference > 0 ? 'Sobrante' : 'Faltante'}`,
      cost: absValue,
      total: absValue,
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
      console.log('Eventos de caja obtenidos:', allCashEvents.value);
    } catch (error) {
      console.error('Error obteniendo eventos de caja:', error);
      throw error;
    }
  };

  const streakCashEvents = computed(() => {
    if (allCashEvents.value.length === 0) return 0;

    // Filtrar solo eventos de tipo cierre
    const closures = allCashEvents.value
      .filter(e => e.type === 'closure' && e.createdAt)
      .sort((a, b) => new Date(b.createdAt.seconds * 1000) - new Date(a.createdAt.seconds * 1000));

    let streakCount = 0;
    let currentDate = new Date();

    for (const closure of closures) {
      const closureDate = new Date(closure.createdAt.seconds * 1000);
      const previousDate = new Date(currentDate);
      previousDate.setDate(currentDate.getDate() - 1);

      if (closureDate.toDateString() === currentDate.toDateString()) {
        // Cierre hoy
        streakCount++;
      } else if (closureDate.toDateString() === previousDate.toDateString()) {
        // Cierre ayer, sigue racha
        streakCount++;
        currentDate = closureDate;
      } else {
        break; // racha interrumpida
      }
    }

    return streakCount;
  });

  const hasClosureForToday = computed(() => {
    const today = new Date().toDateString();
    return allCashEvents.value.some(
      e => e.type === 'closure' && new Date(e.createdAt.seconds * 1000).toDateString() === today
    );
  });




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

    streakCashEvents,
    hasClosureForToday,

    saldoInicial,
    calcularSaldoInicial,
  };
}
