// Catálogo tipado y reglas operativas del Banco de Acciones WALA (189 acciones)
// Conecta cada acción de los BA con su arquetipo operativo:
// - 'config': Configuración única (inline hacia settings/businessProfile o profundo en Inventario/Costeo)
// - 'habit': Hábito recurrente/evento registrado en WALA (deep-link + evidencia automática)
// - 'note': Bitácora o acuerdo reflexivo registrado en el expediente de asesoría
// - 'review': Revisión periódica de un reporte real de WALA + conclusión del ciclo

export const ACTION_TYPE_LABELS = {
  config: "Configuración",
  habit: "Hábito en WALA",
  note: "Bitácora",
  review: "Revisión",
};

export const PROMO_CHANNEL_OPTIONS = [
  { value: "WhatsApp", label: "WhatsApp / Catálogo" },
  { value: "Facebook", label: "Facebook" },
  { value: "Instagram", label: "Instagram" },
  { value: "TikTok", label: "TikTok" },
  { value: "Recomendación", label: "Recomendación / Boca a boca" },
  { value: "Punto de venta", label: "Punto de venta físico / Volantes" },
];

export const ACTION_BANK_META = {
  // ==========================================================
  // ÁREA 1 — NEGOCIOS Y FAMILIA
  // ==========================================================
  "1.1_0-1_1": {
    actionType: "habit",
    targetRoute: "basicAccountingRecordsBook",
    presetParams: { type: "expense", preset: "owner_draw" },
    ctaLabel: "Registrar retiro personal",
    evidenceRule: {
      type: "tx_subcategory_count",
      subcategory: "personal_withdrawal",
      period: "week",
      minCount: 1,
    },
  },
  "1.1_0-1_2": {
    actionType: "config",
    targetRoute: "business-info",
    configKey: "ownerSalaryTarget",
    inputType: "currency",
    ctaLabel: "Definir meta mensual en Perfil",
    promptPlaceholder: "Ej: 1500.00 (lo mínimo que necesitas al mes para tu hogar)",
    evidenceRule: { type: "profile_field_set", field: "ownerSalaryTarget" },
  },
  "1.1_0-1_3": {
    actionType: "note",
    promptPlaceholder:
      "Escribe la conclusión de tu conversación sobre la diferencia entre sacar sobrantes y pagarte un salario...",
    evidenceRule: { type: "note_filled" },
  },
  "1.1_1-2_1": {
    actionType: "config",
    targetRoute: "business-info",
    configKey: "ownerSalaryAmount",
    inputType: "currency",
    ctaLabel: "Definir salario fijo del dueño",
    promptPlaceholder: "Ej: 350.00 (monto fijo semanal/mensual que te pagas)",
    evidenceRule: { type: "profile_field_set", field: "ownerSalaryAmount" },
  },
  "1.1_1-2_2": {
    actionType: "habit",
    targetRoute: "basicAccountingRecordsBook",
    presetParams: { type: "expense", preset: "owner_salary" },
    ctaLabel: "Registrar salario del dueño",
    evidenceRule: {
      type: "tx_subcategory_count",
      subcategory: "owner_salary",
      period: "week",
      minCount: 1,
    },
  },
  "1.1_1-2_3": {
    actionType: "review",
    targetRoute: "expenses",
    ctaLabel: "Revisar egresos de la semana",
    promptPlaceholder:
      "¿Te pagaste la semana pasada? Si no alcanzó, anota el motivo aquí...",
    evidenceRule: {
      type: "tx_subcategory_count",
      subcategory: "owner_salary",
      period: "week",
      minCount: 1,
    },
  },
  "1.1_2-3_1": {
    actionType: "review",
    targetRoute: "expenses",
    ctaLabel: "Revisar historial mensual",
    promptPlaceholder:
      "Anota cuántas semanas te pagaste este mes y qué patrón detectaste...",
    evidenceRule: {
      type: "tx_subcategory_count",
      subcategory: "owner_salary",
      period: "month",
      minCount: 2,
    },
  },
  "1.1_2-3_2": {
    actionType: "note",
    promptPlaceholder:
      "Si una semana no llegaste a pagarte, anota aquí qué lo impidió (compra inesperada, bajas ventas, etc.)...",
    evidenceRule: { type: "note_filled" },
  },
  "1.1_2-3_3": {
    actionType: "config",
    targetRoute: "business-info",
    configKey: "ownerSalaryAmount",
    inputType: "currency",
    ctaLabel: "Ajustar salario en Perfil",
    promptPlaceholder: "Nuevo monto fijo realista que puedas cumplir cada semana...",
    evidenceRule: { type: "profile_field_set", field: "ownerSalaryAmount" },
  },

  "1.2_0-1_1": {
    actionType: "note",
    promptPlaceholder: "Lista de familiares que apoyan actualmente en el negocio...",
    evidenceRule: { type: "note_filled" },
  },
  "1.2_0-1_2": {
    actionType: "note",
    promptPlaceholder: "Horas aproximadas por semana de cada familiar...",
    evidenceRule: { type: "note_filled" },
  },
  "1.2_0-1_3": {
    actionType: "note",
    promptPlaceholder: "Reflexión sobre el costo real del trabajo familiar...",
    evidenceRule: { type: "note_filled" },
  },
  "1.2_1-2_1": {
    actionType: "note",
    promptPlaceholder:
      "Acuerdo de compensación por familiar (ej: Hermano S/ 200 semanal)...",
    evidenceRule: { type: "note_filled" },
  },
  "1.2_1-2_2": {
    actionType: "habit",
    targetRoute: "basicAccountingRecordsBook",
    presetParams: { type: "expense", preset: "family_salary" },
    ctaLabel: "Registrar salario a familiar",
    evidenceRule: {
      type: "tx_subcategory_count",
      subcategory: "family_salary",
      period: "week",
      minCount: 1,
    },
  },
  "1.2_1-2_3": {
    actionType: "note",
    promptPlaceholder:
      "Si esta semana no pudiste pagar a un familiar, anota quién fue y el motivo...",
    evidenceRule: { type: "note_filled" },
  },
  "1.2_2-3_1": {
    actionType: "review",
    targetRoute: "expenses",
    ctaLabel: "Revisar pagos a familiares",
    promptPlaceholder:
      "¿Todos los familiares recibieron su compensación acordada este mes?",
    evidenceRule: {
      type: "tx_subcategory_count",
      subcategory: "family_salary",
      period: "month",
      minCount: 1,
    },
  },
  "1.2_2-3_2": {
    actionType: "habit",
    targetRoute: "basicAccountingRecordsBook",
    presetParams: { type: "expense", preset: "family_salary" },
    ctaLabel: "Registrar salario familiar",
    evidenceRule: {
      type: "tx_subcategory_count",
      subcategory: "family_salary",
      period: "month",
      minCount: 1,
    },
  },
  "1.2_2-3_3": {
    actionType: "review",
    targetRoute: "income-statement",
    ctaLabel: "Ver Estado de Resultados",
    promptPlaceholder:
      "Anota el % que representó el salario familiar sobre el total de gastos...",
    evidenceRule: { type: "note_filled" },
  },

  "1.3_0-1_1": {
    actionType: "habit",
    targetRoute: "basicAccountingRecordsBook",
    presetParams: { type: "expense", preset: "owner_draw" },
    ctaLabel: "Registrar retiro personal",
    evidenceRule: {
      type: "tx_subcategory_count",
      subcategory: "personal_withdrawal",
      period: "week",
      minCount: 1,
    },
  },
  "1.3_0-1_2": {
    actionType: "review",
    targetRoute: "income-statement",
    ctaLabel: "Ver retiros de la semana",
    promptPlaceholder: "Suma total retirada esta semana para gastos personales...",
    evidenceRule: {
      type: "tx_subcategory_count",
      subcategory: "personal_withdrawal",
      period: "week",
      minCount: 1,
    },
  },
  "1.3_0-1_3": {
    actionType: "note",
    promptPlaceholder:
      "¿Qué habría podido hacer el negocio con ese dinero (mercadería, proveedor, deuda)?",
    evidenceRule: { type: "note_filled" },
  },
  "1.3_1-2_1": {
    actionType: "note",
    promptPlaceholder: "Tu regla/compromiso personal antes de retirar caja...",
    evidenceRule: { type: "note_filled" },
  },
  "1.3_1-2_2": {
    actionType: "habit",
    targetRoute: "basicAccountingRecordsBook",
    presetParams: { type: "expense", preset: "owner_draw" },
    ctaLabel: "Registrar retiro con motivo",
    evidenceRule: {
      type: "tx_subcategory_count",
      subcategory: "personal_withdrawal",
      period: "week",
      minCount: 1,
    },
  },
  "1.3_1-2_3": {
    actionType: "review",
    targetRoute: "expenses",
    ctaLabel: "Revisar completitud de retiros",
    promptPlaceholder:
      "¿Faltó registrar algún retiro esta semana? Anótalo aquí si ya lo regularizaste...",
    evidenceRule: {
      type: "tx_subcategory_count",
      subcategory: "personal_withdrawal",
      period: "week",
      minCount: 1,
    },
  },
  "1.3_2-3_1": {
    actionType: "review",
    targetRoute: "expenses",
    ctaLabel: "Revisar gastos vs. retiros",
    promptPlaceholder: "Anota si encontraste gastos personales mezclados y qué ajuste hiciste...",
    evidenceRule: { type: "note_filled" },
  },
  "1.3_2-3_2": {
    actionType: "review",
    targetRoute: "income-statement",
    ctaLabel: "Comparar retiros en P&L",
    promptPlaceholder: "¿Subieron, bajaron o se mantuvieron tus retiros este mes?",
    evidenceRule: { type: "note_filled" },
  },
  "1.3_2-3_3": {
    actionType: "config",
    targetRoute: "business-info",
    configKey: "ownerSalaryAmount",
    inputType: "currency",
    ctaLabel: "Ajustar salario en Perfil",
    evidenceRule: { type: "profile_field_set", field: "ownerSalaryAmount" },
  },

  // ==========================================================
  // ÁREA 2 — MARKETING
  // ==========================================================
  "2.1_0-1_1": {
    actionType: "habit",
    targetRoute: "clients",
    ctaLabel: "Ir a Clientes",
    evidenceRule: { type: "note_filled" },
  },
  "2.1_0-1_2": {
    actionType: "note",
    targetRoute: "clients",
    ctaLabel: "Ver Clientes",
    promptPlaceholder: "Describe a tu cliente principal: qué hace, para qué compra y qué valora...",
    evidenceRule: { type: "note_filled" },
  },
  "2.1_2-3_1": {
    actionType: "review",
    targetRoute: "clients",
    ctaLabel: "Analizar clientes",
    promptPlaceholder: "¿Qué tipo de cliente generó más ingresos este mes?",
    evidenceRule: { type: "note_filled" },
  },
  "2.2_0-1_2": {
    actionType: "config",
    targetRoute: "business-info",
    configKey: "primaryPromoChannel",
    inputType: "select",
    options: PROMO_CHANNEL_OPTIONS,
    ctaLabel: "Definir canal de promoción",
    evidenceRule: { type: "profile_field_set", field: "primaryPromoChannel" },
  },
  "2.2_0-1_3": {
    actionType: "habit",
    targetRoute: "clients",
    ctaLabel: "Registrar origen en Clientes",
    evidenceRule: { type: "clients_with_origin_week", minCount: 1 },
  },
  "2.2_1-2_2": {
    actionType: "habit",
    targetRoute: "clients",
    ctaLabel: "Registrar resultados en Clientes",
    evidenceRule: { type: "clients_with_origin_week", minCount: 2 },
  },
  "2.2_2-3_1": {
    actionType: "review",
    targetRoute: "clients",
    ctaLabel: "Revisar origen de clientes",
    evidenceRule: { type: "clients_with_origin_week", minCount: 3 },
  },
  "2.2_2-3_2": {
    actionType: "review",
    targetRoute: "clients",
    ctaLabel: "Comparar clientes nuevos",
    promptPlaceholder: "¿Aumentaron tus clientes nuevos respecto al mes anterior?",
  },
  "2.3_0-1_1": {
    actionType: "config",
    targetRoute: "inventory",
    ctaLabel: "Costear producto en Inventario",
    evidenceRule: { type: "product_costed_count", minCount: 1 },
  },
  "2.3_1-2_1": {
    actionType: "config",
    targetRoute: "inventory",
    ctaLabel: "Completar costeo en Inventario",
    evidenceRule: { type: "product_costed_count", minCount: 1 },
  },
  "2.3_1-2_2": {
    actionType: "habit",
    targetRoute: "basicAccountingRecordsBook",
    presetParams: { type: "expense", category: "materials" },
    ctaLabel: "Actualizar costo de insumo",
  },
  "2.3_1-2_3": {
    actionType: "review",
    targetRoute: "inventory",
    ctaLabel: "Comparar precio vs. costo",
    promptPlaceholder: "¿El margen actual es suficiente o ajustarás el precio?",
  },
  "2.3_2-3_1": {
    actionType: "config",
    targetRoute: "inventory",
    ctaLabel: "Verificar costeo completo",
    evidenceRule: { type: "products_full_costed_ratio", minRatio: 0.8 },
  },
  "2.3_2-3_2": {
    actionType: "review",
    targetRoute: "income-statement",
    ctaLabel: "Ver margen en Estado de Resultados",
    promptPlaceholder: "¿Coincidió tu margen real con el proyectado?",
  },
  "2.3_2-3_3": {
    actionType: "review",
    targetRoute: "inventory",
    ctaLabel: "Comparar márgenes por producto",
    evidenceRule: { type: "product_costed_count", minCount: 2 },
  },

  // ==========================================================
  // ÁREA 3 — COMPRAS
  // ==========================================================
  "3.1_0-1_2": {
    actionType: "habit",
    targetRoute: "suppliers",
    ctaLabel: "Registrar 3 proveedores",
    evidenceRule: { type: "suppliers_count", minCount: 3 },
  },
  "3.1_2-3_1": {
    actionType: "config",
    targetRoute: "business-info",
    configKey: "purchaseQuoteThreshold",
    inputType: "currency",
    ctaLabel: "Fijar umbral en Perfil",
    promptPlaceholder: "Ej: 200.00 (monto desde el cual pides 2 cotizaciones)",
    evidenceRule: { type: "profile_field_set", field: "purchaseQuoteThreshold" },
  },
  "3.1_2-3_2": {
    actionType: "review",
    targetRoute: "suppliers",
    ctaLabel: "Comparar cotizaciones en Proveedores",
    promptPlaceholder: "Anota cuánto ahorraste comparando cotizaciones este mes...",
    evidenceRule: { type: "purchase_quotes_month", minCount: 1 },
  },
  "3.2_1-2_1": {
    actionType: "habit",
    targetRoute: "suppliers",
    ctaLabel: "Controlar entregas e incidencias",
    evidenceRule: { type: "supplier_incidents_tracked", minCount: 1 },
  },
  "3.3_0-1_1": {
    actionType: "review",
    targetRoute: "inventory",
    ctaLabel: "Revisar stock en Inventario",
    evidenceRule: { type: "inventory_products_count", minCount: 1 },
  },
  "3.3_0-1_2": {
    actionType: "note",
    targetRoute: "inventory",
    ctaLabel: "Ver productos en Inventario",
    promptPlaceholder: "Lista tus 3 productos o insumos que se agotan más rápido...",
  },
  "3.3_2-3_1": {
    actionType: "config",
    targetRoute: "inventory",
    ctaLabel: "Definir stock mínimo",
    evidenceRule: { type: "inventory_min_stock_count", minCount: 3 },
  },
  "3.3_2-3_2": {
    actionType: "review",
    targetRoute: "inventory",
    ctaLabel: "Revisar alertas de stock mínimo",
    evidenceRule: { type: "inventory_min_stock_count", minCount: 1 },
  },
  "3.3_2-3_3": {
    actionType: "review",
    targetRoute: "inventory",
    ctaLabel: "Ajustar stocks mínimos",
  },

  // ==========================================================
  // ÁREA 4 — CONTROL DE STOCK
  // ==========================================================
  "4.1_0-1_1": {
    actionType: "config",
    targetRoute: "inventory",
    ctaLabel: "Cargar 5 productos en Inventario",
    evidenceRule: { type: "inventory_products_count", minCount: 5 },
  },
  "4.1_0-1_2": {
    actionType: "habit",
    targetRoute: "basicAccountingRecordsBook",
    presetParams: { type: "income" },
    ctaLabel: "Registrar venta en WALA",
    evidenceRule: { type: "tx_count_week", txType: "income", minCount: 1 },
  },
  "4.1_1-2_1": {
    actionType: "habit",
    targetRoute: "inventory",
    ctaLabel: "Actualizar stock en Inventario",
    evidenceRule: { type: "inventory_products_count", minCount: 3 },
  },
  "4.1_1-2_2": {
    actionType: "habit",
    targetRoute: "basicAccountingRecordsBook",
    presetParams: { type: "expense", category: "materials" },
    ctaLabel: "Registrar entrada / compra",
    evidenceRule: { type: "tx_count_week", txType: "expense", minCount: 1 },
  },
  "4.1_2-3_1": {
    actionType: "review",
    targetRoute: "inventory",
    ctaLabel: "Hacer conteo, mermas y ajuste",
    evidenceRule: { type: "waste_logs_month", minCount: 1 },
  },
  "4.2_1-2_1": {
    actionType: "config",
    targetRoute: "inventory",
    ctaLabel: "Definir stock mínimo",
    evidenceRule: { type: "inventory_min_stock_count", minCount: 1 },
  },
  "4.2_2-3_3": {
    actionType: "config",
    targetRoute: "inventory",
    ctaLabel: "Configurar stock mínimo / seguridad",
    evidenceRule: { type: "inventory_min_stock_count", minCount: 3 },
  },

  // ==========================================================
  // ÁREA 5 — COSTEO
  // ==========================================================
  "5.1_0-1_1": {
    actionType: "config",
    targetRoute: "inventory",
    ctaLabel: "Costear materiales en Inventario",
    evidenceRule: { type: "product_costed_count", minCount: 1 },
  },
  "5.1_0-1_2": {
    actionType: "config",
    targetRoute: "inventory",
    ctaLabel: "Registrar costo unitario en Inventario",
    evidenceRule: { type: "product_costed_count", minCount: 1 },
  },
  "5.1_1-2_1": {
    actionType: "config",
    targetRoute: "inventory",
    ctaLabel: "Completar lista de materiales",
    evidenceRule: { type: "product_costed_count", minCount: 1 },
  },
  "5.1_1-2_2": {
    actionType: "habit",
    targetRoute: "basicAccountingRecordsBook",
    presetParams: { type: "expense", category: "materials" },
    ctaLabel: "Actualizar precio de insumo",
  },
  "5.1_1-2_3": {
    actionType: "config",
    targetRoute: "inventory",
    ctaLabel: "Costear más productos",
    evidenceRule: { type: "product_costed_count", minCount: 2 },
  },
  "5.1_2-3_1": {
    actionType: "config",
    targetRoute: "inventory",
    ctaLabel: "Verificar costeo de todos los productos",
    evidenceRule: { type: "product_costed_count", minCount: 3 },
  },
  "5.2_1-2_1": {
    actionType: "config",
    targetRoute: "business-info",
    configKey: "ownerHourlyRate",
    inputType: "hourly_rate",
    ctaLabel: "Definir valor por hora",
    promptPlaceholder: "Ej: 8.50 (S/ por hora trabajada)",
    evidenceRule: { type: "profile_field_set", field: "ownerHourlyRate" },
  },
  "5.2_2-3_2": {
    actionType: "config",
    targetRoute: "business-info",
    configKey: "ownerHourlyRate",
    inputType: "hourly_rate",
    ctaLabel: "Actualizar valor por hora",
    evidenceRule: { type: "profile_field_set", field: "ownerHourlyRate" },
  },
  "5.2_0-1_3": {
    actionType: "config",
    targetRoute: "inventory",
    ctaLabel: "Registrar MOD en Inventario",
    evidenceRule: { type: "product_costed_count", minCount: 1 },
  },
  "5.2_1-2_2": {
    actionType: "config",
    targetRoute: "inventory",
    ctaLabel: "Configurar MOD en Inventario",
    evidenceRule: { type: "product_costed_count", minCount: 1 },
  },
  "5.2_2-3_3": {
    actionType: "review",
    targetRoute: "income-statement",
    ctaLabel: "Revisar Estado de Resultados",
  },
  "5.3_0-1_1": {
    actionType: "habit",
    targetRoute: "basicAccountingRecordsBook",
    presetParams: { type: "expense", category: "overhead" },
    ctaLabel: "Registrar gastos generales",
  },
  "5.3_0-1_2": {
    actionType: "review",
    targetRoute: "income-statement",
    ctaLabel: "Ver costos indirectos del mes",
  },
  "5.3_1-2_1": {
    actionType: "config",
    targetRoute: "inventory",
    ctaLabel: "Configurar CIF en Inventario",
  },
  "5.3_1-2_2": {
    actionType: "habit",
    targetRoute: "basicAccountingRecordsBook",
    presetParams: { type: "expense", category: "overhead" },
    ctaLabel: "Registrar gasto indirecto",
    evidenceRule: { type: "tx_count_week", txType: "expense", minCount: 1 },
  },
  "5.3_1-2_3": {
    actionType: "review",
    targetRoute: "income-statement",
    ctaLabel: "Comparar gastos del mes",
  },
  "5.3_2-3_1": {
    actionType: "config",
    targetRoute: "inventory",
    ctaLabel: "Completar costo total en Inventario",
    evidenceRule: { type: "products_full_costed_ratio", minRatio: 0.8 },
  },
  "5.3_2-3_3": {
    actionType: "review",
    targetRoute: "income-statement",
    ctaLabel: "Verificar cobertura en P&L",
  },

  // ==========================================================
  // ÁREA 6 — MANTENIMIENTO DE REGISTROS
  // ==========================================================
  "6.1_0-1_1": {
    actionType: "habit",
    targetRoute: "basicAccountingRecordsBook",
    presetParams: { type: "income" },
    ctaLabel: "Registrar ventas del día",
    evidenceRule: { type: "tx_count_week", txType: "income", minCount: 1 },
  },
  "6.1_0-1_2": {
    actionType: "habit",
    targetRoute: "basicAccountingRecordsBook",
    presetParams: { type: "expense" },
    ctaLabel: "Registrar gasto del día",
    evidenceRule: { type: "tx_count_week", txType: "expense", minCount: 1 },
  },
  "6.1_1-2_1": {
    actionType: "habit",
    targetRoute: "basicAccountingRecordsBook",
    presetParams: { type: "income" },
    ctaLabel: "Ir a registrar operación",
    evidenceRule: { type: "tx_days_week", minDays: 3 },
  },
  "6.1_1-2_2": {
    actionType: "review",
    targetRoute: "dashboard",
    ctaLabel: "Revisar días registrados",
    promptPlaceholder: "¿Qué día faltó registrar y por qué?",
    evidenceRule: { type: "tx_days_week", minDays: 4 },
  },
  "6.1_2-3_1": {
    actionType: "review",
    targetRoute: "dashboard",
    ctaLabel: "Medir consistencia semanal",
    promptPlaceholder: "¿Cuántos días registraste ingresos esta semana (meta 5/5)?",
    evidenceRule: { type: "tx_days_week", minDays: 5 },
  },
  "6.1_2-3_2": {
    actionType: "review",
    targetRoute: "income-statement",
    ctaLabel: "Revisar Estado de Resultados",
  },
  "6.2_0-1_1": {
    actionType: "habit",
    targetRoute: "basicAccountingRecordsBook",
    presetParams: { type: "income" },
    ctaLabel: "Registrar venta al crédito",
    evidenceRule: { type: "credit_sales_tracked", minCount: 1 },
  },
  "6.2_0-1_2": {
    actionType: "review",
    targetRoute: "accounts-receivable",
    ctaLabel: "Ver Cuentas por Cobrar",
    evidenceRule: { type: "credit_sales_tracked", minCount: 1 },
  },
  "6.2_0-1_3": {
    actionType: "review",
    targetRoute: "accounts-receivable",
    ctaLabel: "Sumar dinero en la calle",
    promptPlaceholder: "¿Cuánto dinero total tienes por cobrar hoy?",
    evidenceRule: { type: "credit_sales_tracked", minCount: 1 },
  },
  "6.2_1-2_1": {
    actionType: "habit",
    targetRoute: "accounts-receivable",
    ctaLabel: "Actualizar Cuentas por Cobrar",
    evidenceRule: { type: "receivables_with_due_date", minCount: 1 },
  },
  "6.2_1-2_2": {
    actionType: "review",
    targetRoute: "accounts-receivable",
    ctaLabel: "Revisar cobros vencidos",
    promptPlaceholder: "¿A qué clientes contactaste esta semana y cuándo prometieron pagar?",
    evidenceRule: { type: "receivables_with_due_date", minCount: 1 },
  },
  "6.2_1-2_3": {
    actionType: "habit",
    targetRoute: "accounts-receivable",
    ctaLabel: "Registrar cobro recibido",
  },
  "6.2_2-3_1": {
    actionType: "review",
    targetRoute: "accounts-receivable",
    ctaLabel: "Analizar antigüedad de deuda",
    promptPlaceholder: "Cantidad de clientes al día / <30 días / >30 días...",
    evidenceRule: { type: "receivables_with_due_date", minCount: 1 },
  },
  "6.2_2-3_3": {
    actionType: "review",
    targetRoute: "accounts-receivable",
    ctaLabel: "Comparar saldo por cobrar",
  },
  "6.3_0-1_1": {
    actionType: "review",
    targetRoute: "income-statement",
    ctaLabel: "Ver resultado en WALA",
    promptPlaceholder: "Resultado neto de la semana: S/ ...",
  },
  "6.3_0-1_2": {
    actionType: "review",
    targetRoute: "expenses",
    ctaLabel: "Ver 3 mayores gastos",
    promptPlaceholder: "Escribe los 3 gastos más grandes de esta semana...",
  },
  "6.3_1-2_1": {
    actionType: "review",
    targetRoute: "income-statement",
    ctaLabel: "Hacer cierre semanal",
  },
  "6.3_1-2_2": {
    actionType: "review",
    targetRoute: "income-statement",
    ctaLabel: "Abrir Estado de Resultados",
    promptPlaceholder: "¿El negocio ganó o perdió este mes? ¿Cuánto exactamente?",
  },
  "6.3_1-2_3": {
    actionType: "review",
    targetRoute: "income-statement",
    ctaLabel: "Comparar mes vs. mes anterior",
  },
  "6.3_2-3_2": {
    actionType: "review",
    targetRoute: "income-statement",
    ctaLabel: "Revisar resultado semanal",
  },

  // ==========================================================
  // ÁREA 7 — PLANIFICACIÓN
  // ==========================================================
  "7.3_0-1_1": {
    actionType: "config",
    targetRoute: "business-info",
    configKey: "cycleMainGoal",
    inputType: "text",
    ctaLabel: "Definir meta del ciclo",
    promptPlaceholder: "Ej: Vender 20% más este mes / Pagarte tu sueldo las 4 semanas",
    evidenceRule: { type: "profile_field_set", field: "cycleMainGoal" },
  },
  "7.1_0-1_2": {
    actionType: "habit",
    targetRoute: "accounts-balance",
    ctaLabel: "Programar pagos fijos del mes",
    evidenceRule: { type: "recurring_payments_count", minCount: 1 },
  },
  "7.1_1-2_2": {
    actionType: "habit",
    targetRoute: "basicAccountingRecordsBook",
    presetParams: { type: "expense" },
    ctaLabel: "Registrar costos de la semana",
  },
  "7.1_2-3_3": {
    actionType: "review",
    targetRoute: "income-statement",
    ctaLabel: "Comparar proyectado vs. real",
    evidenceRule: { type: "projection_created_period" },
  },
  "7.2_1-2_3": {
    actionType: "review",
    targetRoute: "accounts-balance",
    ctaLabel: "Ver Balance de Cuentas",
    promptPlaceholder: "¿Coincidió tu saldo real con lo proyectado? ¿Por qué?",
  },
  "7.2_2-3_3": {
    actionType: "review",
    targetRoute: "accounts-balance",
    ctaLabel: "Revisar evolución de caja",
  },
  "7.3_1-2_3": {
    actionType: "review",
    targetRoute: "income-statement",
    ctaLabel: "Evaluar avance vs. meta",
  },
  "7.3_2-3_1": {
    actionType: "review",
    targetRoute: "income-statement",
    ctaLabel: "Revisión mensual del negocio",
  },
};

