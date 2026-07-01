/* eslint-disable */
// sharedComputed.js

/**
 * @file sharedComputed.js
 * @description Funciones compartidas para cálculos de agregados financieros y resúmenes diarios.
 * Similar a accountsBalanceStore.js pero para el backend.
 * 
 * Infraestructura consistente con:
 * - accountsBalanceStore.js (cálculos en el frontend)
 * - useTransaction.js (estructura de transacciones)
 * 
 * @module AccountsBalance/sharedComputed
 */

const { dateRangeForDay } = require('../Helpers/time');
const { round2, addMoney, subtractMoney, parseMoneyNumber } = require('../Helpers/mathUtils');

function isInitialPayment(payment, tx) {
  if (!payment || !tx) return false;
  
  let pTime = 0;
  if (payment.date) {
    if (typeof payment.date.toMillis === 'function') {
      pTime = payment.date.toMillis();
    } else if (payment.date.seconds) {
      pTime = payment.date.seconds * 1000;
    } else {
      pTime = new Date(payment.date).getTime();
    }
  }
  
  let txTime = 0;
  if (tx.createdAt) {
    if (typeof tx.createdAt.toMillis === 'function') {
      txTime = tx.createdAt.toMillis();
    } else if (tx.createdAt.seconds) {
      txTime = tx.createdAt.seconds * 1000;
    } else {
      txTime = new Date(tx.createdAt).getTime();
    }
  }
  
  if (!pTime || !txTime) return false;
  return Math.abs(pTime - txTime) < 900000; // 15 minutos
}

/**
 * Calcula los agregados financieros detallados de un día específico.
 * Equivalente a TODOS los computed properties de accountsBalanceStore.
 * 
 * @param {FirebaseFirestore.Firestore} db - Instancia de Firestore
 * @param {string} businessId - ID del negocio
 * @param {string} day - Día en formato 'yyyy-LL-dd'
 * @param {string} tz - Timezone (default: 'America/Lima')
 * 
 * @returns {Promise<Object>} Objeto con estructura completa de accountsBalanceStore:
 *   - hasOpening: boolean
 *   - hasClosure: boolean
 *   - hasTxn: boolean (true si hay income o expense NO-adjustment; transfer NO cuenta)
 *   - openingData: Object - Datos de la apertura
 *   - totals: Object - Totales generales
 *   - byAccount: Object - Desglose por cuenta (cash/bank)
 *   - transfers: Object - Información de transferencias
 *   - adjustments: Object - Ajustes de apertura y cierre
 *   - balances: Object - Saldos iniciales, esperados y actuales
 *   - operational: Object - Resultados operacionales
 * 
 * Tipos de transacciones que cuentan para hasTxn (racha):
 *   ✅ income (category !== 'adjustment')
 *   ✅ expense (category !== 'adjustment')
 *   ✅ payment (cobros de ventas a crédito)
 *   ❌ transfer (NO cuenta para racha)
 *   ❌ adjustment (NO cuenta para racha)
 *   ❌ opening (NO cuenta para racha)
 *   ❌ closure (NO cuenta para racha)
 * 
 * Tipos de transacciones reconocidas (consistente con transactionStore):
 * - 'opening': Apertura de caja
 * - 'closure': Cierre de caja
 * - 'income': Ingreso (venta)
 *   - paymentStatus: 'completed' | 'partial' | 'pending'
 *   - totalPaid: monto efectivamente recibido
 *   - payments: array de pagos realizados
 * - 'expense': Egreso (gasto)
 * - 'transfer': Transferencia entre cuentas
 * - 'payment': Pago posterior de una venta a crédito
 */
