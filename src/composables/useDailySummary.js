// useDailySummary.js
import { getFirestore, doc, getDoc, onSnapshot } from 'firebase/firestore';
import appFirebase from '@/firebaseInit';
import { ensureBusinessId } from '@/composables/useBusinessUtils';

/**
 * Composable para leer el dailySummary del día actual
 * Este documento es mantenido automáticamente por las Cloud Functions
 * 
 * 🚀 MIGRACIÓN A DAILYSUMMARY:
 * Este composable reemplaza los cálculos manuales de accountsBalanceStore
 * utilizando datos pre-calculados por el backend (onTransactionWrite).
 * 
 * Estructura completa del dailySummary (ver sharedComputed.js):
 * - hasOpening, hasClosure, hasTxn
 * - totals: { income, expense, net, transfers, adjustments }
 * - byAccount: { cash: {income, expense, net}, bank: {income, expense, net} }
 * - transfers: { cash: {in, out, net}, bank: {in, out, net}, total }
 * - adjustments: { opening: {cash, bank, total}, closure: {cash, bank, total}, total }
 * - balances: { initial: {cash, bank, total}, expected: {cash, bank, total}, actual: {cash, bank, total} }
 * - operational: { result, resultCash, resultBank, flowCash, flowBank }
 * - openingData: { uuid, id, realCashBalance, realBankBalance, totalBalance }
 * - closureId: uuid del cierre (si existe)
 */
