/**
 * 📊 Store de Métricas de Producto
 * 
 * Gestiona cálculos y métricas avanzadas para productos en inventario:
 * - Última actualización (último movimiento de stock)
 * - Rotación de inventario (días promedio entre ventas)
 * - Balance de unidades (últimos 30 días vs histórico total)
 * - Valor total en stock
 * - Indicadores de rentabilidad
 * 
 * @module productMetricsStore
 */

import { defineStore } from 'pinia';

export const useProductMetricsStore = defineStore('productMetrics', () => {

  /**
   * 🕐 Obtener la última actualización del producto
   * @param {Array} stockLog - Array de movimientos de stock ordenados por fecha DESC
   * @returns {Object} { date: Date, type: string, formattedDate: string, relativeTime: string }
   */
  const getLastUpdate = (stockLog) => {
    if (!stockLog || stockLog.length === 0) {
      return {
        date: null,
        type: 'none',
        formattedDate: 'Sin movimientos',
        relativeTime: 'Sin actividad'
      };
    }

    // Obtener el ultimo elemento (más reciente)
    const lastLog = stockLog[stockLog.length - 1];


    // Convertir fecha de Firestore a Date
    let dateObj;
    if (lastLog.createdAt?.seconds) {
      dateObj = new Date(lastLog.createdAt.seconds * 1000);
    } else if (lastLog.createdAt instanceof Date) {
      dateObj = lastLog.createdAt;
    } else {
      dateObj = new Date(lastLog.createdAt);
    }

    // Formato de fecha completo
    const formattedDate = dateObj.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Tiempo relativo (hace X horas/días)
    const relativeTime = getRelativeTime(dateObj);

    return {
      date: dateObj,
      type: lastLog.type,
      formattedDate,
      relativeTime
    };
  };

  /**
   * 🔄 Calcular rotación de inventario (días promedio entre ventas)
   * @param {Array} stockLog - Array de movimientos de stock
   * @returns {Object} { days: number, status: string, hasEnoughData: boolean }
   */
  const getRotationDays = (stockLog) => {
    if (!stockLog || stockLog.length === 0) {
      return {
        days: null,
        status: 'Sin datos',
        hasEnoughData: false,
        message: 'No hay movimientos registrados'
      };
    }

    // Filtrar solo ventas (excluyendo devoluciones y mermas)
    const sales = stockLog.filter(log =>
      log.type === 'sell' &&
      !['return', 'damage', 'loss'].includes(log.subtype)
    );

    // Validar datos suficientes (mínimo 3 ventas)
    if (sales.length < 3) {
      return {
        days: null,
        status: 'Datos insuficientes',
        hasEnoughData: false,
        message: `Solo ${sales.length} venta(s). Se requieren al menos 3.`
      };
    }

    // Ordenar por fecha (más antigua a más reciente)
    const sortedSales = [...sales].sort((a, b) => {
      const dateA = getDateFromLog(a);
      const dateB = getDateFromLog(b);
      return dateA - dateB;
    });

    // Calcular diferencias entre ventas consecutivas
    const daysBetweenSales = [];
    for (let i = 1; i < sortedSales.length; i++) {
      const dateA = getDateFromLog(sortedSales[i - 1]);
      const dateB = getDateFromLog(sortedSales[i]);
      const diffInMs = dateB - dateA;
      const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
      daysBetweenSales.push(diffInDays);
    }

    // Promedio de días entre ventas
    const avgDays = daysBetweenSales.reduce((sum, days) => sum + days, 0) / daysBetweenSales.length;
    const roundedDays = Math.round(avgDays);

    // Determinar estado de rotación
    let status;
    if (roundedDays <= 3) {
      status = 'Rotación rápida';
    } else if (roundedDays <= 7) {
      status = 'Rotación normal';
    } else if (roundedDays <= 15) {
      status = 'Rotación lenta';
    } else {
      status = 'Rotación muy lenta';
    }

    return {
      days: roundedDays,
      status,
      hasEnoughData: true,
      message: `Promedio de ${roundedDays} día(s) entre ventas`,
      totalSales: sales.length
    };
  };

  /**
   * ⚖️ Calcular balance de unidades
   * @param {Array} stockLog - Array de movimientos de stock
   * @param {number|null} days - Período en días (null para histórico total)
   * @returns {Object} Balance detallado con unidades y valores monetarios
   */
  const getUnitBalance = (stockLog, days = 30) => {
    if (!stockLog || stockLog.length === 0) {
      return {
        period: days ? `${days} días` : 'Total',
        sales: { units: 0, count: 0, total: 0 },
        purchases: { units: 0, count: 0, total: 0 },
        balance: { units: 0, percentage: 0 },
        hasCostData: false
      };
    }

    // Filtrar por período si es necesario
    let filteredLogs = stockLog;
    if (days !== null) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      filteredLogs = stockLog.filter(log => {
        const logDate = getDateFromLog(log);
        return logDate >= cutoffDate;
      });
    }

    // Calcular ventas
    const salesLogs = filteredLogs.filter(log => log.type === 'sell');
    const totalSalesUnits = salesLogs.reduce((sum, log) => sum + (log.quantity || 0), 0);
    const totalSalesAmount = salesLogs.reduce((sum, log) => {
      if (log.price && log.quantity) {
        return sum + (log.price * log.quantity);
      }
      return sum;
    }, 0);

    // Calcular compras
    const purchasesLogs = filteredLogs.filter(log => log.type === 'buy');
    const totalPurchasesUnits = purchasesLogs.reduce((sum, log) => sum + (log.quantity || 0), 0);
    const totalPurchasesAmount = purchasesLogs.reduce((sum, log) => {
      if (log.cost && log.quantity) {
        return sum + (log.cost * log.quantity);
      }
      return sum;
    }, 0);

    // Balance de unidades
    const balanceUnits = totalPurchasesUnits - totalSalesUnits;
    const balancePercentage = totalPurchasesUnits > 0
      ? ((totalSalesUnits / totalPurchasesUnits) * 100).toFixed(1)
      : 0;

    // Verificar si hay datos de costo/precio
    const hasCostData = salesLogs.some(log => log.price) || purchasesLogs.some(log => log.cost);

    return {
      period: days ? `${days} días` : 'Total',
      sales: {
        units: totalSalesUnits,
        count: salesLogs.length,
        total: totalSalesAmount
      },
      purchases: {
        units: totalPurchasesUnits,
        count: purchasesLogs.length,
        total: totalPurchasesAmount
      },
      balance: {
        units: balanceUnits,
        percentage: parseFloat(balancePercentage)
      },
      hasCostData
    };
  };

  /**
   * 💰 Calcular valor total en stock
   * @param {number} stock - Cantidad actual en stock
   * @param {number|null} cost - Costo por unidad
   * @returns {Object} { value: number, hasData: boolean }
   */
  const getStockValue = (stock, cost) => {
    if (!cost || cost === 0 || !stock || stock === 0) {
      return {
        value: 0,
        hasData: false,
        message: 'Costo no disponible'
      };
    }

    return {
      value: stock * cost,
      hasData: true,
      message: `${stock} uni × S/ ${cost.toFixed(2)}`
    };
  };

  /**
   * 📈 Obtener indicador de rentabilidad
   * @param {number|null} marginPercentage - Porcentaje de margen
   * @returns {Object} { label: string, color: string, icon: string }
   */
  const getProfitabilityStatus = (marginPercentage) => {
    if (marginPercentage === null || marginPercentage === undefined || isNaN(marginPercentage)) {
      return {
        label: 'Sin datos de costo',
        color: 'gray',
        bgClass: 'bg-gray-100 text-gray-700 border-gray-200',
        icon: '❔',
        description: 'Registra el costo para calcular el markup'
      };
    }

    const margin = parseFloat(marginPercentage);

    if (margin >= 50) {
      return {
        label: 'Markup excelente',
        color: 'emerald',
        bgClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        icon: '💹',
        description: 'Más del 50% sobre el costo de compra'
      };
    } else if (margin >= 40) {
      return {
        label: 'Buen markup',
        color: 'green',
        bgClass: 'bg-green-100 text-green-800 border-green-200',
        icon: '📈',
        description: 'Entre 40% y 50% sobre el costo de compra'
      };
    } else if (margin >= 25) {
      return {
        label: 'Markup aceptable',
        color: 'lime',
        bgClass: 'bg-lime-100 text-lime-800 border-lime-200',
        icon: '✅',
        description: 'Entre 25% y 40% sobre el costo de compra'
      };
    } else if (margin >= 15) {
      return {
        label: 'Markup ajustado',
        color: 'yellow',
        bgClass: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: '⚠️',
        description: 'Revisar precio o costo de compra'
      };
    } else if (margin >= 0) {
      return {
        label: 'Markup bajo (Revisar costos)',
        color: 'orange',
        bgClass: 'bg-orange-100 text-orange-800 border-orange-200',
        icon: '⚡',
        description: 'Menos del 15% sobre el costo — revisar precios'
      };
    } else {
      return {
        label: 'Vendiendo a pérdida',
        color: 'red',
        bgClass: 'bg-red-100 text-red-800 border-red-200',
        icon: '🚨',
        description: 'El precio de venta está por debajo del costo'
      };
    }
  };

  // ==========================================
  // HELPER FUNCTIONS (Privadas)
  // ==========================================

  /**
   * Convertir log.createdAt a Date object
   */
  const getDateFromLog = (log) => {
    if (!log.createdAt) return new Date(0);

    if (log.createdAt.seconds) {
      return new Date(log.createdAt.seconds * 1000);
    } else if (log.createdAt instanceof Date) {
      return log.createdAt;
    } else {
      return new Date(log.createdAt);
    }
  };

  /**
   * Obtener tiempo relativo (hace X horas/días)
   */
  const getRelativeTime = (date) => {
    const now = new Date();
    const diffInMs = now - date;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) return 'Hace un momento';
    if (diffInMinutes < 60) return `Hace ${diffInMinutes} min`;
    if (diffInHours < 24) return `Hace ${diffInHours}h`;
    if (diffInDays === 1) return 'Ayer';
    if (diffInDays < 7) return `Hace ${diffInDays} días`;
    if (diffInDays < 30) return `Hace ${Math.floor(diffInDays / 7)} semana(s)`;
    return date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
  };

  /**
   * 💵 Obtener indicador de rentabilidad de venta (margen sobre precio de venta)
   * Fórmula: (precio - costo) / precio × 100
   * @param {number|null} saleMarginPercentage - Porcentaje de margen sobre precio de venta
   * @returns {Object} { label: string, color: string, bgClass: string, icon: string, description: string }
   */
  const getSaleMarginStatus = (saleMarginPercentage) => {
    if (saleMarginPercentage === null || saleMarginPercentage === undefined || isNaN(saleMarginPercentage)) {
      return {
        label: 'Sin datos',
        color: 'gray',
        bgClass: 'bg-gray-100 text-gray-700 border-gray-200',
        icon: '❔',
        description: 'Registra el costo para ver la rentabilidad de venta'
      };
    }

    const margin = parseFloat(saleMarginPercentage);

    if (margin >= 40) {
      return {
        label: 'Margen de utilidad excelente',
        color: 'teal',
        bgClass: 'bg-teal-100 text-teal-800 border-teal-200',
        icon: '💵',
        description: 'Ganas más del 40% del precio final'
      };
    } else if (margin >= 30) {
      return {
        label: 'Buen margen de utilidad',
        color: 'cyan',
        bgClass: 'bg-cyan-100 text-cyan-800 border-cyan-200',
        icon: '📊',
        description: 'Ganas entre el 30% y 40% del precio final'
      };
    } else if (margin >= 20) {
      return {
        label: 'Margen de utilidad aceptable',
        color: 'sky',
        bgClass: 'bg-sky-100 text-sky-800 border-sky-200',
        icon: '✅',
        description: 'Ganas entre el 20% y 30% del precio final'
      };
    } else if (margin >= 10) {
      return {
        label: 'Margen ajustado (Revisar costos)',
        color: 'yellow',
        bgClass: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: '⚠️',
        description: 'Ganas entre el 10% y 20% del precio final'
      };
    } else if (margin >= 0) {
      return {
        label: 'Margen bajo (Revisar costos)',
        color: 'orange',
        bgClass: 'bg-orange-100 text-orange-800 border-orange-200',
        icon: '⚡',
        description: 'Menos del 10% del precio final es ganancia'
      };
    } else {
      return {
        label: 'Margen negativo',
        color: 'red',
        bgClass: 'bg-red-100 text-red-800 border-red-200',
        icon: '🚨',
        description: 'El precio de venta no cubre el costo'
      };
    }
  };

  // ==========================================
  // EXPORTS
  // ==========================================

  return {
    // Métodos principales
    getLastUpdate,
    getRotationDays,
    getUnitBalance,
    getStockValue,
    getProfitabilityStatus,
    getSaleMarginStatus
  };
});