async function getDayAggregates(db, businessId, day, tz = 'America/Lima') {
  console.log(`📊 Calculating detailed aggregates for ${day} in business ${businessId}`);

  const { start, end } = dateRangeForDay(day, tz);

  // Consultar todas las transacciones del día
  const txSnap = await db.collection(`businesses/${businessId}/transactions`)
    .where('createdAt', '>=', start)
    .where('createdAt', '<=', end)
    .get();

  console.log(`📝 Found ${txSnap.size} transactions for ${day}`);

  // Convertir a array para facilitar procesamiento
  const allTransactions = [];
  txSnap.forEach(doc => {
    const data = doc.data();
    allTransactions.push({
      ...data,
      uuid: data.uuid || doc.id, // ✅ Priorizar uuid del documento
      id: data.uuid || doc.id,   // ✅ Mantener id igual a uuid
    });
  });

  // ===== FLAGS BÁSICOS =====
  let hasOpening = false;
  let hasClosure = false;
  let hasTxn = false;
  let openingTransaction = null;

  // ===== TOTALES GENERALES (excluyendo ajustes) =====
  let totalIngresos = 0;
  let totalEgresos = 0;

  // ===== INGRESOS POR CUENTA =====
  let ingresosCash = 0;
  let ingresosBank = 0;

  // ===== EGRESOS POR CUENTA =====
  let egresosCash = 0;
  let egresosBank = 0;

  // ===== TRANSFERENCIAS =====
  let transferenciasSalidaCash = 0;
  let transferenciasEntradaCash = 0;
  let transferenciasSalidaBank = 0;
  let transferenciasEntradaBank = 0;
  let totalTransferencias = 0;

  // ===== AJUSTES =====
  let ajustesAperturaCash = 0;
  let ajustesAperturaBank = 0;
  let ajustesCierreCash = 0;
  let ajustesCierreBank = 0;

  // Procesar cada transacción (equivalente a accountsBalanceStore)
  allTransactions.forEach(tx => {
    const txType = tx.type;
    const amount = parseMoneyNumber(tx.amount || 0);
    const account = tx.account;
    const category = tx.category;
    const subcategory = tx.subcategory;

    // === DETECTAR TIPOS ===
    if (txType === 'opening') {
      hasOpening = true;
      openingTransaction = tx;
      console.log(`  ✓ Opening found: ${tx.uuid}`);
    }

    if (txType === 'closure') {
      hasClosure = true;
      console.log(`  ✓ Closure found: ${tx.uuid}`);
    }

    // === INGRESOS (excluyendo ajustes) ===
    if (txType === 'income' && category !== 'adjustment') {
      hasTxn = true;

      let amountReceived = amount;

      const hasPayments = tx.payments && Array.isArray(tx.payments) && tx.payments.length > 0;

      if (hasPayments) {
        // Si tiene pagos en el array, solo sumamos el primero si se realizó al momento de registrar (inicial)
        if (isInitialPayment(tx.payments[0], tx)) {
          amountReceived = parseMoneyNumber(tx.payments[0].amount || 0);
          console.log(`  💵 Initial payment found in income: ${amountReceived} of ${amount} [${account}] (${tx.uuid})`);
        } else {
          amountReceived = 0; // Pago posterior (se cuenta como transacción tipo 'payment')
          console.log(`  ⏳ Subsequent payment ignored in parent income: ${amount} [${account}] (${tx.uuid})`);
        }
      } else if (tx.paymentStatus === 'pending') {
        // Sin pagar
        amountReceived = 0;
        console.log(`  ⏳ Pending payment: ${amount} [${account}] (${tx.uuid})`);
      } else {
        // Pago completo directo (sin array de pagos)
        console.log(`  💰 Full payment: ${amountReceived} [${account}] (${tx.uuid})`);
      }

      totalIngresos = addMoney(totalIngresos, amountReceived);

      // Por cuenta (excluyendo ajustes de apertura)
      if (hasPayments && amountReceived > 0) {
        // Usar el método del primer pago
        const firstPayment = tx.payments[0];
        const paymentAmount = parseMoneyNumber(firstPayment.amount || 0);
        const paymentAccount = firstPayment.account || firstPayment.method || 'cash';

        if (paymentAccount === 'cash') {
          ingresosCash = addMoney(ingresosCash, paymentAmount);
        } else if (paymentAccount === 'bank' || paymentAccount === 'yape' || paymentAccount === 'plin') {
          ingresosBank = addMoney(ingresosBank, paymentAmount);
        }
      } else {
        // Pago completo directo o pendiente (donde amountReceived es 0)
        if (account === 'cash' && subcategory !== 'opening_adjustment') {
          ingresosCash = addMoney(ingresosCash, amountReceived);
        }
        if ((account === 'bank' || account === 'yape' || account === 'plin') && subcategory !== 'opening_adjustment') {
          ingresosBank = addMoney(ingresosBank, amountReceived);
        }
      }
    }
    
    // === PAGOS POSTERIORES (tipo 'payment') ===
    if (txType === 'payment') {
      hasTxn = true;
      const paymentAmount = parseMoneyNumber(amount || 0);

      // Si tiene supplierId, es un pago a proveedor (salida de dinero)
      if (tx.supplierId) {
        totalEgresos = addMoney(totalEgresos, paymentAmount);
        if (account === 'cash') {
          egresosCash = addMoney(egresosCash, paymentAmount);
        } else if (account === 'bank' || account === 'yape' || account === 'plin') {
          egresosBank = addMoney(egresosBank, paymentAmount);
        }
        console.log(`  💸 Payment sent to supplier: ${paymentAmount} [${account}] (${tx.uuid})`);
      } else {
        // De lo contrario, es un cobro a cliente (entrada de dinero)
        totalIngresos = addMoney(totalIngresos, paymentAmount);
        if (account === 'cash') {
          ingresosCash = addMoney(ingresosCash, paymentAmount);
        } else if (account === 'bank' || account === 'yape' || account === 'plin') {
          ingresosBank = addMoney(ingresosBank, paymentAmount);
        }
        console.log(`  💰 Payment received from client: ${paymentAmount} [${account}] (${tx.uuid})`);
      }
    }

    // === EGRESOS (excluyendo ajustes) ===
    if (txType === 'expense' && category !== 'adjustment') {
      hasTxn = true;

      let amountPaid = amount;

      const hasPayments = tx.payments && Array.isArray(tx.payments) && tx.payments.length > 0;

      if (hasPayments) {
        // Si tiene pagos en el array, solo sumamos el primero si se realizó al momento de registrar (inicial)
        if (isInitialPayment(tx.payments[0], tx)) {
          amountPaid = parseMoneyNumber(tx.payments[0].amount || 0);
          console.log(`  💸 Initial payment found in expense: ${amountPaid} of ${amount} [${account}] (${tx.uuid})`);
        } else {
          amountPaid = 0; // Pago posterior (se cuenta como transacción tipo 'payment')
          console.log(`  ⏳ Subsequent payment ignored in parent expense: ${amount} [${account}] (${tx.uuid})`);
        }
      } else if (tx.paymentStatus === 'pending') {
        // Pago pendiente / Crédito: no ha salido dinero
        amountPaid = 0;
        console.log(`  ⏳ Pending expense payment: ${amount} [${account}] (${tx.uuid})`);
      } else {
        // Pago completo directo (sin array de pagos)
        console.log(`  💰 Full payment expense: ${amountPaid} [${account}] (${tx.uuid})`);
      }

      totalEgresos = addMoney(totalEgresos, amountPaid);

      // Por cuenta
      if (hasPayments && amountPaid > 0) {
        const firstPayment = tx.payments[0];
        const paymentAmount = parseMoneyNumber(firstPayment.amount || 0);
        const paymentAccount = firstPayment.account || firstPayment.method || 'cash';

        if (paymentAccount === 'cash') {
          egresosCash = addMoney(egresosCash, paymentAmount);
        } else if (paymentAccount === 'bank' || paymentAccount === 'yape' || paymentAccount === 'plin') {
          egresosBank = addMoney(egresosBank, paymentAmount);
        }
      } else {
        // Pago completo directo o pendiente (donde amountPaid es 0)
        if (account === 'cash') {
          egresosCash = addMoney(egresosCash, amountPaid);
        }
        if (account === 'bank' || account === 'yape' || account === 'plin') {
          egresosBank = addMoney(egresosBank, amountPaid);
        }
      }

      console.log(`  💸 Expense summary: ${amountPaid} of ${amount} [${account}] (${tx.uuid})`);
    }

    // === TRANSFERENCIAS ===
    // NOTA: Las transferencias NO cuentan para hasTxn (no afectan la racha)
    if (txType === 'transfer') {
      totalTransferencias = addMoney(totalTransferencias, amount);

      if (tx.fromAccount === 'cash') {
        transferenciasSalidaCash = addMoney(transferenciasSalidaCash, amount);
      }
      if (tx.toAccount === 'cash') {
        transferenciasEntradaCash = addMoney(transferenciasEntradaCash, amount);
      }
      if (tx.fromAccount === 'bank') {
        transferenciasSalidaBank = addMoney(transferenciasSalidaBank, amount);
      }
      if (tx.toAccount === 'bank') {
        transferenciasEntradaBank = addMoney(transferenciasEntradaBank, amount);
      }

      console.log(`  🔄 Transfer: ${amount} (${tx.fromAccount} -> ${tx.toAccount}) (${tx.uuid})`);
    }

    // === AJUSTES DE APERTURA ===
    if (subcategory === 'opening_adjustment') {
      if (txType === 'income') {
        if (account === 'cash') ajustesAperturaCash = addMoney(ajustesAperturaCash, amount);
        if (account === 'bank') ajustesAperturaBank = addMoney(ajustesAperturaBank, amount);
      }
      if (txType === 'expense') {
        if (account === 'cash') ajustesAperturaCash = subtractMoney(ajustesAperturaCash, amount);
        if (account === 'bank') ajustesAperturaBank = subtractMoney(ajustesAperturaBank, amount);
      }
      console.log(`  🔧 Opening adjustment: ${amount} [${account}] (${tx.uuid})`);
    }

    // === AJUSTES DE CIERRE ===
    if (subcategory === 'closure_adjustment') {
      if (txType === 'income') {
        if (account === 'cash') ajustesCierreCash = addMoney(ajustesCierreCash, amount);
        if (account === 'bank') ajustesCierreBank = addMoney(ajustesCierreBank, amount);
      }
      if (txType === 'expense') {
        if (account === 'cash') ajustesCierreCash = subtractMoney(ajustesCierreCash, amount);
        if (account === 'bank') ajustesCierreBank = subtractMoney(ajustesCierreBank, amount);
      }
      console.log(`  🔩 Closure adjustment: ${amount} [${account}] (${tx.uuid})`);
    }
  });

  // ===== CALCULAR EFECTOS NETOS DE TRANSFERENCIAS =====
  const efectoTransferenciasEnCash = subtractMoney(transferenciasEntradaCash, transferenciasSalidaCash);
  const efectoTransferenciasEnBank = subtractMoney(transferenciasEntradaBank, transferenciasSalidaBank);

  // ===== CALCULAR TOTALES DE AJUSTES =====
  const totalAjustesApertura = addMoney(ajustesAperturaCash, ajustesAperturaBank);
  const totalAjustesCierre = addMoney(ajustesCierreCash, ajustesCierreBank);
  const totalAjustes = addMoney(totalAjustesApertura, totalAjustesCierre);

  // ===== CALCULAR SALDOS INICIALES =====
  const saldoInicialCash = round2(openingTransaction
    ? (openingTransaction.realCashBalance || openingTransaction.totalCash || 0)
    : 0);
  const saldoInicialBank = round2(openingTransaction
    ? (openingTransaction.realBankBalance || openingTransaction.totalBank || 0)
    : 0);
  const saldoInicial = addMoney(saldoInicialCash, saldoInicialBank);

  // ===== CALCULAR BALANCES ESPERADOS (sin ajustes de cierre) =====
  const expectedFinalCash = addMoney(saldoInicialCash, ingresosCash, -egresosCash, efectoTransferenciasEnCash);
  const expectedFinalBank = addMoney(saldoInicialBank, ingresosBank, -egresosBank, efectoTransferenciasEnBank);
  const expectedFinalTotal = addMoney(expectedFinalCash, expectedFinalBank);

  // ===== CALCULAR SALDOS ACTUALES (con ajustes de cierre) =====
  const saldoActualCash = addMoney(expectedFinalCash, ajustesCierreCash);
  const saldoActualBank = addMoney(expectedFinalBank, ajustesCierreBank);
  const saldoActual = addMoney(saldoActualCash, saldoActualBank);

  // ===== CALCULAR RESULTADOS OPERACIONALES =====
  const resultadoOperacional = subtractMoney(totalIngresos, totalEgresos);
  const resultadoOperacionalCash = subtractMoney(ingresosCash, egresosCash);
  const resultadoOperacionalBank = subtractMoney(ingresosBank, egresosBank);
  const flujoNetoCash = addMoney(resultadoOperacionalCash, efectoTransferenciasEnCash);
  const flujoNetoBank = addMoney(resultadoOperacionalBank, efectoTransferenciasEnBank);

  // ===== ESTRUCTURA DE RETORNO (equivalente a accountsBalanceStore) =====
  const aggregates = {
    // Flags básicos
    hasOpening,
    hasClosure,
    hasTxn,

    // Datos de apertura (usando UUID)
    openingData: openingTransaction ? {
      uuid: openingTransaction.uuid,  // ✅ UUID principal
      id: openingTransaction.uuid,    // ✅ Mantener id por compatibilidad
      realCashBalance: saldoInicialCash,
      realBankBalance: saldoInicialBank,
      totalBalance: saldoInicial
    } : null,

    // Totales generales
    totals: {
      income: totalIngresos,
      expense: totalEgresos,
      net: resultadoOperacional,
      transfers: totalTransferencias,
      adjustments: totalAjustes
    },

    // Desglose por cuenta
    byAccount: {
      cash: {
        income: ingresosCash,
        expense: egresosCash,
        net: resultadoOperacionalCash
      },
      bank: {
        income: ingresosBank,
        expense: egresosBank,
        net: resultadoOperacionalBank
      }
    },

    // Información de transferencias
    transfers: {
      cash: {
        in: transferenciasEntradaCash,
        out: transferenciasSalidaCash,
        net: efectoTransferenciasEnCash
      },
      bank: {
        in: transferenciasEntradaBank,
        out: transferenciasSalidaBank,
        net: efectoTransferenciasEnBank
      },
      total: totalTransferencias
    },

    // Ajustes
    adjustments: {
      opening: {
        cash: ajustesAperturaCash,
        bank: ajustesAperturaBank,
        total: totalAjustesApertura
      },
      closure: {
        cash: ajustesCierreCash,
        bank: ajustesCierreBank,
        total: totalAjustesCierre
      },
      total: totalAjustes
    },

    // Saldos y balances
    balances: {
      initial: {
        cash: saldoInicialCash,
        bank: saldoInicialBank,
        total: saldoInicial
      },
      expected: {
        cash: expectedFinalCash,
        bank: expectedFinalBank,
        total: expectedFinalTotal
      },
      actual: {
        cash: saldoActualCash,
        bank: saldoActualBank,
        total: saldoActual
      }
    },

    // Resultados operacionales
    operational: {
      result: resultadoOperacional,
      resultCash: resultadoOperacionalCash,
      resultBank: resultadoOperacionalBank,
      flowCash: flujoNetoCash,
      flowBank: flujoNetoBank
    }
  };

  // Logs detallados
  console.log(`📊 Detailed aggregates calculated:`);
  console.log(`   💰 Total Income: ${totalIngresos} (Cash: ${ingresosCash}, Bank: ${ingresosBank})`);
  console.log(`   💸 Total Expense: ${totalEgresos} (Cash: ${egresosCash}, Bank: ${egresosBank})`);
  console.log(`   🔄 Transfers: ${totalTransferencias}`);
  console.log(`   🔧 Adjustments: ${totalAjustes} (Opening: ${totalAjustesApertura}, Closure: ${totalAjustesCierre})`);
  console.log(`   💼 Operational Result: ${resultadoOperacional}`);
  console.log(`   📌 Flags: opening=${hasOpening}, closure=${hasClosure}, hasTxn=${hasTxn}`);

  return aggregates;
}

