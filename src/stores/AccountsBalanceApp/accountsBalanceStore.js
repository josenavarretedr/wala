import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

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

  // ===== ESTADO DE DATOS DE FLUJO (STEPS) =====
  const stepsData = ref({
    lastClosureData: null,
    openingData: null,
    expectedCashBalance: 0,
    expectedBankBalance: 0,
    selectedCashOption: null,
    realCashBalance: 0,
    selectedBankOption: null,
    realBankBalance: 0,
  });

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

  // ===== GESTIÓN DE DATOS DE FLUJO (STEPS) =====

  /**
   * Actualiza los datos recopilados de los steps
   * @param {string} stepLabel - Etiqueta del step
   * @param {Object} data - Datos a actualizar
   */
  const updateStepData = (stepLabel, data) => {
    stepsData.value = {
      ...stepsData.value,
      ...data,
    };
    console.log(`📝 [accountsBalanceStore] Datos actualizados para ${stepLabel}:`, data);
  };

  /**
   * Resetea todos los datos de steps al estado inicial
   */
  const resetStepsData = () => {
    stepsData.value = {
      lastClosureData: null,
      openingData: null,
      expectedCashBalance: 0,
      expectedBankBalance: 0,
      selectedCashOption: null,
      realCashBalance: 0,
      selectedBankOption: null,
      realBankBalance: 0,
    };
  };

  // ===== CÁLCULOS DE INGRESOS =====

  /**
   * Total de ingresos reales (ventas), excluyendo ajustes
   */
  const totalIngresos = computed(() => {
    return transactions.value
      .filter(tx => tx.type === 'income' && tx.category !== 'adjustment')
      .reduce((sum, tx) => sum + (tx.amount || 0), 0);
  });

  /**
   * Ingresos por efectivo, excluyendo ajustes de apertura
   */
  const ingresosCash = computed(() => {
    return transactions.value
      .filter(tx =>
        tx.type === 'income' &&
        tx.account === 'cash' &&
        tx.subcategory !== 'opening_adjustment'
      )
      .reduce((sum, tx) => sum + (tx.amount || 0), 0);
  });

  /**
   * Ingresos por banco/digital, excluyendo ajustes de apertura
   */
  const ingresosBank = computed(() => {
    return transactions.value
      .filter(tx =>
        tx.type === 'income' &&
        tx.account === 'bank' &&
        tx.subcategory !== 'opening_adjustment'
      )
      .reduce((sum, tx) => sum + (tx.amount || 0), 0);
  });

  // ===== CÁLCULOS DE EGRESOS =====

  /**
   * Total de egresos operativos, excluyendo ajustes
   */
  const totalEgresos = computed(() => {
    return transactions.value
      .filter(tx => tx.type === 'expense' && tx.category !== 'adjustment')
      .reduce((sum, tx) => sum + (tx.amount || 0), 0);
  });

  /**
   * Egresos por efectivo, excluyendo ajustes
   */
  const egresosCash = computed(() => {
    return transactions.value
      .filter(tx =>
        tx.type === 'expense' &&
        tx.category !== 'adjustment' &&
        tx.account === 'cash'
      )
      .reduce((sum, tx) => sum + (tx.amount || 0), 0);
  });

  /**
   * Egresos por banco/digital, excluyendo ajustes
   */
  const egresosBank = computed(() => {
    return transactions.value
      .filter(tx =>
        tx.type === 'expense' &&
        tx.category !== 'adjustment' &&
        tx.account === 'bank'
      )
      .reduce((sum, tx) => sum + (tx.amount || 0), 0);
  });

  // ===== CÁLCULOS DE TRANSFERENCIAS =====

  /**
   * Transferencias que SALEN de efectivo (cash -> bank)
   */
  const transferenciasSalidaCash = computed(() => {
    return transactions.value
      .filter(tx => tx.type === 'transfer' && tx.fromAccount === 'cash')
      .reduce((sum, tx) => sum + (tx.amount || 0), 0);
  });

  /**
   * Transferencias que ENTRAN a efectivo (bank -> cash)
   */
  const transferenciasEntradaCash = computed(() => {
    return transactions.value
      .filter(tx => tx.type === 'transfer' && tx.toAccount === 'cash')
      .reduce((sum, tx) => sum + (tx.amount || 0), 0);
  });

  /**
   * Transferencias que SALEN de banco (bank -> cash)
   */
  const transferenciasSalidaBank = computed(() => {
    return transactions.value
      .filter(tx => tx.type === 'transfer' && tx.fromAccount === 'bank')
      .reduce((sum, tx) => sum + (tx.amount || 0), 0);
  });

  /**
   * Transferencias que ENTRAN a banco (cash -> bank)
   */
  const transferenciasEntradaBank = computed(() => {
    return transactions.value
      .filter(tx => tx.type === 'transfer' && tx.toAccount === 'bank')
      .reduce((sum, tx) => sum + (tx.amount || 0), 0);
  });

  /**
   * Efecto neto de transferencias en efectivo (entradas - salidas)
   */
  const efectoTransferenciasEnCash = computed(() => {
    return transferenciasEntradaCash.value - transferenciasSalidaCash.value;
  });

  /**
   * Efecto neto de transferencias en banco (entradas - salidas)
   */
  const efectoTransferenciasEnBank = computed(() => {
    return transferenciasEntradaBank.value - transferenciasSalidaBank.value;
  });

  /**
   * Total de transferencias realizadas (sin considerar dirección)
   */
  const totalTransferencias = computed(() => {
    return transactions.value
      .filter(tx => tx.type === 'transfer')
      .reduce((sum, tx) => sum + (tx.amount || 0), 0);
  });

  // ===== CÁLCULOS DE AJUSTES =====

  /**
   * Ajustes por apertura - efectivo
   */
  const ajustesAperturaCash = computed(() => {
    const ingresosAjuste = transactions.value
      .filter(tx =>
        tx.type === 'income' &&
        tx.subcategory === 'opening_adjustment' &&
        tx.account === 'cash'
      )
      .reduce((s, tx) => s + (tx.amount || 0), 0);

    const egresosAjuste = transactions.value
      .filter(tx =>
        tx.type === 'expense' &&
        tx.subcategory === 'opening_adjustment' &&
        tx.account === 'cash'
      )
      .reduce((s, tx) => s + (tx.amount || 0), 0);

    return ingresosAjuste - egresosAjuste;
  });

  /**
   * Ajustes por apertura - banco
   */
  const ajustesAperturaBank = computed(() => {
    const ingresosAjuste = transactions.value
      .filter(tx =>
        tx.type === 'income' &&
        tx.subcategory === 'opening_adjustment' &&
        tx.account === 'bank'
      )
      .reduce((s, tx) => s + (tx.amount || 0), 0);

    const egresosAjuste = transactions.value
      .filter(tx =>
        tx.type === 'expense' &&
        tx.subcategory === 'opening_adjustment' &&
        tx.account === 'bank'
      )
      .reduce((s, tx) => s + (tx.amount || 0), 0);

    return ingresosAjuste - egresosAjuste;
  });

  /**
   * Ajustes por cierre - efectivo
   */
  const ajustesCierreCash = computed(() => {
    const ingresosAjuste = transactions.value
      .filter(tx =>
        tx.type === 'income' &&
        tx.subcategory === 'closure_adjustment' &&
        tx.account === 'cash'
      )
      .reduce((s, tx) => s + (tx.amount || 0), 0);

    const egresosAjuste = transactions.value
      .filter(tx =>
        tx.type === 'expense' &&
        tx.subcategory === 'closure_adjustment' &&
        tx.account === 'cash'
      )
      .reduce((s, tx) => s + (tx.amount || 0), 0);

    return ingresosAjuste - egresosAjuste;
  });

  /**
   * Ajustes por cierre - banco
   */
  const ajustesCierreBank = computed(() => {
    const ingresosAjuste = transactions.value
      .filter(tx =>
        tx.type === 'income' &&
        tx.subcategory === 'closure_adjustment' &&
        tx.account === 'bank'
      )
      .reduce((s, tx) => s + (tx.amount || 0), 0);

    const egresosAjuste = transactions.value
      .filter(tx =>
        tx.type === 'expense' &&
        tx.subcategory === 'closure_adjustment' &&
        tx.account === 'bank'
      )
      .reduce((s, tx) => s + (tx.amount || 0), 0);

    return ingresosAjuste - egresosAjuste;
  });

  /**
   * Total de ajustes (apertura + cierre)
   */
  const totalAjustes = computed(() => {
    return ajustesAperturaCash.value + ajustesAperturaBank.value +
      ajustesCierreCash.value + ajustesCierreBank.value;
  });

  /**
   * Total de ajustes (apertura + cierre)
   */
  const totalAjustesApertura = computed(() => {
    return ajustesAperturaCash.value + ajustesAperturaBank.value;
  });

  /**
   *  Total de ajustes (apertura + cierre)
   */
  const totalAjustesCierre = computed(() => {
    return ajustesCierreCash.value + ajustesCierreBank.value;
  });


  // ===== SALDOS INICIALES =====

  /**
   * Saldo inicial de efectivo según apertura
   */
  const saldoInicialCash = computed(() => {
    console.log("***************************");
    console.log('Apertura:', openingTransaction.value);
    return openingTransaction.value?.realCashBalance ||
      openingTransaction.value?.totalCash || 0;
  });

  /**
   * Saldo inicial de banco según apertura
   */
  const saldoInicialBank = computed(() => {
    return openingTransaction.value?.realBankBalance ||
      openingTransaction.value?.totalBank || 0;
  });

  /**
   * Saldo inicial total
   */
  const saldoInicial = computed(() => {
    return saldoInicialCash.value + saldoInicialBank.value;
  });

  // ===== BALANCES ESPERADOS/PROYECTADOS =====

  /**
   * Balance esperado de efectivo (saldo inicial + movimientos operativos + transferencias)
   */
  const expectedFinalCash = computed(() => {
    return saldoInicialCash.value + resultadoOperacionalCash.value + efectoTransferenciasEnCash.value;
  });

  /**
   * Balance esperado de banco (saldo inicial + movimientos operativos + transferencias)
   */
  const expectedFinalBank = computed(() => {
    return saldoInicialBank.value + resultadoOperacionalBank.value + efectoTransferenciasEnBank.value;
  });

  /**
   * Balance total esperado
   */
  const expectedFinalTotal = computed(() => {
    return expectedFinalCash.value + expectedFinalBank.value;
  });

  // ===== BALANCES ACTUALES/REALES =====

  /**
   * Saldo actual de efectivo (incluye transferencias y ajustes)
   */
  const saldoActualCash = computed(() => {
    return expectedFinalCash.value + ajustesCierreCash.value;
  });

  /**
   * Saldo actual de banco (incluye transferencias y ajustes)
   */
  const saldoActualBank = computed(() => {
    return expectedFinalBank.value + ajustesCierreBank.value;
  });

  /**
   * Saldo actual total
   */
  const saldoActual = computed(() => {
    return saldoActualCash.value + saldoActualBank.value;
  });

  // ===== RESULTADOS OPERACIONALES =====

  /**
   * Resultado operacional del día (ventas - gastos, SIN ajustes)
   * Este es el KPI principal del negocio
   */
  const resultadoOperacional = computed(() => {
    return totalIngresos.value - totalEgresos.value;
  });

  /**
   * Resultado operacional por efectivo (SIN transferencias)
   */
  const resultadoOperacionalCash = computed(() => {
    return ingresosCash.value - egresosCash.value;
  });

  /**
   * Resultado operacional por banco (SIN transferencias)
   */
  const resultadoOperacionalBank = computed(() => {
    return ingresosBank.value - egresosBank.value;
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
    resetStepsData();
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

  // ===== FUNCIONES DE APERTURA Y CIERRE =====

  /**
   * Construye la transacción de apertura con los datos proporcionados
   * @param {Object} params - Parámetros de la apertura
   * @param {number} params.expectedCashBalance - Balance esperado de efectivo
   * @param {number} params.expectedBankBalance - Balance esperado de banco
   * @param {number} params.realCashBalance - Balance real de efectivo
   * @param {number} params.realBankBalance - Balance real de banco
   * @param {string} params.lastClosureUuid - UUID del último cierre (opcional)
   * @param {Function} params.generateUUID - Función para generar UUIDs
   * @returns {Object} Transacción de apertura
   */
  const buildOpeningTransaction = ({
    expectedCashBalance,
    expectedBankBalance,
    realCashBalance,
    realBankBalance,
    lastClosureUuid = null,
    generateUUID,
  }) => {
    const cashDiff = calculateDifference(realCashBalance, expectedCashBalance);
    const bankDiff = calculateDifference(realBankBalance, expectedBankBalance);

    return {
      uuid: generateUUID(),
      type: 'opening',
      description: 'Apertura de caja',
      expectedCashBalance,
      expectedBankBalance,
      realCashBalance,
      realBankBalance,
      // Campos compatibles con CardOpening.vue
      totalCash: realCashBalance,
      totalBank: realBankBalance,
      cashAmount: realCashBalance,
      bankAmount: realBankBalance,
      cashDifference: cashDiff,
      bankDifference: bankDiff,
      lastClosureReference: lastClosureUuid,
      items: [],
      itemsAndStockLogs: [],
      amount: 0,
    };
  };

  /**
   * Construye transacciones de ajuste para apertura si hay diferencias
   * @param {Object} params - Parámetros de los ajustes
   * @param {number} params.cashDifference - Diferencia en efectivo
   * @param {number} params.bankDifference - Diferencia en banco
   * @param {Function} params.generateUUID - Función para generar UUIDs
   * @returns {Array} Array de transacciones de ajuste
   */
  const buildOpeningAdjustments = ({
    cashDifference,
    bankDifference,
    generateUUID,
  }) => {
    const adjustments = [];

    // Ajuste de efectivo
    if (isSignificantDifference(cashDifference)) {
      adjustments.push({
        uuid: generateUUID(),
        type: cashDifference > 0 ? 'income' : 'expense',
        account: 'cash',
        description: `Ajuste de apertura - Efectivo (${cashDifference > 0 ? 'Sobrante' : 'Faltante'
          })`,
        amount: Math.abs(cashDifference),
        category: 'adjustment',
        subcategory: 'opening_adjustment',
        isSystemGenerated: true,
        items: [],
        itemsAndStockLogs: [],
      });
    }

    // Ajuste de banco
    if (isSignificantDifference(bankDifference)) {
      adjustments.push({
        uuid: generateUUID(),
        type: bankDifference > 0 ? 'income' : 'expense',
        account: 'bank',
        description: `Ajuste de apertura - Yape/Plin (${bankDifference > 0 ? 'Sobrante' : 'Faltante'
          })`,
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
   * Construye la transacción de cierre con los datos proporcionados
   * @param {Object} params - Parámetros del cierre
   * @param {string} params.openingUuid - UUID de la apertura del día
   * @param {number} params.realCashBalance - Balance real de efectivo
   * @param {number} params.realBankBalance - Balance real de banco
   * @param {Function} params.generateUUID - Función para generar UUIDs
   * @returns {Object} Transacción de cierre
   */
  const buildClosureTransaction = ({
    openingUuid,
    realCashBalance,
    realBankBalance,
    generateUUID,
  }) => {
    const summary = financialSummary.value;
    const cashDiff = calculateDifference(realCashBalance, summary.expectedFinalCash);
    const bankDiff = calculateDifference(realBankBalance, summary.expectedFinalBank);

    return {
      uuid: generateUUID(),
      type: 'closure',
      description: 'Cierre de caja',
      // Datos de apertura de referencia
      openingReference: openingUuid,
      initialCashBalance: summary.saldoInicialCash,
      initialBankBalance: summary.saldoInicialBank,
      // Movimientos del día (desde el store)
      totalIngresos: summary.totalIngresos,
      totalEgresos: summary.totalEgresos,
      ingresosCash: summary.ingresosCash,
      ingresosBank: summary.ingresosBank,
      egresosCash: summary.egresosCash,
      egresosBank: summary.egresosBank,
      // Balances esperados vs reales
      expectedCashBalance: summary.expectedFinalCash,
      expectedBankBalance: summary.expectedFinalBank,
      realCashBalance,
      realBankBalance,
      // Campos compatibles con CardClosure.vue
      cashAmount: realCashBalance,
      bankAmount: realBankBalance,
      // Diferencias
      cashDifference: cashDiff,
      bankDifference: bankDiff,
      // Campos requeridos
      items: [],
      itemsAndStockLogs: [],
      amount: 0,
    };
  };

  /**
   * Construye transacciones de ajuste para cierre si hay diferencias
   * @param {Object} params - Parámetros de los ajustes
   * @param {number} params.cashDifference - Diferencia en efectivo
   * @param {number} params.bankDifference - Diferencia en banco
   * @param {Function} params.generateUUID - Función para generar UUIDs
   * @returns {Array} Array de transacciones de ajuste
   */
  const buildClosureAdjustments = ({
    cashDifference,
    bankDifference,
    generateUUID,
  }) => {
    const adjustments = [];

    // Ajuste de efectivo
    if (isSignificantDifference(cashDifference)) {
      adjustments.push({
        uuid: generateUUID(),
        type: cashDifference > 0 ? 'income' : 'expense',
        account: 'cash',
        description: `Ajuste de cierre - Efectivo (${cashDifference > 0 ? 'Sobrante' : 'Faltante'
          })`,
        amount: Math.abs(cashDifference),
        category: 'adjustment',
        subcategory: 'closure_adjustment',
        isSystemGenerated: true,
        items: [],
        itemsAndStockLogs: [],
      });
    }

    // Ajuste de banco
    if (isSignificantDifference(bankDifference)) {
      adjustments.push({
        uuid: generateUUID(),
        type: bankDifference > 0 ? 'income' : 'expense',
        account: 'bank',
        description: `Ajuste de cierre - Digital (${bankDifference > 0 ? 'Sobrante' : 'Faltante'
          })`,
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

  return {
    // Estado
    transactions,
    openingTransaction,
    stepsData,

    // Setters
    setTransactions,
    setOpening,
    reset,
    updateTransactions,

    // Gestión de datos de flujo (steps)
    updateStepData,
    resetStepsData,

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

    // Funciones de apertura y cierre
    buildOpeningTransaction,
    buildOpeningAdjustments,
    buildClosureTransaction,
    buildClosureAdjustments,
  };
});
