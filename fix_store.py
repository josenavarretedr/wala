#!/usr/bin/env python3
# -*- coding: utf-8 -*-

# Script para aplicar cambios al accountsBalanceStore.js sin emojis

import re

# Leer el archivo
with open('src/stores/AccountsBalanceApp/accountsBalanceStore.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Definir el bloque a reemplazar (desde getDailySummaryComposable hasta el final de ingresosBank)
old_block = """  /**
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
  });"""

new_block = """  /**
   * Helper para obtener una nueva instancia del composable
   * Esto asegura reactividad correcta en los computed
   */
  const getDailySummaryComposable = () => useDailySummary();

  /**
   * Helper: Calcula el monto realmente recibido de una transaccion
   * considerando pagos parciales
   */
  const calculateReceivedAmount = (transaction) => {
    if (transaction.type !== 'income') {
      return transaction.amount || 0;
    }

    if (transaction.paymentStatus === 'partial') {
      return transaction.totalPaid || 0;
    } else if (transaction.paymentStatus === 'pending') {
      return 0;
    } else if (transaction.paymentStatus === 'completed') {
      return transaction.amount || 0;
    }

    return transaction.amount || 0;
  };


  // ===== CALCULOS DE INGRESOS =====

  /**
   * Total de ingresos reales (ventas), excluyendo ajustes
   * ACTUALIZADO: Considera solo ingresos REALMENTE RECIBIDOS
   * HIBRIDO: Prioriza dailySummary, fallback a calculo manual
   */
  const totalIngresos = computed(() => {
    if (hasDailySummary.value) {
      return getDailySummaryComposable().getTotalIngresos(dailySummary.value);
    }

    let total = 0;
    transactions.value.forEach(tx => {
      if (tx.type === 'income' && tx.category !== 'adjustment') {
        total = addMoney(total, calculateReceivedAmount(tx));
      } else if (tx.type === 'payment') {
        total = addMoney(total, tx.amount || 0);
      }
    });
    return total;
  });

  /**
   * Ingresos por efectivo, excluyendo ajustes de apertura
   * ACTUALIZADO: Considera solo pagos realmente recibidos en efectivo
   * HIBRIDO: Prioriza dailySummary, fallback a calculo manual
   */
  const ingresosCash = computed(() => {
    if (hasDailySummary.value) {
      return getDailySummaryComposable().getIngresosCash(dailySummary.value);
    }

    let total = 0;
    transactions.value.forEach(tx => {
      if (tx.type === 'income' && tx.category !== 'adjustment' && tx.subcategory !== 'opening_adjustment') {
        if (tx.paymentStatus === 'partial' && tx.payments && Array.isArray(tx.payments)) {
          tx.payments.forEach(payment => {
            if (payment.method === 'cash') {
              total = addMoney(total, payment.amount || 0);
            }
          });
        } else if (tx.paymentStatus === 'completed' && tx.account === 'cash') {
          total = addMoney(total, tx.amount || 0);
        }
      } else if (tx.type === 'payment' && tx.account === 'cash') {
        total = addMoney(total, tx.amount || 0);
      }
    });
    return total;
  });

  /**
   * Ingresos por banco/digital, excluyendo ajustes de apertura
   * ACTUALIZADO: Considera solo pagos realmente recibidos en digital
   * HIBRIDO: Prioriza dailySummary, fallback a calculo manual
   */
  const ingresosBank = computed(() => {
    if (hasDailySummary.value) {
      return getDailySummaryComposable().getIngresosBank(dailySummary.value);
    }

    let total = 0;
    transactions.value.forEach(tx => {
      if (tx.type === 'income' && tx.category !== 'adjustment' && tx.subcategory !== 'opening_adjustment') {
        if (tx.paymentStatus === 'partial' && tx.payments && Array.isArray(tx.payments)) {
          tx.payments.forEach(payment => {
            if (payment.method === 'bank' || payment.method === 'yape' || payment.method === 'plin') {
              total = addMoney(total, payment.amount || 0);
            }
          });
        } else if (tx.paymentStatus === 'completed' && (tx.account === 'bank' || tx.account === 'yape' || tx.account === 'plin')) {
          total = addMoney(total, tx.amount || 0);
        }
      } else if (tx.type === 'payment' && (tx.account === 'bank' || tx.account === 'yape' || tx.account === 'plin')) {
        total = addMoney(total, tx.amount || 0);
      }
    });
    return total;
  });"""

# Reemplazar
if old_block in content:
    content = content.replace(old_block, new_block)
    print("✅ Bloque reemplazado exitosamente")
else:
    print("❌ No se encontró el bloque a reemplazar")
    # Intentar sin emojis
    old_block_no_emoji = old_block.replace('🚀 ', '')
    if old_block_no_emoji in content:
        content = content.replace(old_block_no_emoji, new_block)
        print("✅ Bloque reemplazado (versión sin emojis)")
    else:
        print("❌ Tampoco se encontró la versión sin emojis")

# Escribir el archivo
with open('src/stores/AccountsBalanceApp/accountsBalanceStore.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Archivo guardado")
