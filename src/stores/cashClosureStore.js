import { ref, computed } from 'vue';
import { useTransaccion } from '@/composables/useTransaction';
import { useCashClosure } from '@/composables/useCashClosure'; // Importa useCashClosure
import { v4 as uuidv4 } from "uuid";

const cashClosureForToday = ref(true);

const allCashClosures = ref([]);

const expectedBalances = ref({
  cash: 0,
  bank: 0,
});

const realBalances = ref({
  cash: null,
  bank: null,
});

const differences = ref({
  cash: 0,
  bank: 0,
});

const isClosingCash = ref(false);
const cashClosureToAdd = ref({
  uuid: null,
  date: null,
  accounts: [],
  status: null,
  notes: null,
});

export function useCashClosureStore() {
  const { getTransactionsTodayCmps, createTransaction } = useTransaccion();
  const { createCashClosure, checkCashClosureForToday, getCashClosuresForBusiness } = useCashClosure(); // Usa useCashClosure composable // Importa createCashClosure



  const accounts = ['cash', 'bank'];

  const startCashClosureProcess = async () => {
    isClosingCash.value = true;
    await calculateExpectedBalances();
  };

  const calculateExpectedBalances = async () => {
    expectedBalances.value.cash = 0;
    expectedBalances.value.bank = 0;

    try {
      const transactionsToday = await getTransactionsTodayCmps();

      transactionsToday.forEach(transaction => {
        if (transaction.account === 'cash') {
          if (transaction.type === 'income') {
            expectedBalances.value.cash += transaction.total;
          } else if (transaction.type === 'expense') {
            expectedBalances.value.cash -= transaction.total;
          }
        } else if (transaction.account === 'bank') {
          if (transaction.type === 'income') {
            expectedBalances.value.bank += transaction.total;
          } else if (transaction.type === 'expense') {
            expectedBalances.value.bank -= transaction.total;
          }
        }
      });
      console.log('Expected Balances Calculated:', expectedBalances.value);

    } catch (error) {
      console.error('Error calculating expected balances:', error);
      isClosingCash.value = false;
      throw error;
    }
  };

  const setrealBalance = (account, amount) => {
    realBalances.value[account] = parseFloat(amount);
    calculateDifferences();
  };

  const calculateDifferences = () => {
    differences.value.cash = (realBalances.value.cash !== null ? realBalances.value.cash : 0) - expectedBalances.value.cash;
    differences.value.bank = (realBalances.value.bank !== null ? realBalances.value.bank : 0) - expectedBalances.value.bank;
    console.log('Differences Calculated:', differences.value);
  };

  const performCashClosure = async () => {

    cashClosureToAdd.value.uuid = uuidv4();
    cashClosureToAdd.value.date = new Date();
    cashClosureToAdd.value.accounts = [];

    let closureStatus = 'success';

    for (const accountName of accounts) {
      let adjustmentTransactionUuid = null;
      let accountDifference = differences.value[accountName];

      if (accountDifference !== 0) {
        closureStatus = 'success_with_adjustments';

        const adjustmentTransaction = await createAdjustmentTransaction(accountName, accountDifference);
        adjustmentTransactionUuid = adjustmentTransaction.uuid;
      }

      cashClosureToAdd.value.accounts.push({
        account: accountName,
        expectedBalance: expectedBalances.value[accountName],
        realBalance: realBalances.value[accountName],
        difference: accountDifference,
        adjustmentTransactionUuid: adjustmentTransactionUuid,
      });
    }

    cashClosureToAdd.value.status = closureStatus;

    try {
      await createCashClosure(cashClosureToAdd.value); // Llama a createCashClosure de useCashClosure para guardar en Firestore
      console.log('Cash closure data saved to Firestore');
    } catch (error) {
      console.error('Error saving cash closure data to Firestore:', error);
      // Considerar como manejar el error en la UI (mostrar mensaje al usuario, reintento, etc.)
    }


    return cashClosureToAdd.value;

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


  const resetCashClosureState = () => {
    realBalances.value.cash = null;
    realBalances.value.bank = null;
    differences.value.cash = 0;
    differences.value.bank = 0;
    cashClosureToAdd.value = {
      uuid: null,
      date: null,
      accounts: [],
      status: null,
      notes: null,
    };
  };

  const expectedCashBalance = computed(() => expectedBalances.value.cash);
  const expectedBankBalance = computed(() => expectedBalances.value.bank);
  const cashDifference = computed(() => differences.value.cash);
  const bankDifference = computed(() => differences.value.bank);
  const isClosing = computed(() => isClosingCash.value);
  const cashClosureDataToSave = computed(() => cashClosureToAdd.value); // Getter para acceder a cashClosureToAdd en la UI // Nuevo Getter
  const closureAccounts = computed(() => cashClosureToAdd.value.accounts); // Getter para las cuentas del cierre // Nuevo Getter

  const getCashClosureForToday = async () => {
    try {
      cashClosureForToday.value = await checkCashClosureForToday();
    } catch (error) {
      console.error('Error fetching cash closure for today:', error);
      throw error;
    }
  };

  const getAllCashClosures = async () => {
    try {
      allCashClosures.value = await getCashClosuresForBusiness();
    } catch (error) {
      console.error('Error fetching all cash closures:', error);
      throw error;
    }
  };

  const streakCashClosures = computed(() => {
    if (allCashClosures.value.length === 0) return 0;

    const sortedClosures = allCashClosures.value.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    let streakCount = 1;
    let currentDate = new Date();

    for (const closure of sortedClosures) {
      const closureDate = new Date(closure.createdAt);
      const previousDate = new Date(currentDate);
      previousDate.setDate(currentDate.getDate() - 1);

      if (closureDate.toDateString() === previousDate.toDateString()) {
        streakCount++;
        currentDate = closureDate;
      } else {
        break;
      }
    }

    return streakCount;
  });

  const hasClosureForToday = computed(() => {
    const today = new Date().toDateString();
    return allCashClosures.value.some(closure => new Date(closure.createdAt).toDateString() === today);
  });

  return {
    expectedBalances,
    realBalances,
    differences,
    isClosingCash,
    cashClosureForToday,
    startCashClosureProcess,
    calculateExpectedBalances,
    setrealBalance,
    calculateDifferences,
    performCashClosure,
    resetCashClosureState,
    expectedCashBalance,
    expectedBankBalance,
    cashDifference,
    bankDifference,
    isClosing,
    accounts,
    cashClosureDataToSave, // Exporta el nuevo getter
    closureAccounts, // Exporta el nuevo getter
    getCashClosureForToday,
    getAllCashClosures,
    streakCashClosures,
    hasClosureForToday
  };
}