export function useDailySummary() {
  const db = getFirestore(appFirebase);

  /**
   * Obtiene el resumen del día actual
   * @returns {Promise<Object|null>} - Resumen del día o null si no existe
   */
  const getTodayDailySummary = async () => {
    try {
      const businessId = ensureBusinessId();

      if (!businessId) {
        console.error('❌ businessId no disponible para getTodayDailySummary');
        return null;
      }

      // Formatear la fecha actual como 'yyyy-LL-dd'
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const dayString = `${year}-${month}-${day}`;

      // Referencia al documento dailySummary
      const dailySummaryRef = doc(
        db,
        `businesses/${businessId}/dailySummaries/${dayString}`
      );

      const docSnap = await getDoc(dailySummaryRef);

      if (!docSnap.exists()) {
        console.log('ℹ️ No existe dailySummary para hoy:', dayString);
        return null;
      }

      const data = docSnap.data();
      console.log('✅ DailySummary cargado:', data);

      // Validar estructura antes de retornar
      if (!validateDailySummaryStructure(data)) {
        console.warn('⚠️ DailySummary tiene estructura incompleta:', data);
      }

      return data;
    } catch (error) {
      console.error('❌ Error obteniendo dailySummary:', error);
      return null;
    }
  };

  /**
   * Obtiene el resumen de un día específico
   * @param {string} dayString - Fecha en formato 'yyyy-LL-dd'
   * @returns {Promise<Object|null>} - Resumen del día o null si no existe
   */
  const getDailySummary = async (dayString) => {
    try {
      const businessId = ensureBusinessId();

      if (!businessId || !dayString) {
        console.error('❌ businessId y dayString son requeridos');
        return null;
      }

      const dailySummaryRef = doc(
        db,
        `businesses/${businessId}/dailySummaries/${dayString}`
      );

      const docSnap = await getDoc(dailySummaryRef);

      if (!docSnap.exists()) {
        console.log(`ℹ️ No existe dailySummary para ${dayString}`);
        return null;
      }

      const data = docSnap.data();

      // Validar estructura antes de retornar
      if (!validateDailySummaryStructure(data)) {
        console.warn(`⚠️ DailySummary de ${dayString} tiene estructura incompleta`);
      }

      return data;
    } catch (error) {
      console.error('❌ Error obteniendo dailySummary:', error);
      return null;
    }
  };

  /**
   * Valida que el dailySummary tenga la estructura esperada
   * @param {Object|null} summary - Objeto dailySummary a validar
   * @returns {boolean} - True si tiene estructura válida
   */
  const validateDailySummaryStructure = (summary) => {
    if (!summary) return false;

    // Validar propiedades críticas
    const criticalPaths = [
      'totals.income',
      'totals.expense',
      'totals.net',
      'byAccount.cash.income',
      'byAccount.cash.expense',
      'byAccount.bank.income',
      'byAccount.bank.expense',
      'balances.initial.cash',
      'balances.initial.bank',
      'balances.initial.total',
      'balances.expected.cash',
      'balances.expected.bank',
      'balances.actual.cash',
      'balances.actual.bank',
      'operational.result',
    ];

    for (const path of criticalPaths) {
      if (getNestedValue(summary, path) === undefined) {
        console.warn(`⚠️ Falta propiedad crítica: ${path}`);
        return false;
      }
    }

    return true;
  };

  /**
   * Obtiene un valor anidado de un objeto usando notación de punto
   * @param {Object} obj - Objeto fuente
   * @param {string} path - Ruta con notación de punto (ej: 'balances.actual.cash')
   * @param {*} defaultValue - Valor por defecto si no existe
   * @returns {*} - Valor encontrado o defaultValue
   */
  const getNestedValue = (obj, path, defaultValue = undefined) => {
    const keys = path.split('.');
    let result = obj;

    for (const key of keys) {
      if (result && typeof result === 'object' && key in result) {
        result = result[key];
      } else {
        return defaultValue;
      }
    }

    return result;
  };

  /**
   * Obtiene el saldo inicial total del día
   * @param {Object} summary - DailySummary
   * @returns {number} - Saldo inicial
   */
  const getSaldoInicial = (summary) => {
    return getNestedValue(summary, 'balances.initial.total', 0);
  };

  /**
   * Obtiene el saldo inicial de efectivo
   * @param {Object} summary - DailySummary
   * @returns {number} - Saldo inicial cash
   */
  const getSaldoInicialCash = (summary) => {
    return getNestedValue(summary, 'balances.initial.cash', 0);
  };

  /**
   * Obtiene el saldo inicial de banco
   * @param {Object} summary - DailySummary
   * @returns {number} - Saldo inicial bank
   */
  const getSaldoInicialBank = (summary) => {
    return getNestedValue(summary, 'balances.initial.bank', 0);
  };

  /**
   * Obtiene el total de ingresos (sin ajustes)
   * @param {Object} summary - DailySummary
   * @returns {number} - Total ingresos
   */
  const getTotalIngresos = (summary) => {
    return getNestedValue(summary, 'totals.income', 0);
  };

  /**
   * Obtiene el total de egresos (sin ajustes)
   * @param {Object} summary - DailySummary
   * @returns {number} - Total egresos
   */
  const getTotalEgresos = (summary) => {
    return getNestedValue(summary, 'totals.expense', 0);
  };

  /**
   * Obtiene los ingresos en efectivo
   * @param {Object} summary - DailySummary
   * @returns {number} - Ingresos cash
   */
  const getIngresosCash = (summary) => {
    return getNestedValue(summary, 'byAccount.cash.income', 0);
  };

  /**
   * Obtiene los ingresos en banco
   * @param {Object} summary - DailySummary
   * @returns {number} - Ingresos bank
   */
  const getIngresosBank = (summary) => {
    return getNestedValue(summary, 'byAccount.bank.income', 0);
  };

  /**
   * Obtiene los egresos en efectivo
   * @param {Object} summary - DailySummary
   * @returns {number} - Egresos cash
   */
  const getEgresosCash = (summary) => {
    return getNestedValue(summary, 'byAccount.cash.expense', 0);
  };

  /**
   * Obtiene los egresos en banco
   * @param {Object} summary - DailySummary
   * @returns {number} - Egresos bank
   */
  const getEgresosBank = (summary) => {
    return getNestedValue(summary, 'byAccount.bank.expense', 0);
  };

  /**
   * Obtiene el saldo actual total (con ajustes)
   * @param {Object} summary - DailySummary
   * @returns {number} - Saldo actual
   */
  const getSaldoActual = (summary) => {
    return getNestedValue(summary, 'balances.actual.total', 0);
  };

  /**
   * Obtiene el saldo actual de efectivo (con ajustes)
   * @param {Object} summary - DailySummary
   * @returns {number} - Saldo actual cash
   */
  const getSaldoActualCash = (summary) => {
    return getNestedValue(summary, 'balances.actual.cash', 0);
  };

  /**
   * Obtiene el saldo actual de banco (con ajustes)
   * @param {Object} summary - DailySummary
   * @returns {number} - Saldo actual bank
   */
  const getSaldoActualBank = (summary) => {
    return getNestedValue(summary, 'balances.actual.bank', 0);
  };

  /**
   * Obtiene el saldo esperado total (sin ajustes de cierre)
   * @param {Object} summary - DailySummary
   * @returns {number} - Saldo esperado
   */
  const getExpectedFinalTotal = (summary) => {
    return getNestedValue(summary, 'balances.expected.total', 0);
  };

  /**
   * Obtiene el saldo esperado de efectivo (sin ajustes de cierre)
   * @param {Object} summary - DailySummary
   * @returns {number} - Saldo esperado cash
   */
  const getExpectedFinalCash = (summary) => {
    return getNestedValue(summary, 'balances.expected.cash', 0);
  };

  /**
   * Obtiene el saldo esperado de banco (sin ajustes de cierre)
   * @param {Object} summary - DailySummary
   * @returns {number} - Saldo esperado bank
   */
  const getExpectedFinalBank = (summary) => {
    return getNestedValue(summary, 'balances.expected.bank', 0);
  };

  /**
   * Obtiene el resultado operacional (ventas - gastos, sin ajustes)
   * @param {Object} summary - DailySummary
   * @returns {number} - Resultado operacional
   */
  const getResultadoOperacional = (summary) => {
    return getNestedValue(summary, 'operational.result', 0);
  };

  /**
   * Obtiene el resultado operacional de efectivo
   * @param {Object} summary - DailySummary
   * @returns {number} - Resultado operacional cash
   */
  const getResultadoOperacionalCash = (summary) => {
    return getNestedValue(summary, 'operational.resultCash', 0);
  };

  /**
   * Obtiene el resultado operacional de banco
   * @param {Object} summary - DailySummary
   * @returns {number} - Resultado operacional bank
   */
  const getResultadoOperacionalBank = (summary) => {
    return getNestedValue(summary, 'operational.resultBank', 0);
  };

  /**
   * Obtiene el total de ajustes de cierre
   * @param {Object} summary - DailySummary
   * @returns {number} - Total ajustes cierre
   */
  const getTotalAjustesCierre = (summary) => {
    return getNestedValue(summary, 'adjustments.closure.total', 0);
  };

  /**
   * Obtiene los ajustes de cierre en efectivo
   * @param {Object} summary - DailySummary
   * @returns {number} - Ajustes cierre cash
   */
  const getAjustesCierreCash = (summary) => {
    return getNestedValue(summary, 'adjustments.closure.cash', 0);
  };

  /**
   * Obtiene los ajustes de cierre en banco
   * @param {Object} summary - DailySummary
   * @returns {number} - Ajustes cierre bank
   */
  const getAjustesCierreBank = (summary) => {
    return getNestedValue(summary, 'adjustments.closure.bank', 0);
  };

  /**
   * Obtiene el total de transferencias
   * @param {Object} summary - DailySummary
   * @returns {number} - Total transferencias
   */
  const getTotalTransferencias = (summary) => {
    return getNestedValue(summary, 'transfers.total', 0);
  };

  /**
   * Obtiene el efecto neto de transferencias en efectivo
   * @param {Object} summary - DailySummary
   * @returns {number} - Efecto transferencias en cash
   */
  const getEfectoTransferenciasEnCash = (summary) => {
    return getNestedValue(summary, 'transfers.cash.net', 0);
  };

  /**
   * Obtiene el efecto neto de transferencias en banco
   * @param {Object} summary - DailySummary
   * @returns {number} - Efecto transferencias en bank
   */
  const getEfectoTransferenciasEnBank = (summary) => {
    return getNestedValue(summary, 'transfers.bank.net', 0);
  };

  /**
   * Obtiene los datos de la transacción de apertura
   * @param {Object} summary - DailySummary
   * @returns {Object|null} - Datos de apertura con uuid
   */
  const getOpeningData = (summary) => {
    return getNestedValue(summary, 'openingData', null);
  };

  /**
   * Obtiene el UUID de la transacción de apertura
   * @param {Object} summary - DailySummary
   * @returns {string|null} - UUID de la apertura
   */
  const getOpeningUuid = (summary) => {
    return getNestedValue(summary, 'openingData.uuid', null);
  };

  /**
   * Obtiene el UUID de la transacción de cierre
   * @param {Object} summary - DailySummary
   * @returns {string|null} - UUID del cierre
   */
  const getClosureUuid = (summary) => {
    return getNestedValue(summary, 'closureId', null);
  };

  /**
   * Verifica si existe apertura
   * @param {Object} summary - DailySummary
   * @returns {boolean} - True si hay apertura
   */
  const hasOpening = (summary) => {
    return getNestedValue(summary, 'hasOpening', false);
  };

  /**
   * Verifica si existe cierre
   * @param {Object} summary - DailySummary
   * @returns {boolean} - True si hay cierre
   */
  const hasClosure = (summary) => {
    return getNestedValue(summary, 'hasClosure', false);
  };

  /**
   * Verifica si hay transacciones operativas (racha)
   * @param {Object} summary - DailySummary
   * @returns {boolean} - True si hay transacciones
   */
  const hasTxn = (summary) => {
    return getNestedValue(summary, 'hasTxn', false);
  };

  /**
   * 🔥 NUEVO: Escuchar cambios en tiempo real del dailySummary de hoy
   * Retorna una función unsubscribe para detener el listener
   * 
   * @param {Function} callback - Función callback que recibe el dailySummary actualizado
   * @returns {Function} - Función para detener el listener
   * 
   * @example
   * const unsubscribe = watchTodayDailySummary((summary) => {
   *   console.log('DailySummary actualizado:', summary);
   *   // Actualizar estado de la aplicación
   * });
   * 
   * // Cuando ya no se necesite el listener:
   * unsubscribe();
   */
  const watchTodayDailySummary = (callback) => {
    try {
      const businessId = ensureBusinessId();

      if (!businessId) {
        console.error('❌ businessId no disponible para watchTodayDailySummary');
        return () => { }; // Retornar función vacía
      }

      // Formatear la fecha actual como 'yyyy-LL-dd'
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const dayString = `${year}-${month}-${day}`;

      // Referencia al documento dailySummary
      const dailySummaryRef = doc(
        db,
        `businesses/${businessId}/dailySummaries/${dayString}`
      );

      console.log(`👀 Iniciando listener de dailySummary para ${dayString}`);

      // Configurar listener en tiempo real
      const unsubscribe = onSnapshot(
        dailySummaryRef,
        (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            console.log('🔄 DailySummary actualizado en tiempo real');

            // Validar estructura
            if (!validateDailySummaryStructure(data)) {
              console.warn('⚠️ DailySummary tiene estructura incompleta:', data);
            }

            // Llamar al callback con los datos actualizados
            callback(data);
          } else {
            console.log('ℹ️ DailySummary aún no existe para hoy');
            callback(null);
          }
        },
        (error) => {
          console.error('❌ Error en listener de dailySummary:', error);
          callback(null);
        }
      );

      return unsubscribe;
    } catch (error) {
      console.error('❌ Error configurando listener de dailySummary:', error);
      return () => { }; // Retornar función vacía
    }
  };

  /**
   * 🔥 NUEVO: Escuchar cambios en tiempo real de un dailySummary específico
   * 
   * @param {string} dayString - Fecha en formato 'yyyy-LL-dd'
   * @param {Function} callback - Función callback que recibe el dailySummary actualizado
   * @returns {Function} - Función para detener el listener
   */
  const watchDailySummary = (dayString, callback) => {
    try {
      const businessId = ensureBusinessId();

      if (!businessId || !dayString) {
        console.error('❌ businessId y dayString son requeridos');
        return () => { };
      }

      const dailySummaryRef = doc(
        db,
        `businesses/${businessId}/dailySummaries/${dayString}`
      );

      console.log(`👀 Iniciando listener de dailySummary para ${dayString}`);

      const unsubscribe = onSnapshot(
        dailySummaryRef,
        (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            console.log(`🔄 DailySummary de ${dayString} actualizado en tiempo real`);

            if (!validateDailySummaryStructure(data)) {
              console.warn(`⚠️ DailySummary de ${dayString} tiene estructura incompleta`);
            }

            callback(data);
          } else {
            console.log(`ℹ️ DailySummary de ${dayString} no existe`);
            callback(null);
          }
        },
        (error) => {
          console.error(`❌ Error en listener de dailySummary para ${dayString}:`, error);
          callback(null);
        }
      );

      return unsubscribe;
    } catch (error) {
      console.error('❌ Error configurando listener de dailySummary:', error);
      return () => { };
    }
  };

  return {
    // Métodos de obtención
    getTodayDailySummary,
    getDailySummary,

    // 🔥 NUEVO: Listeners en tiempo real
    watchTodayDailySummary,
    watchDailySummary,

    // Validación
    validateDailySummaryStructure,

    // Helpers de acceso
    getNestedValue,

    // Saldos iniciales
    getSaldoInicial,
    getSaldoInicialCash,
    getSaldoInicialBank,

    // Ingresos y egresos
    getTotalIngresos,
    getTotalEgresos,
    getIngresosCash,
    getIngresosBank,
    getEgresosCash,
    getEgresosBank,

    // Saldos actuales y esperados
    getSaldoActual,
    getSaldoActualCash,
    getSaldoActualBank,
    getExpectedFinalTotal,
    getExpectedFinalCash,
    getExpectedFinalBank,

    // Resultados operacionales
    getResultadoOperacional,
    getResultadoOperacionalCash,
    getResultadoOperacionalBank,

    // Ajustes
    getTotalAjustesCierre,
    getAjustesCierreCash,
    getAjustesCierreBank,

    // Transferencias
    getTotalTransferencias,
    getEfectoTransferenciasEnCash,
    getEfectoTransferenciasEnBank,

    // Datos de apertura/cierre
    getOpeningData,
    getOpeningUuid,
    getClosureUuid,

    // Flags
    hasOpening,
    hasClosure,
    hasTxn,
  };
}