/**
 * Resuelve los metadatos operativos completos de cualquier acción del Banco de Acciones.
 * Garantiza que las 189 acciones tengan arquetipo, CTA, ruta y regla de evidencia válidos.
 */
export function resolveActionMeta(indicatorKey, trancheKey, row = {}) {
  const num = row.id || row.actionNumber || 1;
  const normalizedTranche = normalizeTrancheKey(trancheKey || row.tranche);
  const actionKey = `${indicatorKey}_${normalizedTranche}_${num}`;
  const explicit = ACTION_BANK_META[actionKey];

  const inferred = inferMetaFromRow(indicatorKey, row);
  const merged = {
    actionKey,
    tranche: normalizedTranche,
    actionType: explicit?.actionType || inferred.actionType,
    targetRoute: explicit?.targetRoute !== undefined ? explicit.targetRoute : inferred.targetRoute,
    presetParams: explicit?.presetParams !== undefined ? explicit.presetParams : inferred.presetParams,
    configKey: explicit?.configKey || null,
    inputType: explicit?.inputType || null,
    options: explicit?.options || null,
    ctaLabel: explicit?.ctaLabel || inferred.ctaLabel,
    promptPlaceholder: explicit?.promptPlaceholder || inferred.promptPlaceholder,
    evidenceRule: explicit?.evidenceRule || inferred.evidenceRule,
  };

  merged.actionTypeLabel = ACTION_TYPE_LABELS[merged.actionType] || "Acción";
  return merged;
}

