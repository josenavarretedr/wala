// src/stores/cashClosureStore.js

/**
 * Store para gestionar el proceso de cierre de caja.
 * Este store centraliza los estados, cálculos, validaciones y escritura en Firestore relacionados al cierre diario de caja.
 */

import { ref, computed } from 'vue';
import { v4 as uuidv4 } from "uuid";
import { useTransaccion } from '@/composables/useTransaction';
import { useCashClosure } from '@/composables/useCashClosure';

// 🔁 Estados reactivos
const cashClosureForToday = ref(true);
const allCashClosures = ref([]);

const expectedBalances = ref({ cash: 0, bank: 0 });
const realBalances = ref({ cash: null, bank: null });
const differences = ref({ cash: 0, bank: 0 });

const isClosingCash = ref(false);

// 📦 Datos del cierre a guardar
const cashClosureToAdd = ref({
  uuid: null,
  date: null,
  accounts: [],
  status: null,
  notes: null,
});

// Store principal
export function useCashClosureStore() {
  const { getTransactionsTodayCmps, createTransaction } = useTransaccion();
  const {
    createCashClosure,
    checkCashClosureForToday,
    getCashClosuresForBusiness,
  } = useCashClosure();

  const accounts = ['cash', 'bank'];

  /**
   * Inicia el proceso de cierre de caja calculando saldos esperados.
   */
  const startCashClosureProcess = async () => {
    isClosingCash.value = true;
    await calculateExpectedBalances();
  };

  /**
   * Calcula los saldos esperados del día en base a las transacciones registradas.
   */
  const calculateExpectedBalances = async () => {
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
      isClosingCash.value = false;
      throw error;
    }
  };

  /**
   * Establece el saldo real ingresado por el usuario y recalcula diferencias.
   */
  const setrealBalance = (account, amount) => {
    realBalances.value[account] = parseFloat(amount);
    calculateDifferences();
  };

  /**
   * Calcula la diferencia entre saldo real y esperado por cuenta.
   */
  const calculateDifferences = () => {
    ['cash', 'bank'].forEach(account => {
      differences.value[account] =
        (realBalances.value[account] ?? 0) - expectedBalances.value[account];
    });
  };

  /**
   * Realiza el cierre de caja completo, incluyendo ajustes si hay diferencias.
   */
  const performCashClosure = async () => {
    cashClosureToAdd.value.uuid = uuidv4();
    cashClosureToAdd.value.date = new Date();
    cashClosureToAdd.value.accounts = [];

    let closureStatus = 'success';

    for (const accountName of accounts) {
      let adjustmentTransactionUuid = null;
      const accountDifference = differences.value[accountName];

      // Si hay diferencia, se registra transacción de ajuste
      if (accountDifference !== 0) {
        closureStatus = 'success_with_adjustments';
        const adjustmentTransaction = await createAdjustmentTransaction(accountName, accountDifference);
        adjustmentTransactionUuid = adjustmentTransaction.uuid;
      }

      // Se agrega info por cuenta
      cashClosureToAdd.value.accounts.push({
        account: accountName,
        expectedBalance: expectedBalances.value[accountName],
        realBalance: realBalances.value[accountName],
        difference: accountDifference,
        adjustmentTransactionUuid,
      });
    }

    cashClosureToAdd.value.status = closureStatus;

    try {
      await createCashClosure(cashClosureToAdd.value);
    } catch (error) {
      console.error('Error al guardar el cierre de caja en Firestore:', error);
      throw error;
    }

    return cashClosureToAdd.value;
  };

  /**
   * Crea una transacción de ajuste si hay diferencia de saldo.
   */
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

  /**
   * Reinicia todos los estados del cierre de caja (limpia formulario).
   */
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

  /**
   * Verifica si ya existe un cierre de caja para el día actual.
   */
  const getCashClosureForToday = async () => {
    try {
      cashClosureForToday.value = await checkCashClosureForToday();
    } catch (error) {
      console.error('Error verificando cierre de caja de hoy:', error);
      throw error;
    }
  };

  /**
   * Obtiene todos los cierres de caja del negocio actual.
   */
  const getAllCashClosures = async () => {
    try {
      allCashClosures.value = await getCashClosuresForBusiness();
    } catch (error) {
      console.error('Error obteniendo todos los cierres de caja:', error);
      throw error;
    }
  };

  /**
   * Calcula el streak de días consecutivos con cierre de caja.
   */
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
    return allCashClosures.value.some(
      closure => new Date(closure.createdAt).toDateString() === today
    );
  });

  return {
    // estados
    expectedBalances,
    realBalances,
    differences,
    isClosingCash,
    cashClosureForToday,
    allCashClosures,

    // acciones
    startCashClosureProcess,
    calculateExpectedBalances,
    setrealBalance,
    calculateDifferences,
    performCashClosure,
    resetCashClosureState,
    getCashClosureForToday,
    getAllCashClosures,

    // computadas
    expectedCashBalance: computed(() => expectedBalances.value.cash),
    expectedBankBalance: computed(() => expectedBalances.value.bank),
    cashDifference: computed(() => differences.value.cash),
    bankDifference: computed(() => differences.value.bank),
    isClosing: computed(() => isClosingCash.value),
    cashClosureDataToSave: computed(() => cashClosureToAdd.value),
    closureAccounts: computed(() => cashClosureToAdd.value.accounts),
    streakCashClosures,
    hasClosureForToday,
    accounts,
  };
}