/**
 * Inserta o actualiza el resumen diario (merge operation).
 * Similar a como transactionStore actualiza el estado.
 * 
 * @param {FirebaseFirestore.Firestore} db - Instancia de Firestore
 * @param {string} businessId - ID del negocio
 * @param {string} day - Día en formato 'yyyy-LL-dd'
 * @param {Object} patch - Datos a actualizar/insertar (estructura completa de getDayAggregates)
 * 
 * @returns {Promise<DocumentReference>} Referencia al documento actualizado
 * 
 * Estructura COMPLETA del documento dailySummary (equivalente a accountsBalanceStore):
 * 
 * {
 *   // === IDENTIFICACIÓN ===
 *   day: string,                    // 'yyyy-LL-dd'
 *   
 *   // === FLAGS BÁSICOS ===
 *   hasOpening: boolean,
 *   hasClosure: boolean,
 *   hasTxn: boolean,
 *   
 *   // === DATOS DE APERTURA ===
 *   openingData: {
 *     uuid: string,                 // ✅ UUID de la transacción de apertura
 *     id: string,                   // ✅ Igual a uuid (compatibilidad)
 *     realCashBalance: number,
 *     realBankBalance: number,
 *     totalBalance: number
 *   } | null,
 *   
 *   // === TOTALES GENERALES ===
 *   totals: {
 *     income: number,               // Total ingresos (sin ajustes)
 *     expense: number,              // Total egresos (sin ajustes)
 *     net: number,                  // Resultado operacional
 *     transfers: number,            // Total transferencias
 *     adjustments: number           // Total ajustes
 *   },
 *   
 *   // === DESGLOSE POR CUENTA ===
 *   byAccount: {
 *     cash: {
 *       income: number,
 *       expense: number,
 *       net: number                 // Resultado operacional cash
 *     },
 *     bank: {
 *       income: number,
 *       expense: number,
 *       net: number                 // Resultado operacional bank
 *     }
 *   },
 *   
 *   // === TRANSFERENCIAS ===
 *   transfers: {
 *     cash: {
 *       in: number,                 // Entradas a cash
 *       out: number,                // Salidas de cash
 *       net: number                 // Efecto neto en cash
 *     },
 *     bank: {
 *       in: number,                 // Entradas a bank
 *       out: number,                // Salidas de bank
 *       net: number                 // Efecto neto en bank
 *     },
 *     total: number                 // Total transferencias
 *   },
 *   
 *   // === AJUSTES ===
 *   adjustments: {
 *     opening: {
 *       cash: number,               // Ajustes apertura cash
 *       bank: number,               // Ajustes apertura bank
 *       total: number
 *     },
 *     closure: {
 *       cash: number,               // Ajustes cierre cash
 *       bank: number,               // Ajustes cierre bank
 *       total: number
 *     },
 *     total: number                 // Total todos los ajustes
 *   },
 *   
 *   // === BALANCES ===
 *   balances: {
 *     initial: {                    // Saldos iniciales (según apertura)
 *       cash: number,
 *       bank: number,
 *       total: number
 *     },
 *     expected: {                   // Saldos esperados (sin ajustes cierre)
 *       cash: number,
 *       bank: number,
 *       total: number
 *     },
 *     actual: {                     // Saldos actuales (con ajustes cierre)
 *       cash: number,
 *       bank: number,
 *       total: number
 *     }
 *   },
 *   
 *   // === RESULTADOS OPERACIONALES ===
 *   operational: {
 *     result: number,               // Resultado operacional total
 *     resultCash: number,           // Resultado operacional cash
 *     resultBank: number,           // Resultado operacional bank
 *     flowCash: number,             // Flujo neto cash (con transferencias)
 *     flowBank: number              // Flujo neto bank (con transferencias)
 *   },
 *   
 *   // === METADATA DE CIERRE AUTOMÁTICO (opcional) ===
 *   isAutoClosed: boolean,
 *   closureId: string,              // ✅ UUID de la transacción de cierre
 *   autoCloseReason: string,        // 'scheduled' | 'lazyOpen'
 *   completedAt: Timestamp,
 *   
 *   // === TIMESTAMPS ===
 *   lastUpdated: Timestamp
 * }
 */
async function upsertDailySummary(db, businessId, day, patch) {
  const ref = db.doc(`businesses/${businessId}/dailySummaries/${day}`);

  console.log(`💾 Upserting daily summary for ${day} with UUID-based structure`);

  await ref.set({
    day,
    ...patch
  }, { merge: true });

  console.log(`✅ Daily summary updated for ${day}`);

  return ref;
}

module.exports = { getDayAggregates, upsertDailySummary };