export function normalizeTrancheKey(rawTranche) {
  if (!rawTranche) return "0-1";
  const str = String(rawTranche).trim();
  if (str.includes("1") && str.includes("2")) return "1-2";
  if (str.includes("2") && str.includes("3")) return "2-3";
  return "0-1";
}

function inferMetaFromRow(indicatorKey, row) {
  const wala = (row.wala || row.walaModule || "").toLowerCase();
  const freq = (row.frequency || "").toLowerCase();
  const text = (row.action || row.description || "").toLowerCase();

  // 1. Expediente / conversación / reflexión / protocolo -> bitácora (note)
  if (
    wala.includes("expediente de seguimiento") &&
    !wala.includes("comparativa") &&
    !wala.includes("revisión")
  ) {
    return {
      actionType: "note",
      targetRoute: null,
      presetParams: null,
      ctaLabel: "Registrar en bitácora",
      promptPlaceholder: "Escribe tu acuerdo, hallazgo o evidencia aquí...",
      evidenceRule: { type: "note_filled" },
    };
  }

  // 2. Reporte mensual / Dashboard / comparativas -> review
  if (
    wala.includes("reporte mensual") ||
    wala.includes("dashboard de resultado") ||
    text.includes("al cierre del mes") ||
    text.includes("compara en wala")
  ) {
    let targetRoute = "income-statement";
    if (wala.includes("cliente")) targetRoute = "clients";
    else if (wala.includes("inventario")) targetRoute = "inventory";
    else if (wala.includes("gastos")) targetRoute = "expenses";

    return {
      actionType: "review",
      targetRoute,
      presetParams: null,
      ctaLabel:
        targetRoute === "income-statement"
          ? "Abrir Estado de Resultados"
          : targetRoute === "clients"
            ? "Revisar Clientes"
            : targetRoute === "inventory"
              ? "Revisar Inventario"
              : "Revisar Gastos",
      promptPlaceholder: "Anota tu hallazgo y decisión tomada tras revisar el reporte...",
      evidenceRule: { type: "note_filled" },
    };
  }

  // 3. Perfil del negocio -> config
  if (wala.includes("perfil del negocio")) {
    return {
      actionType: "config",
      targetRoute: "business-info",
      presetParams: null,
      ctaLabel: "Configurar en Datos del Negocio",
      promptPlaceholder: "Anota el criterio definido para tu negocio...",
      evidenceRule: { type: "note_filled" },
    };
  }

  // 4. Módulo de inventario -> config si es única vez o habit si es semanal/recurrente
  if (wala.includes("módulo de inventario")) {
    const isOneTime = freq.includes("única vez");
    return {
      actionType: isOneTime ? "config" : "habit",
      targetRoute: "inventory",
      presetParams: null,
      ctaLabel: "Ir a Inventario",
      promptPlaceholder: "Anota qué producto o ajuste realizaste en Inventario...",
      evidenceRule: isOneTime
        ? { type: "inventory_products_count", minCount: 1 }
        : { type: "inventory_stock_logs_recent" },
    };
  }

  // 5. Módulo de clientes / cuentas por cobrar -> habit
  if (wala.includes("módulo de clientes")) {
    const isCredit = text.includes("deuda") || text.includes("crédito") || wala.includes("cobrar");
    return {
      actionType: "habit",
      targetRoute: isCredit ? "accounts-receivable" : "clients",
      presetParams: null,
      ctaLabel: isCredit ? "Ir a Cuentas por Cobrar" : "Ir a Clientes",
      promptPlaceholder: "Anota los detalles del cliente o seguimiento...",
      evidenceRule: { type: "note_filled" },
    };
  }

  // 6. Módulo de ingresos / gastos -> habit
  if (wala.includes("módulo de ingresos") || wala.includes("módulo de gastos")) {
    const isIncome = wala.includes("módulo de ingresos") && !wala.includes("gastos");
    return {
      actionType: "habit",
      targetRoute: "basicAccountingRecordsBook",
      presetParams: { type: isIncome ? "income" : "expense" },
      ctaLabel: isIncome ? "Registrar ingreso" : "Registrar gasto",
      promptPlaceholder: "Observación adicional sobre el registro...",
      evidenceRule: {
        type: "tx_count_week",
        txType: isIncome ? "income" : "expense",
        minCount: 1,
      },
    };
  }

  // Fallback seguro
  return {
    actionType: freq.includes("única vez") ? "note" : "review",
    targetRoute: null,
    presetParams: null,
    ctaLabel: "Registrar avance",
    promptPlaceholder: "Anota el resultado o evidencia de esta acción...",
    evidenceRule: { type: "note_filled" },
  };
}
