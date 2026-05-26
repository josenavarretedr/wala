// src/config/roles/moduleDefinitions.js

export const MODULE_DEFINITIONS = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: 'ViewGrid',
    description: 'Panel principal con indicadores generales y resumen del negocio.',
    route: 'BusinessDashboard'
  },
  {
    key: 'sales',
    label: 'Ventas (Ingresos)',
    icon: 'TrendingUp',
    description: 'Registrar ventas, cobros y ver el flujo de ingresos.',
    route: 'IncomeManagement'
  },
  {
    key: 'expenses',
    label: 'Gastos (Egresos)',
    icon: 'TrendingDown',
    description: 'Registrar egresos, pagos a proveedores y compras de materiales.',
    route: 'ExpensesView' // or basicAccountingRecordsBook/expenses
  },
  {
    key: 'inventory',
    label: 'Inventario',
    icon: 'Database',
    description: 'Control de stock de productos, insumos y catálogo.',
    route: 'InventoryDashboard'
  },
  {
    key: 'clients',
    label: 'Clientes',
    icon: 'User',
    description: 'Directorio de clientes, historial de compras y contactos.',
    route: 'ClientsDashboard'
  },
  {
    key: 'accountsReceivable',
    label: 'Cuentas por Cobrar',
    icon: 'Hourglass',
    description: 'Seguimiento de ventas al crédito y cobros pendientes.',
    route: 'AccountsReceivable'
  },
  {
    key: 'accountsBalance',
    label: 'Balance de Cuentas',
    icon: 'Wallet',
    description: 'Monitoreo de saldos en Caja Chica, Bancos y billeteras digitales (Yape/Plin).',
    route: 'AccountBalanceApp'
  },
  {
    key: 'records',
    label: 'Historial',
    icon: 'HistoricShield',
    description: 'Ver transacciones pasadas y cierres de caja detallados.',
    route: 'AllRecords'
  },
  {
    key: 'incomeStatement',
    label: 'Estado de Resultados',
    icon: 'GraphUp',
    description: 'Estado de ganancias y pérdidas automatizado del negocio.',
    route: 'IncomeStatement'
  },
  {
    key: 'consulting',
    label: 'Asesoría WALA',
    icon: 'LightBulb',
    description: 'Recomendaciones financieras y mentoría inteligente.',
    route: 'ConsultingDashboard'
  },
  {
    key: 'quotes',
    label: 'Cotizaciones',
    icon: 'Page',
    description: 'Creación y seguimiento de presupuestos para clientes.',
    route: 'Quotes'
  }
];

// Helper to map module keys to the legacy boolean permissions in Wala
export function mapModulesToLegacyPermissions(modulosAcceso, canCreate, canEdit, canDelete) {
  return {
    verIngresos: modulosAcceso.includes('sales') || modulosAcceso.includes('dashboard'),
    verEgresos: modulosAcceso.includes('expenses') || modulosAcceso.includes('dashboard'),
    crearMovimientos: canCreate === true,
    editarMovimientos: canEdit === true,
    // Empleados no deben poder borrar movimientos por defecto a menos que se les dé permiso explícito de canDelete
    verReportes: modulosAcceso.includes('records') || modulosAcceso.includes('incomeStatement') || modulosAcceso.includes('dashboard'),
    gestionarEmpleados: false, // Reservado solo para gerentes
    configurarNegocio: false   // Reservado solo para gerentes
  };
}
