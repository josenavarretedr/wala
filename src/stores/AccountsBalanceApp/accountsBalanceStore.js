// accountsBalanceStore.js

import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { round2, addMoney, subtractMoney, sumTransactions } from '@/utils/mathUtils';

/**
 * Store para cálculos financieros y balance de cuentas
 * Equivalente al flujo de caja empresarial
 * 
 * Este store recibe datos de transacciones y proporciona todos los cálculos financieros
 * necesarios de forma reutilizable y consistente
 */
export const useAccountsBalanceStore = defineStore('accountsBalance', () => {
  // ===== ESTADO =====
  const transactions = ref([]);
  const openingTransaction = ref(null);

  // ===== SETTERS PARA CONFIGURAR DATOS =====

  /**
   * Establece las transacciones para realizar cálculos
   * @param {Array} transactionsData - Array de transacciones
   */
  const setTransactions = (transactionsData = []) => {
    transactions.value = transactionsData;

    // Buscar automáticamente la apertura en las transacciones
    const opening = transactionsData.find(tx => tx.type === 'opening');
    openingTransaction.value = opening || null;
  };

  /**
   * Establece específicamente la transacción de apertura
   * @param {Object} opening - Transacción de apertura
   */
  const setOpening = (opening) => {
    openingTransaction.value = opening;
  };

  // ===== CÁLCULOS DE INGRESOS =====

  /**
   * Total de ingresos reales (ventas), excluyendo ajustes
   */
  const totalIngresos = computed(() => {
    return sumTransactions(
      transactions.value.filter(tx => tx.type === 'income' && tx.category !== 'adjustment')
    );
  });

  /**
   * Ingresos por efectivo, excluyendo ajustes de apertura
   */
  const ingresosCash = computed(() => {
    return sumTransactions(
      transactions.value.filter(tx =>
        tx.type === 'income' &&
        tx.account === 'cash' &&
        tx.subcategory !== 'opening_adjustment'
      )
    );
  });

  /**
   * Ingresos por banco/digital, excluyendo ajustes de apertura
   */
  const ingresosBank = computed(() => {
    return sumTransactions(
      transactions.value.filter(tx =>
        tx.type === 'income' &&
        tx.account === 'bank' &&
        tx.subcategory !== 'opening_adjustment'
      )
    );
  });

  // ===== CÁLCULOS DE EGRESOS =====

  /**
   * Total de egresos operativos, excluyendo ajustes
   */
  const totalEgresos = computed(() => {
    return sumTransactions(
      transactions.value.filter(tx => tx.type === 'expense' && tx.category !== 'adjustment')
    );
  });

  /**
   * Egresos por efectivo, excluyendo ajustes
   */
  const egresosCash = computed(() => {
    return sumTransactions(
      transactions.value.filter(tx =>
        tx.type === 'expense' &&
        tx.category !== 'adjustment' &&
        tx.account === 'cash'
      )
    );
  });

  /**
   * Egresos por banco/digital, excluyendo ajustes
   */
  const egresosBank = computed(() => {
    return sumTransactions(
      transactions.value.filter(tx =>
        tx.type === 'expense' &&
        tx.category !== 'adjustment' &&
        tx.account === 'bank'
      )
    );
  });

  // ===== CÁLCULOS DE TRANSFERENCIAS =====

  /**
   * Transferencias que SALEN de efectivo (cash -> bank)
   */
  const transferenciasSalidaCash = computed(() => {
    return sumTransactions(
      transactions.value.filter(tx => tx.type === 'transfer' && tx.fromAccount === 'cash')
    );
  });

  /**
   * Transferencias que ENTRAN a efectivo (bank -> cash)
   */
  const transferenciasEntradaCash = computed(() => {
    return sumTransactions(
      transactions.value.filter(tx => tx.type === 'transfer' && tx.toAccount === 'cash')
    );
  });

  /**
   * Transferencias que SALEN de banco (bank -> cash)
   */
  const transferenciasSalidaBank = computed(() => {
    return sumTransactions(
      transactions.value.filter(tx => tx.type === 'transfer' && tx.fromAccount === 'bank')
    );
  });

  /**
   * Transferencias que ENTRAN a banco (cash -> bank)
   */
  const transferenciasEntradaBank = computed(() => {
    return sumTransactions(
      transactions.value.filter(tx => tx.type === 'transfer' && tx.toAccount === 'bank')
    );
  });

  /**
   * Efecto neto de transferencias en efectivo (entradas - salidas)
   */
  const efectoTransferenciasEnCash = computed(() => {
    return subtractMoney(transferenciasEntradaCash.value, transferenciasSalidaCash.value);
  });

  /**
   * Efecto neto de transferencias en banco (entradas - salidas)
   */
  const efectoTransferenciasEnBank = computed(() => {
    return subtractMoney(transferenciasEntradaBank.value, transferenciasSalidaBank.value);
  });

  /**
   * Total de transferencias realizadas (sin considerar dirección)
   */
  const totalTransferencias = computed(() => {
    return sumTransactions(
      transactions.value.filter(tx => tx.type === 'transfer')
    );
  });

  // ===== CÁLCULOS DE AJUSTES =====

  /**
   * Ajustes por apertura - efectivo
   */
  const ajustesAperturaCash = computed(() => {
    const ingresosAjuste = sumTransactions(
      transactions.value.filter(tx =>
        tx.type === 'income' &&
        tx.subcategory === 'opening_adjustment' &&
        tx.account === 'cash'
      )
    );

    const egresosAjuste = sumTransactions(
      transactions.value.filter(tx =>
        tx.type === 'expense' &&
        tx.subcategory === 'opening_adjustment' &&
        tx.account === 'cash'
      )
    );

    return subtractMoney(ingresosAjuste, egresosAjuste);
  });

  /**
   * Ajustes por apertura - banco
   */
  const ajustesAperturaBank = computed(() => {
    const ingresosAjuste = sumTransactions(
      transactions.value.filter(tx =>
        tx.type === 'income' &&
        tx.subcategory === 'opening_adjustment' &&
        tx.account === 'bank'
      )
    );

    const egresosAjuste = sumTransactions(
      transactions.value.filter(tx =>
        tx.type === 'expense' &&
        tx.subcategory === 'opening_adjustment' &&
        tx.account === 'bank'
      )
    );

    return subtractMoney(ingresosAjuste, egresosAjuste);
  });

  /**
   * Ajustes por cierre - efectivo
   */
  const ajustesCierreCash = computed(() => {
    const ingresosAjuste = sumTransactions(
      transactions.value.filter(tx =>
        tx.type === 'income' &&
        tx.subcategory === 'closure_adjustment' &&
        tx.account === 'cash'
      )
    );

    const egresosAjuste = sumTransactions(
      transactions.value.filter(tx =>
        tx.type === 'expense' &&
        tx.subcategory === 'closure_adjustment' &&
        tx.account === 'cash'
      )
    );

    return subtractMoney(ingresosAjuste, egresosAjuste);
  });

  /**
   * Ajustes por cierre - banco
   */
  const ajustesCierreBank = computed(() => {
    const ingresosAjuste = sumTransactions(
      transactions.value.filter(tx =>
        tx.type === 'income' &&
        tx.subcategory === 'closure_adjustment' &&
        tx.account === 'bank'
      )
    );

    const egresosAjuste = sumTransactions(
      transactions.value.filter(tx =>
        tx.type === 'expense' &&
        tx.subcategory === 'closure_adjustment' &&
        tx.account === 'bank'
      )
    );

    return subtractMoney(ingresosAjuste, egresosAjuste);
  });

  /**
   * Total de ajustes (apertura + cierre)
   */
  const totalAjustes = computed(() => {
    return addMoney(
      ajustesAperturaCash.value,
      ajustesAperturaBank.value,
      ajustesCierreCash.value,
      ajustesCierreBank.value
    );
  });

  /**
   * Total de ajustes de apertura solamente
   */
  const totalAjustesApertura = computed(() => {
    return addMoney(ajustesAperturaCash.value, ajustesAperturaBank.value);
  });

  /**
   * Total de ajustes de cierre solamente
   */
  const totalAjustesCierre = computed(() => {
    console.log("=== CALCULO TOTAL AJUSTES CIERRE EN STORE ===");
    console.log("Transacciones en store:", transactions.value.length);

    // Debug: Filtrar transacciones con ajustes de cierre
    const ajustesCierreTx = transactions.value.filter(tx =>
      tx.subcategory === 'closure_adjustment'
    );
    console.log("Transacciones con closure_adjustment:", ajustesCierreTx);

    console.log("Ajustes cierre Cash:", ajustesCierreCash.value);
    console.log("Ajustes cierre Bank:", ajustesCierreBank.value);
    const total = addMoney(ajustesCierreCash.value, ajustesCierreBank.value);
    console.log("Total calculado:", total);
    return total;
  });

  // ===== SALDOS INICIALES =====

  /**
   * Saldo inicial de efectivo según apertura
   */
  const saldoInicialCash = computed(() => {
    return round2(openingTransaction.value?.realCashBalance ||
      openingTransaction.value?.totalCash || 0);
  });

  /**
   * Saldo inicial de banco según apertura
   */
  const saldoInicialBank = computed(() => {
    return round2(openingTransaction.value?.realBankBalance ||
      openingTransaction.value?.totalBank || 0);
  });

  /**
   * Saldo inicial total
   */
  const saldoInicial = computed(() => {
    return addMoney(saldoInicialCash.value, saldoInicialBank.value);
  });

  // ===== BALANCES ESPERADOS/PROYECTADOS =====

  /**
   * Balance esperado de efectivo (saldo inicial + movimientos operativos + transferencias)
   */
  const expectedFinalCash = computed(() => {
    return addMoney(
      saldoInicialCash.value,
      ingresosCash.value,
      -egresosCash.value,
      efectoTransferenciasEnCash.value
    );
  });

  /**
   * Balance esperado de banco (saldo inicial + movimientos operativos + transferencias)
   */
  const expectedFinalBank = computed(() => {
    return addMoney(
      saldoInicialBank.value,
      ingresosBank.value,
      -egresosBank.value,
      efectoTransferenciasEnBank.value
    );
  });

  /**
   * Balance total esperado
   */
  const expectedFinalTotal = computed(() => {
    return addMoney(expectedFinalCash.value, expectedFinalBank.value);
  });

  // ===== BALANCES ACTUALES/REALES =====

  /**
   * Saldo actual de efectivo (incluye transferencias y ajustes)
   */
  const saldoActualCash = computed(() => {
    return addMoney(
      saldoInicialCash.value,
      ingresosCash.value,
      -egresosCash.value,
      efectoTransferenciasEnCash.value,
      ajustesCierreCash.value
    );
  });

  /**
   * Saldo actual de banco (incluye transferencias y ajustes)
   */
  const saldoActualBank = computed(() => {
    return addMoney(
      saldoInicialBank.value,
      ingresosBank.value,
      -egresosBank.value,
      efectoTransferenciasEnBank.value,
      ajustesCierreBank.value
    );
  });

  /**
   * Saldo actual total
   */
  const saldoActual = computed(() => {
    return addMoney(saldoActualCash.value, saldoActualBank.value);
  });

  // ===== RESULTADOS OPERACIONALES =====

  /**
   * Resultado operacional del día (ventas - gastos, SIN ajustes)
   * Este es el KPI principal del negocio
   */
  const resultadoOperacional = computed(() => {
    return subtractMoney(totalIngresos.value, totalEgresos.value);
  });

  /**
   * Resultado operacional por efectivo (SIN transferencias)
   */
  const resultadoOperacionalCash = computed(() => {
    return subtractMoney(ingresosCash.value, egresosCash.value);
  });

  /**
   * Resultado operacional por banco (SIN transferencias)
   */
  const resultadoOperacionalBank = computed(() => {
    return subtractMoney(ingresosBank.value, egresosBank.value);
  });

  /**
   * Flujo neto de efectivo (resultado operacional + transferencias)
   */
  const flujoNetoCash = computed(() => {
    return resultadoOperacionalCash.value + efectoTransferenciasEnCash.value;
  });

  /**
   * Flujo neto de banco (resultado operacional + transferencias)
   */
  const flujoNetoBank = computed(() => {
    return resultadoOperacionalBank.value + efectoTransferenciasEnBank.value;
  });

  // ===== UTILIDADES PARA CÁLCULO DE DIFERENCIAS =====

  /**
   * Calcula diferencia entre un valor real y esperado
   * @param {number} realValue - Valor real contado
   * @param {number} expectedValue - Valor esperado según sistema
   * @returns {number} Diferencia (real - esperado)
   */
  const calculateDifference = (realValue, expectedValue) => {
    return (realValue || 0) - (expectedValue || 0);
  };

  /**
   * Verifica si una diferencia es significativa (> 0.01)
   * @param {number} difference - Diferencia a evaluar
   * @returns {boolean} True si la diferencia es significativa
   */
  const isSignificantDifference = (difference) => {
    return Math.abs(difference || 0) > 0.01;
  };

  // ===== FUNCIONES DE VALIDACIÓN =====

  /**
   * Verifica si hay apertura configurada
   */
  const hasOpening = computed(() => {
    return !!openingTransaction.value;
  });

  /**
   * Verifica si hay transacciones cargadas
   */
  const hasTransactions = computed(() => {
    return transactions.value.length > 0;
  });

  /**
   * Verifica si el día tiene actividad financiera
   */
  const hasActivity = computed(() => {
    return totalIngresos.value > 0 || totalEgresos.value > 0;
  });

  // ===== FUNCIONES DE RESET =====

  /**
   * Limpia todos los datos del store
   */
  const reset = () => {
    transactions.value = [];
    openingTransaction.value = null;
  };

  /**
   * Actualiza solo las transacciones manteniendo la apertura
   */
  const updateTransactions = (newTransactions) => {
    transactions.value = newTransactions;
    // Actualizar apertura si existe en las nuevas transacciones
    const opening = newTransactions.find(tx => tx.type === 'opening');
    if (opening) {
      openingTransaction.value = opening;
    }
  };

  // ===== FUNCIONES DE CONSTRUCCIÓN DE TRANSACCIONES =====

  /**
   * Construye una transacción de apertura completa
   * @param {Object} params - Parámetros para la apertura
   * @param {number} params.expectedCashBalance - Balance esperado de efectivo
   * @param {number} params.expectedBankBalance - Balance esperado de banco
   * @param {number} params.realCashBalance - Balance real contado de efectivo
   * @param {number} params.realBankBalance - Balance real contado de banco
   * @param {string|null} params.lastClosureUuid - UUID del último cierre (opcional)
   * @param {Function} params.generateUUID - Función para generar UUIDs
   * @returns {Object} Transacción de apertura completa
   */
  const buildOpeningTransaction = ({
    expectedCashBalance,
    expectedBankBalance,
    realCashBalance,
    realBankBalance,
    lastClosureUuid = null,
    generateUUID
  }) => {
    const cashDiff = calculateDifference(realCashBalance, expectedCashBalance);
    const bankDiff = calculateDifference(realBankBalance, expectedBankBalance);

    return {
      uuid: generateUUID(),
      type: 'opening',
      description: 'Apertura de caja',
      expectedCashBalance: expectedCashBalance || 0,
      expectedBankBalance: expectedBankBalance || 0,
      realCashBalance: realCashBalance || 0,
      realBankBalance: realBankBalance || 0,
      // Campos compatibles con CardOpening.vue
      totalCash: realCashBalance || 0,
      totalBank: realBankBalance || 0,
      cashAmount: realCashBalance || 0,
      bankAmount: realBankBalance || 0,
      cashDifference: cashDiff,
      bankDifference: bankDiff,
      lastClosureReference: lastClosureUuid,
      items: [],
      itemsAndStockLogs: [],
      amount: 0,
    };
  };

  /**
   * Construye transacciones de ajuste para apertura
   * @param {Object} params - Parámetros para los ajustes
   * @param {number} params.cashDifference - Diferencia en efectivo
   * @param {number} params.bankDifference - Diferencia en banco
   * @param {Function} params.generateUUID - Función para generar UUIDs
   * @returns {Array} Array de transacciones de ajuste
   */
  const buildOpeningAdjustments = ({
    cashDifference,
    bankDifference,
    generateUUID
  }) => {
    const adjustments = [];

    // Ajuste de efectivo si hay diferencia significativa
    if (isSignificantDifference(cashDifference)) {
      adjustments.push({
        uuid: generateUUID(),
        type: cashDifference > 0 ? 'income' : 'expense',
        account: 'cash',
        description: `Ajuste de apertura - Efectivo (${cashDifference > 0 ? 'Sobrante' : 'Faltante'})`,
        amount: Math.abs(cashDifference),
        category: 'adjustment',
        subcategory: 'opening_adjustment',
        isSystemGenerated: true,
        items: [],
        itemsAndStockLogs: [],
      });
    }

    // Ajuste de banco si hay diferencia significativa
    if (isSignificantDifference(bankDifference)) {
      adjustments.push({
        uuid: generateUUID(),
        type: bankDifference > 0 ? 'income' : 'expense',
        account: 'bank',
        description: `Ajuste de apertura - Yape/Plin (${bankDifference > 0 ? 'Sobrante' : 'Faltante'})`,
        amount: Math.abs(bankDifference),
        category: 'adjustment',
        subcategory: 'opening_adjustment',
        isSystemGenerated: true,
        items: [],
        itemsAndStockLogs: [],
      });
    }

    return adjustments;
  };

  /**
   * Construye una transacción de cierre completa
   * @param {Object} params - Parámetros para el cierre
   * @param {string} params.openingUuid - UUID de la apertura del día
   * @param {number} params.realCashBalance - Balance real contado de efectivo
   * @param {number} params.realBankBalance - Balance real contado de banco
   * @param {Function} params.generateUUID - Función para generar UUIDs
   * @returns {Object} Transacción de cierre completa
   */
  const buildClosureTransaction = ({
    openingUuid,
    realCashBalance,
    realBankBalance,
    generateUUID
  }) => {
    // Calcular diferencias contra lo esperado
    const cashDiff = calculateDifference(realCashBalance, expectedFinalCash.value);
    const bankDiff = calculateDifference(realBankBalance, expectedFinalBank.value);

    return {
      uuid: generateUUID(),
      type: 'closure',
      description: 'Cierre de caja',
      openingReference: openingUuid,

      // Saldos iniciales (de la apertura)
      initialCashBalance: saldoInicialCash.value,
      initialBankBalance: saldoInicialBank.value,

      // Movimientos del día
      totalIngresos: totalIngresos.value,
      totalEgresos: totalEgresos.value,
      ingresosCash: ingresosCash.value,
      ingresosBank: ingresosBank.value,
      egresosCash: egresosCash.value,
      egresosBank: egresosBank.value,

      // Balances esperados
      expectedCashBalance: expectedFinalCash.value,
      expectedBankBalance: expectedFinalBank.value,

      // Balances reales contados
      realCashBalance: realCashBalance || 0,
      realBankBalance: realBankBalance || 0,

      // Campos compatibles
      totalCash: realCashBalance || 0,
      totalBank: realBankBalance || 0,
      cashAmount: realCashBalance || 0,
      bankAmount: realBankBalance || 0,

      // Diferencias
      cashDifference: cashDiff,
      bankDifference: bankDiff,

      items: [],
      itemsAndStockLogs: [],
      amount: 0,
    };
  };

  /**
   * Construye transacciones de ajuste para cierre
   * @param {Object} params - Parámetros para los ajustes
   * @param {number} params.cashDifference - Diferencia en efectivo
   * @param {number} params.bankDifference - Diferencia en banco
   * @param {Function} params.generateUUID - Función para generar UUIDs
   * @returns {Array} Array de transacciones de ajuste
   */
  const buildClosureAdjustments = ({
    cashDifference,
    bankDifference,
    generateUUID
  }) => {
    const adjustments = [];

    // Ajuste de efectivo si hay diferencia significativa
    if (isSignificantDifference(cashDifference)) {
      adjustments.push({
        uuid: generateUUID(),
        type: cashDifference > 0 ? 'income' : 'expense',
        account: 'cash',
        description: `Ajuste de cierre - Efectivo (${cashDifference > 0 ? 'Sobrante' : 'Faltante'})`,
        amount: Math.abs(cashDifference),
        category: 'adjustment',
        subcategory: 'closure_adjustment',
        isSystemGenerated: true,
        items: [],
        itemsAndStockLogs: [],
      });
    }

    // Ajuste de banco si hay diferencia significativa
    if (isSignificantDifference(bankDifference)) {
      adjustments.push({
        uuid: generateUUID(),
        type: bankDifference > 0 ? 'income' : 'expense',
        account: 'bank',
        description: `Ajuste de cierre - Yape/Plin (${bankDifference > 0 ? 'Sobrante' : 'Faltante'})`,
        amount: Math.abs(bankDifference),
        category: 'adjustment',
        subcategory: 'closure_adjustment',
        isSystemGenerated: true,
        items: [],
        itemsAndStockLogs: [],
      });
    }

    return adjustments;
  };

  // ===== OBJETO DE RESUMEN COMPLETO =====

  /**
   * Resumen completo de la situación financiera
   */
  const financialSummary = computed(() => ({
    // Saldos iniciales
    saldoInicial: saldoInicial.value,
    saldoInicialCash: saldoInicialCash.value,
    saldoInicialBank: saldoInicialBank.value,

    // Movimientos operativos
    totalIngresos: totalIngresos.value,
    totalEgresos: totalEgresos.value,
    ingresosCash: ingresosCash.value,
    ingresosBank: ingresosBank.value,
    egresosCash: egresosCash.value,
    egresosBank: egresosBank.value,

    // Transferencias
    totalTransferencias: totalTransferencias.value,
    transferenciasSalidaCash: transferenciasSalidaCash.value,
    transferenciasEntradaCash: transferenciasEntradaCash.value,
    transferenciasSalidaBank: transferenciasSalidaBank.value,
    transferenciasEntradaBank: transferenciasEntradaBank.value,
    efectoTransferenciasEnCash: efectoTransferenciasEnCash.value,
    efectoTransferenciasEnBank: efectoTransferenciasEnBank.value,

    // Resultados operacionales
    resultadoOperacional: resultadoOperacional.value,
    resultadoOperacionalCash: resultadoOperacionalCash.value,
    resultadoOperacionalBank: resultadoOperacionalBank.value,

    // Flujos netos (operacional + transferencias)
    flujoNetoCash: flujoNetoCash.value,
    flujoNetoBank: flujoNetoBank.value,

    // Ajustes
    totalAjustes: totalAjustes.value,
    totalAjustesApertura: totalAjustesApertura.value,
    totalAjustesCierre: totalAjustesCierre.value,
    ajustesAperturaCash: ajustesAperturaCash.value,
    ajustesAperturaBank: ajustesAperturaBank.value,
    ajustesCierreCash: ajustesCierreCash.value,
    ajustesCierreBank: ajustesCierreBank.value,

    // Saldos finales
    saldoActual: saldoActual.value,
    saldoActualCash: saldoActualCash.value,
    saldoActualBank: saldoActualBank.value,
    expectedFinalCash: expectedFinalCash.value,
    expectedFinalBank: expectedFinalBank.value,
    expectedFinalTotal: expectedFinalTotal.value,

    // Estado
    hasOpening: hasOpening.value,
    hasTransactions: hasTransactions.value,
    hasActivity: hasActivity.value,
  }));

  return {
    // Estado
    transactions,
    openingTransaction,

    // Setters
    setTransactions,
    setOpening,
    reset,
    updateTransactions,

    // Cálculos de ingresos
    totalIngresos,
    ingresosCash,
    ingresosBank,

    // Cálculos de egresos
    totalEgresos,
    egresosCash,
    egresosBank,

    // Cálculos de transferencias
    totalTransferencias,
    transferenciasSalidaCash,
    transferenciasEntradaCash,
    transferenciasSalidaBank,
    transferenciasEntradaBank,
    efectoTransferenciasEnCash,
    efectoTransferenciasEnBank,

    // Ajustes
    ajustesAperturaCash,
    ajustesAperturaBank,
    ajustesCierreCash,
    ajustesCierreBank,
    totalAjustes,
    totalAjustesApertura,
    totalAjustesCierre,

    // Saldos
    saldoInicial,
    saldoInicialCash,
    saldoInicialBank,
    saldoActual,
    saldoActualCash,
    saldoActualBank,

    // Balances esperados
    expectedFinalCash,
    expectedFinalBank,
    expectedFinalTotal,

    // Resultados operacionales
    resultadoOperacional,
    resultadoOperacionalCash,
    resultadoOperacionalBank,

    // Flujos netos (operacional + transferencias)
    flujoNetoCash,
    flujoNetoBank,

    // Utilidades
    calculateDifference,
    isSignificantDifference,

    // Validaciones
    hasOpening,
    hasTransactions,
    hasActivity,

    // Resumen completo
    financialSummary,

    // Funciones de construcción
    buildOpeningTransaction,
    buildOpeningAdjustments,
    buildClosureTransaction,
    buildClosureAdjustments,
  };
});
