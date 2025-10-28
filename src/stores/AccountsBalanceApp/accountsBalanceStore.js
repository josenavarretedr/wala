// accountsBalanceStore.js

import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { round2, addMoney, subtractMoney, sumTransactions } from '@/utils/mathUtils';
import { useDailySummary } from '@/composables/useDailySummary';

/**
 * Store para cálculos financieros y balance de cuentas
 * Equivalente al flujo de caja empresarial
 * 
 * 🚀 MIGRACIÓN A DAILYSUMMARY:
 * Este store ahora actúa como wrapper híbrido:
 * 1. Prioridad: Usar dailySummary (backend pre-calculado) si está disponible
 * 2. Fallback: Calcular manualmente desde transacciones si dailySummary no existe
 * 3. Mantener builders de transacciones (opening, closure, adjustments)
 * 
 * Ventajas:
 * - ✅ Consistencia total backend-frontend
 * - ✅ Cero cálculos en frontend (mejor rendimiento)
 * - ✅ Single source of truth (dailySummary)
 * - ✅ Retrocompatibilidad garantizada
 */
export const useAccountsBalanceStore = defineStore('accountsBalance', () => {
  // ===== ESTADO =====
  const transactions = ref([]);
  const openingTransaction = ref(null);

  // Estado para dailySummary (fuente primaria de datos)
  const dailySummary = ref(null);
  const isLoadingFromSummary = ref(false);
  const summaryLoadError = ref(null);

  // 🔥 NUEVO: Listener en tiempo real
  let dailySummaryUnsubscribe = null;

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

  // ===== NUEVO: CARGA DESDE DAILYSUMMARY =====

  /**
   * 🚀 NUEVO: Cargar datos desde dailySummary (backend pre-calculado)
   * Esta es la opción más eficiente y consistente.
   * 
   * @returns {Promise<boolean>} - True si se cargó exitosamente, false si no existe
   */
  const loadFromDailySummary = async () => {
    isLoadingFromSummary.value = true;
    summaryLoadError.value = null;

    try {
      console.log('📊 Cargando dailySummary...');
      const summary = await getDailySummaryComposable().getTodayDailySummary();

      if (summary) {
        dailySummary.value = summary;

        // 🔧 IMPORTANTE: Establecer openingTransaction desde dailySummary si existe
        if (summary.openingData && getDailySummaryComposable().hasOpening(summary)) {
          openingTransaction.value = {
            uuid: summary.openingData.id,
            type: 'opening',
            realCashBalance: summary.openingData.realCashBalance,
            realBankBalance: summary.openingData.realBankBalance,
            totalBalance: summary.openingData.totalBalance,
            // Campos adicionales que podrían existir
            expectedCashBalance: summary.balances.expected.cash,
            expectedBankBalance: summary.balances.expected.bank,
          };
          console.log('✅ OpeningTransaction establecida desde dailySummary');
        } else {
          openingTransaction.value = null;
          console.log('ℹ️ No hay opening en dailySummary');
        }

        console.log('✅ DailySummary cargado exitosamente');
        console.log('   - Ingresos:', getDailySummaryComposable().getTotalIngresos(summary));
        console.log('   - Egresos:', getDailySummaryComposable().getTotalEgresos(summary));
        console.log('   - Resultado:', getDailySummaryComposable().getResultadoOperacional(summary));
        console.log('   - Has Opening:', getDailySummaryComposable().hasOpening(summary));
        return true;
      } else {
        console.log('ℹ️ No existe dailySummary para hoy (se usará cálculo manual)');
        dailySummary.value = null;
        openingTransaction.value = null;
        return false;
      }
    } catch (error) {
      console.error('❌ Error cargando dailySummary:', error);
      summaryLoadError.value = error.message;
      dailySummary.value = null;
      openingTransaction.value = null;
      return false;
    } finally {
      isLoadingFromSummary.value = false;
    }
  };

  /**
   * 🚀 NUEVO: Cargar dailySummary de un día específico
   * 
   * @param {string} dayString - Fecha en formato 'yyyy-LL-dd'
   * @returns {Promise<boolean>} - True si se cargó exitosamente
   */
  const loadDailySummary = async (dayString) => {
    isLoadingFromSummary.value = true;
    summaryLoadError.value = null;

    try {
      const summary = await getDailySummaryComposable().getDailySummary(dayString);

      if (summary) {
        dailySummary.value = summary;

        // 🔧 IMPORTANTE: Establecer openingTransaction desde dailySummary si existe
        if (summary.openingData && getDailySummaryComposable().hasOpening(summary)) {
          openingTransaction.value = {
            uuid: summary.openingData.id,
            type: 'opening',
            realCashBalance: summary.openingData.realCashBalance,
            realBankBalance: summary.openingData.realBankBalance,
            totalBalance: summary.openingData.totalBalance,
            expectedCashBalance: summary.balances.expected.cash,
            expectedBankBalance: summary.balances.expected.bank,
          };
          console.log(`✅ OpeningTransaction de ${dayString} establecida`);
        } else {
          openingTransaction.value = null;
        }

        console.log(`✅ DailySummary de ${dayString} cargado`);
        return true;
      } else {
        dailySummary.value = null;
        openingTransaction.value = null;
        return false;
      }
    } catch (error) {
      console.error(`❌ Error cargando dailySummary de ${dayString}:`, error);
      summaryLoadError.value = error.message;
      dailySummary.value = null;
      openingTransaction.value = null;
      return false;
    } finally {
      isLoadingFromSummary.value = false;
    }
  };

  /**
   * Verifica si dailySummary está disponible
   * @returns {boolean}
   */
  const hasDailySummary = computed(() => dailySummary.value !== null);

  /**
   * Helper para obtener una nueva instancia del composable
   * Esto asegura reactividad correcta en los computed
   */
  const getDailySummaryComposable = () => useDailySummary();


  // ===== CÁLCULOS DE INGRESOS =====

  /**
   * Total de ingresos reales (ventas), excluyendo ajustes
   * 🚀 HÍBRIDO: Prioriza dailySummary, fallback a cálculo manual
   */
  const totalIngresos = computed(() => {
    // Prioridad 1: Usar dailySummary si está disponible
    if (hasDailySummary.value) {
      return getDailySummaryComposable().getTotalIngresos(dailySummary.value);
    }

    // Fallback: Calcular manualmente
    return sumTransactions(
      transactions.value.filter(tx => tx.type === 'income' && tx.category !== 'adjustment')
    );
  });

  /**
   * Ingresos por efectivo, excluyendo ajustes de apertura
   * 🚀 HÍBRIDO: Prioriza dailySummary, fallback a cálculo manual
   */
  const ingresosCash = computed(() => {
    // Prioridad 1: Usar dailySummary
    if (hasDailySummary.value) {
      return getDailySummaryComposable().getIngresosCash(dailySummary.value);
    }

    // Fallback: Calcular manualmente
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
   * 🚀 HÍBRIDO: Prioriza dailySummary, fallback a cálculo manual
   */
  const ingresosBank = computed(() => {
    // Prioridad 1: Usar dailySummary
    if (hasDailySummary.value) {
      return getDailySummaryComposable().getIngresosBank(dailySummary.value);
    }

    // Fallback: Calcular manualmente
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
   * 🚀 HÍBRIDO: Prioriza dailySummary, fallback a cálculo manual
   */
  const totalEgresos = computed(() => {
    // Prioridad 1: Usar dailySummary
    if (hasDailySummary.value) {
      return getDailySummaryComposable().getTotalEgresos(dailySummary.value);
    }

    // Fallback: Calcular manualmente
    return sumTransactions(
      transactions.value.filter(tx => tx.type === 'expense' && tx.category !== 'adjustment')
    );
  });

  /**
   * Egresos por efectivo, excluyendo ajustes
   * 🚀 HÍBRIDO: Prioriza dailySummary, fallback a cálculo manual
   */
  const egresosCash = computed(() => {
    // Prioridad 1: Usar dailySummary
    if (hasDailySummary.value) {
      return getDailySummaryComposable().getEgresosCash(dailySummary.value);
    }

    // Fallback: Calcular manualmente
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
   * 🚀 HÍBRIDO: Prioriza dailySummary, fallback a cálculo manual
   */
  const egresosBank = computed(() => {
    // Prioridad 1: Usar dailySummary
    if (hasDailySummary.value) {
      return getDailySummaryComposable().getEgresosBank(dailySummary.value);
    }

    // Fallback: Calcular manualmente
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
   * 🚀 HÍBRIDO: Prioriza dailySummary, fallback a cálculo manual
   */
  const transferenciasSalidaCash = computed(() => {
    if (hasDailySummary.value) {
      return getDailySummaryComposable().getNestedValue(dailySummary.value, 'transfers.cash.out', 0);
    }
    return sumTransactions(
      transactions.value.filter(tx => tx.type === 'transfer' && tx.fromAccount === 'cash')
    );
  });

  /**
   * Transferencias que ENTRAN a efectivo (bank -> cash)
   * 🚀 HÍBRIDO: Prioriza dailySummary, fallback a cálculo manual
   */
  const transferenciasEntradaCash = computed(() => {
    if (hasDailySummary.value) {
      return getDailySummaryComposable().getNestedValue(dailySummary.value, 'transfers.cash.in', 0);
    }
    return sumTransactions(
      transactions.value.filter(tx => tx.type === 'transfer' && tx.toAccount === 'cash')
    );
  });

  /**
   * Transferencias que SALEN de banco (bank -> cash)
   * 🚀 HÍBRIDO: Prioriza dailySummary, fallback a cálculo manual
   */
  const transferenciasSalidaBank = computed(() => {
    if (hasDailySummary.value) {
      return getDailySummaryComposable().getNestedValue(dailySummary.value, 'transfers.bank.out', 0);
    }
    return sumTransactions(
      transactions.value.filter(tx => tx.type === 'transfer' && tx.fromAccount === 'bank')
    );
  });

  /**
   * Transferencias que ENTRAN a banco (cash -> bank)
   * 🚀 HÍBRIDO: Prioriza dailySummary, fallback a cálculo manual
   */
  const transferenciasEntradaBank = computed(() => {
    if (hasDailySummary.value) {
      return getDailySummaryComposable().getNestedValue(dailySummary.value, 'transfers.bank.in', 0);
    }
    return sumTransactions(
      transactions.value.filter(tx => tx.type === 'transfer' && tx.toAccount === 'bank')
    );
  });

  /**
   * Efecto neto de transferencias en efectivo (entradas - salidas)
   * 🚀 HÍBRIDO: Prioriza dailySummary, fallback a cálculo manual
   */
  const efectoTransferenciasEnCash = computed(() => {
    if (hasDailySummary.value) {
      const valor = getDailySummaryComposable().getEfectoTransferenciasEnCash(dailySummary.value);
      return valor;
    }
    return subtractMoney(transferenciasEntradaCash.value, transferenciasSalidaCash.value);
  });

  /**
   * Efecto neto de transferencias en banco (entradas - salidas)
   * 🚀 HÍBRIDO: Prioriza dailySummary, fallback a cálculo manual
   */
  const efectoTransferenciasEnBank = computed(() => {
    if (hasDailySummary.value) {
      return getDailySummaryComposable().getEfectoTransferenciasEnBank(dailySummary.value);
    }
    return subtractMoney(transferenciasEntradaBank.value, transferenciasSalidaBank.value);
  });

  /**
   * Total de transferencias realizadas (sin considerar dirección)
   * 🚀 HÍBRIDO: Prioriza dailySummary, fallback a cálculo manual
   */
  const totalTransferencias = computed(() => {
    if (hasDailySummary.value) {
      return getDailySummaryComposable().getNestedValue(dailySummary.value, 'transfers.total', 0);
    }
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
   * 🚀 HÍBRIDO: Prioriza dailySummary, fallback a cálculo manual
   */
  const totalAjustesCierre = computed(() => {
    // Prioridad 1: Usar dailySummary
    if (hasDailySummary.value) {
      return getDailySummaryComposable().getTotalAjustesCierre(dailySummary.value);
    }

    // Fallback: Calcular manualmente
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
   * 🚀 HÍBRIDO: Prioriza dailySummary, fallback a openingTransaction
   */
  const saldoInicialCash = computed(() => {
    // Prioridad 1: Usar dailySummary
    if (hasDailySummary.value) {
      return getDailySummaryComposable().getSaldoInicialCash(dailySummary.value);
    }

    // Fallback: Usar openingTransaction
    return round2(openingTransaction.value?.realCashBalance ||
      openingTransaction.value?.totalCash || 0);
  });

  /**
   * Saldo inicial de banco según apertura
   * 🚀 HÍBRIDO: Prioriza dailySummary, fallback a openingTransaction
   */
  const saldoInicialBank = computed(() => {
    // Prioridad 1: Usar dailySummary
    if (hasDailySummary.value) {
      return getDailySummaryComposable().getSaldoInicialBank(dailySummary.value);
    }

    // Fallback: Usar openingTransaction
    return round2(openingTransaction.value?.realBankBalance ||
      openingTransaction.value?.totalBank || 0);
  });

  /**
   * Saldo inicial total
   * 🚀 HÍBRIDO: Prioriza dailySummary, fallback a cálculo manual
   */
  const saldoInicial = computed(() => {
    // Prioridad 1: Usar dailySummary
    if (hasDailySummary.value) {
      return getDailySummaryComposable().getSaldoInicial(dailySummary.value);
    }

    // Fallback: Calcular manualmente
    return addMoney(saldoInicialCash.value, saldoInicialBank.value);
  });

  // ===== BALANCES ESPERADOS/PROYECTADOS =====

  /**
   * Balance esperado de efectivo (saldo inicial + movimientos operativos + transferencias)
   * 🚀 HÍBRIDO: Prioriza dailySummary, fallback a cálculo manual
   */
  const expectedFinalCash = computed(() => {
    // Prioridad 1: Usar dailySummary
    if (hasDailySummary.value) {
      return getDailySummaryComposable().getExpectedFinalCash(dailySummary.value);
    }

    // Fallback: Calcular manualmente
    return addMoney(
      saldoInicialCash.value,
      ingresosCash.value,
      -egresosCash.value,
      efectoTransferenciasEnCash.value
    );
  });

  /**
   * Balance esperado de banco (saldo inicial + movimientos operativos + transferencias)
   * 🚀 HÍBRIDO: Prioriza dailySummary, fallback a cálculo manual
   */
  const expectedFinalBank = computed(() => {
    // Prioridad 1: Usar dailySummary
    if (hasDailySummary.value) {
      return getDailySummaryComposable().getExpectedFinalBank(dailySummary.value);
    }

    // Fallback: Calcular manualmente
    return addMoney(
      saldoInicialBank.value,
      ingresosBank.value,
      -egresosBank.value,
      efectoTransferenciasEnBank.value
    );
  });

  /**
   * Balance total esperado
   * 🚀 HÍBRIDO: Prioriza dailySummary, fallback a cálculo manual
   */
  const expectedFinalTotal = computed(() => {
    // Prioridad 1: Usar dailySummary
    if (hasDailySummary.value) {
      return getDailySummaryComposable().getExpectedFinalTotal(dailySummary.value);
    }

    // Fallback: Calcular manualmente
    return addMoney(expectedFinalCash.value, expectedFinalBank.value);
  });

  // ===== BALANCES ACTUALES/REALES =====

  /**
   * Saldo actual de efectivo (incluye transferencias y ajustes)
   * 🚀 HÍBRIDO: Prioriza dailySummary, fallback a cálculo manual
   */
  const saldoActualCash = computed(() => {
    // Prioridad 1: Usar dailySummary
    if (hasDailySummary.value) {
      console.log('=== OBTENIENDO SALDO ACTUAL CASH DESDE DAILYSUMMARY ===');
      console.log('DailySummary:', dailySummary.value);
      return getDailySummaryComposable().getSaldoActualCash(dailySummary.value);
    }

    // Fallback: Calcular manualmente
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
   * 🚀 HÍBRIDO: Prioriza dailySummary, fallback a cálculo manual
   */
  const saldoActualBank = computed(() => {
    // Prioridad 1: Usar dailySummary
    if (hasDailySummary.value) {
      return getDailySummaryComposable().getSaldoActualBank(dailySummary.value);
    }

    // Fallback: Calcular manualmente
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
   * 🚀 HÍBRIDO: Prioriza dailySummary, fallback a cálculo manual
   */
  const saldoActual = computed(() => {
    // Prioridad 1: Usar dailySummary
    if (hasDailySummary.value) {
      return getDailySummaryComposable().getSaldoActual(dailySummary.value);
    }

    // Fallback: Calcular manualmente
    return addMoney(saldoActualCash.value, saldoActualBank.value);
  });

  // ===== RESULTADOS OPERACIONALES =====

  /**
   * Resultado operacional del día (ventas - gastos, SIN ajustes)
   * Este es el KPI principal del negocio
   * 🚀 HÍBRIDO: Prioriza dailySummary, fallback a cálculo manual
   */
  const resultadoOperacional = computed(() => {
    // Prioridad 1: Usar dailySummary
    if (hasDailySummary.value) {
      return getDailySummaryComposable().getResultadoOperacional(dailySummary.value);
    }

    // Fallback: Calcular manualmente
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
    const uuid = generateUUID();
    const cashDiff = calculateDifference(realCashBalance, expectedCashBalance);
    const bankDiff = calculateDifference(realBankBalance, expectedBankBalance);

    return {
      // === IDENTIFICACIÓN ===
      uuid,
      id: uuid, // Compatibilidad con sharedComputed.js
      type: 'opening',
      description: 'Apertura de caja',
      source: 'manual',
      copilotMode: 'manual',
      openingReference: null,
      lastClosureReference: lastClosureUuid || null,

      // === BALANCES (apertura) ===
      expectedCashBalance: expectedCashBalance || 0,
      expectedBankBalance: expectedBankBalance || 0,
      realCashBalance: realCashBalance || 0,
      realBankBalance: realBankBalance || 0,

      // === DIFERENCIAS ===
      cashDifference: cashDiff,
      bankDifference: bankDiff,

      // === TOTALES OPERACIONALES (siempre 0 en apertura) ===
      totalIngresos: 0,
      totalEgresos: 0,
      ingresosCash: 0,
      ingresosBank: 0,
      egresosCash: 0,
      egresosBank: 0,

      // === TRANSFERENCIAS (siempre 0 en apertura) ===
      totalTransferencias: 0,
      transferencias: {
        cash: { in: 0, out: 0, net: 0 },
        bank: { in: 0, out: 0, net: 0 }
      },

      // === AJUSTES (se calculan después) ===
      ajustesApertura: {
        cash: 0,
        bank: 0,
        total: 0
      },
      ajustesCierre: {
        cash: 0,
        bank: 0,
        total: 0
      },

      // === RESULTADOS OPERACIONALES (siempre 0 en apertura) ===
      resultadoOperacional: 0,
      resultadoOperacionalCash: 0,
      resultadoOperacionalBank: 0,
      flujoNetoCash: 0,
      flujoNetoBank: 0,

      // === CAMPOS COMPATIBLES (legacy) ===
      totalCash: realCashBalance || 0,
      totalBank: realBankBalance || 0,
      totalBalance: (realCashBalance || 0) + (realBankBalance || 0),
      cashAmount: realCashBalance || 0,
      bankAmount: realBankBalance || 0,

      // === ESTRUCTURA ESTÁNDAR ===
      items: [],
      itemsAndStockLogs: [],
      amount: 0,

      // === METADATA ===
      metadata: {
        day: null, // Se establecerá al guardar
        triggerType: 'manual_open',
        autoGenerated: false
      }
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
      // === IDENTIFICACIÓN ===
      uuid: generateUUID(),
      type: 'closure',
      description: 'Cierre de caja',
      source: 'manual',
      copilotMode: 'manual',
      openingReference: openingUuid,

      // === SALDOS INICIALES (de apertura) ===
      initialCashBalance: saldoInicialCash.value,
      initialBankBalance: saldoInicialBank.value,

      // === TOTALES GENERALES (sin ajustes) ===
      totalIngresos: totalIngresos.value,
      totalEgresos: totalEgresos.value,
      ingresosCash: ingresosCash.value,
      ingresosBank: ingresosBank.value,
      egresosCash: egresosCash.value,
      egresosBank: egresosBank.value,

      // === TRANSFERENCIAS ===
      totalTransferencias: totalTransferencias.value,
      transferencias: {
        cash: {
          in: transferenciasEntradaCash.value,
          out: transferenciasSalidaCash.value,
          net: efectoTransferenciasEnCash.value
        },
        bank: {
          in: transferenciasEntradaBank.value,
          out: transferenciasSalidaBank.value,
          net: efectoTransferenciasEnBank.value
        }
      },

      // === AJUSTES ===
      ajustesApertura: {
        cash: ajustesAperturaCash.value,
        bank: ajustesAperturaBank.value,
        total: totalAjustesApertura.value
      },
      ajustesCierre: {
        cash: ajustesCierreCash.value,
        bank: ajustesCierreBank.value,
        total: totalAjustesCierre.value
      },

      // === BALANCES ESPERADOS (sin ajustes cierre) ===
      expectedCashBalance: expectedFinalCash.value,
      expectedBankBalance: expectedFinalBank.value,

      // === BALANCES REALES (contados) ===
      realCashBalance: realCashBalance || 0,
      realBankBalance: realBankBalance || 0,

      // === DIFERENCIAS ===
      cashDifference: cashDiff,
      bankDifference: bankDiff,

      // === RESULTADOS OPERACIONALES ===
      resultadoOperacional: resultadoOperacional.value,
      resultadoOperacionalCash: resultadoOperacionalCash.value,
      resultadoOperacionalBank: resultadoOperacionalBank.value,
      flujoNetoCash: flujoNetoCash.value,
      flujoNetoBank: flujoNetoBank.value,

      // === CAMPOS COMPATIBLES (legacy) ===
      totalCash: realCashBalance || 0,
      totalBank: realBankBalance || 0,
      cashAmount: realCashBalance || 0,
      bankAmount: realBankBalance || 0,

      // === ESTRUCTURA ESTÁNDAR ===
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

  /**
   * 🔄 NUEVO: Forzar recarga del dailySummary
   * Útil para actualizar datos después de crear/editar transacciones
   * 
   * @returns {Promise<boolean>} - True si se recargó exitosamente
   */
  const forceReloadSummary = async () => {
    console.log('🔄 Forzando recarga del dailySummary...');
    return await loadFromDailySummary();
  };

  /**
   * 🔥 NUEVO: Iniciar listener en tiempo real del dailySummary
   * Actualiza automáticamente el store cuando las Cloud Functions modifican el dailySummary
   * 
   * @returns {Function} - Función para detener el listener
   */
  const startDailySummaryListener = () => {
    // Detener listener anterior si existe
    if (dailySummaryUnsubscribe) {
      console.log('🛑 Deteniendo listener anterior de dailySummary');
      dailySummaryUnsubscribe();
      dailySummaryUnsubscribe = null;
    }

    console.log('🔥 Iniciando listener en tiempo real de dailySummary...');

    dailySummaryUnsubscribe = getDailySummaryComposable().watchTodayDailySummary((summary) => {
      if (summary) {
        console.log('🔄 DailySummary actualizado automáticamente desde Firestore');
        dailySummary.value = summary;

        // Actualizar openingTransaction desde dailySummary
        if (summary.openingData && getDailySummaryComposable().hasOpening(summary)) {
          openingTransaction.value = {
            uuid: summary.openingData.uuid || summary.openingData.id,
            id: summary.openingData.uuid || summary.openingData.id,
            type: 'opening',
            realCashBalance: summary.openingData.realCashBalance,
            realBankBalance: summary.openingData.realBankBalance,
            totalBalance: summary.openingData.totalBalance,
            expectedCashBalance: summary.balances?.expected?.cash || 0,
            expectedBankBalance: summary.balances?.expected?.bank || 0,
          };
          console.log('✅ OpeningTransaction actualizada desde listener');
        } else {
          openingTransaction.value = null;
        }

        console.log('📊 Store actualizado con nuevos valores:');
        console.log('   - Ingresos:', getDailySummaryComposable().getTotalIngresos(summary));
        console.log('   - Egresos:', getDailySummaryComposable().getTotalEgresos(summary));
        console.log('   - Saldo actual:', getDailySummaryComposable().getSaldoActual(summary));
      } else {
        console.log('ℹ️ DailySummary no disponible en listener');
        dailySummary.value = null;
        openingTransaction.value = null;
      }
    });

    return dailySummaryUnsubscribe;
  };

  /**
   * 🛑 Detener listener en tiempo real del dailySummary
   */
  const stopDailySummaryListener = () => {
    if (dailySummaryUnsubscribe) {
      console.log('🛑 Deteniendo listener de dailySummary');
      dailySummaryUnsubscribe();
      dailySummaryUnsubscribe = null;
    }
  };

  return {
    // ===== NUEVO: ESTADO Y MÉTODOS DE DAILYSUMMARY =====
    dailySummary,
    isLoadingFromSummary,
    summaryLoadError,
    hasDailySummary,
    loadFromDailySummary,
    loadDailySummary,
    forceReloadSummary,

    // 🔥 NUEVO: Listener en tiempo real
    startDailySummaryListener,
    stopDailySummaryListener,

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

