// src/config/roles/roleTemplates.js
import { mapModulesToLegacyPermissions } from './moduleDefinitions';

export const ROLE_TEMPLATES = {
  restaurante: [
    {
      rolNombre: 'Cajero',
      icon: 'Wallet',
      description: 'Gestiona cobros, ve saldos de cuentas y registra movimientos de caja.',
      modulosAcceso: ['dashboard', 'sales', 'clients', 'records', 'accountsBalance', 'accountsReceivable'],
      canCreate: true,
      canEdit: false,
      canDelete: false
    },
    {
      rolNombre: 'Mesero',
      icon: 'User',
      description: 'Registra pedidos, atiende clientes y visualiza el catálogo de productos.',
      modulosAcceso: ['dashboard', 'sales', 'clients', 'inventory'],
      canCreate: true,
      canEdit: false,
      canDelete: false
    },
    {
      rolNombre: 'Cocinero',
      icon: 'BoxIso',
      description: 'Visualiza el inventario y catálogo para control de insumos y preparación.',
      modulosAcceso: ['dashboard', 'inventory'],
      canCreate: false,
      canEdit: false,
      canDelete: false
    },
    {
      rolNombre: 'Repartidor',
      icon: 'User',
      description: 'Ve el dashboard y visualiza entregas y datos de clientes.',
      modulosAcceso: ['dashboard', 'clients'],
      canCreate: false,
      canEdit: false,
      canDelete: false
    }
  ],
  ferreteria: [
    {
      rolNombre: 'Cajero',
      icon: 'Wallet',
      description: 'Gestiona cobros, créditos y visualiza saldos de cuentas.',
      modulosAcceso: ['dashboard', 'sales', 'clients', 'records', 'accountsBalance', 'accountsReceivable'],
      canCreate: true,
      canEdit: false,
      canDelete: false
    },
    {
      rolNombre: 'Vendedor',
      icon: 'User',
      description: 'Consulta productos en inventario, gestiona pedidos y registra ventas.',
      modulosAcceso: ['dashboard', 'sales', 'inventory', 'clients', 'orders'],
      canCreate: true,
      canEdit: false,
      canDelete: false
    },
    {
      rolNombre: 'Almacenero',
      icon: 'BoxIso',
      description: 'Control absoluto del stock, carga de productos e ingresos/egresos de materiales.',
      modulosAcceso: ['dashboard', 'inventory'],
      canCreate: true, // Para registrar movimientos de stock
      canEdit: true,
      canDelete: false
    }
  ],
  reposteria: [
    {
      rolNombre: 'Cajero',
      icon: 'Wallet',
      description: 'Gestiona cobros, caja diaria y cuentas pendientes.',
      modulosAcceso: ['dashboard', 'sales', 'clients', 'records', 'accountsBalance', 'accountsReceivable'],
      canCreate: true,
      canEdit: false,
      canDelete: false
    },
    {
      rolNombre: 'Pastelero',
      icon: 'BoxIso',
      description: 'Control de recetas, insumos en inventario y producción.',
      modulosAcceso: ['dashboard', 'inventory'],
      canCreate: false,
      canEdit: false,
      canDelete: false
    },
    {
      rolNombre: 'Repartidor',
      icon: 'User',
      description: 'Consulta datos de clientes y direcciones de entrega.',
      modulosAcceso: ['dashboard', 'clients'],
      canCreate: false,
      canEdit: false,
      canDelete: false
    }
  ],
  libreria: [
    {
      rolNombre: 'Cajero',
      icon: 'Wallet',
      description: 'Realiza ventas, cobros y arqueos de caja.',
      modulosAcceso: ['dashboard', 'sales', 'clients', 'records', 'accountsBalance'],
      canCreate: true,
      canEdit: false,
      canDelete: false
    },
    {
      rolNombre: 'Vendedor',
      icon: 'User',
      description: 'Atiende clientes, consulta disponibilidad de libros y registra ventas.',
      modulosAcceso: ['dashboard', 'sales', 'inventory', 'clients'],
      canCreate: true,
      canEdit: false,
      canDelete: false
    }
  ],
  farmacia: [
    {
      rolNombre: 'Cajero',
      icon: 'Wallet',
      description: 'Facturación, cobros por Yape/Plin/Efectivo y arqueo.',
      modulosAcceso: ['dashboard', 'sales', 'clients', 'records', 'accountsBalance'],
      canCreate: true,
      canEdit: false,
      canDelete: false
    },
    {
      rolNombre: 'Farmacéutico',
      icon: 'User',
      description: 'Consulta recetas, verifica stock de medicamentos y asesora a clientes.',
      modulosAcceso: ['dashboard', 'sales', 'inventory', 'clients', 'orders'],
      canCreate: true,
      canEdit: false,
      canDelete: false
    },
    {
      rolNombre: 'Despachador',
      icon: 'BoxIso',
      description: 'Búsqueda de medicamentos en almacén y entrega de pedidos.',
      modulosAcceso: ['dashboard', 'inventory'],
      canCreate: false,
      canEdit: false,
      canDelete: false
    }
  ],
  otro: [
    {
      rolNombre: 'Cajero',
      icon: 'Wallet',
      description: 'Control de caja general y registro de cobros.',
      modulosAcceso: ['dashboard', 'sales', 'clients', 'records', 'accountsBalance'],
      canCreate: true,
      canEdit: false,
      canDelete: false
    },
    {
      rolNombre: 'Vendedor',
      icon: 'User',
      description: 'Gestión de clientes, pedidos y registro de ventas.',
      modulosAcceso: ['dashboard', 'sales', 'inventory', 'clients', 'orders'],
      canCreate: true,
      canEdit: false,
      canDelete: false
    },
    {
      rolNombre: 'Asistente',
      icon: 'User',
      description: 'Soporte operativo y visualización de inventario.',
      modulosAcceso: ['dashboard', 'inventory', 'clients'],
      canCreate: false,
      canEdit: false,
      canDelete: false
    }
  ]
};

/**
 * Retorna las plantillas sugeridas para una industria dada.
 * Si no coincide, retorna las plantillas de 'otro'.
 * @param {string} industry 
 * @returns {Array}
 */
export function getTemplatesForIndustry(industry) {
  const normIndustry = (industry || '').toLowerCase().trim();
  return ROLE_TEMPLATES[normIndustry] || ROLE_TEMPLATES['otro'];
}

/**
 * Deriva los permisos legados a partir de los módulos de acceso y flags globales.
 */
export function derivePermissions(modulosAcceso, canCreate, canEdit, canDelete) {
  return mapModulesToLegacyPermissions(modulosAcceso, canCreate, canEdit, canDelete);
}

export { mapModulesToLegacyPermissions };
