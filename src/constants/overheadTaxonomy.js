/**
 * Taxonomía de Gastos Generales (Overhead)
 * Sistema de clasificación universal para gastos indirectos de negocio
 */

export const OVERHEAD_TAXONOMY = {
  industry: "gastos_generales",
  version: "1.0",
  categories: {
    "Sueldos y Personal No Productivo": {
      "Administración": [
        "Administrador / gerente",
        "Asistente administrativo",
        "Contador interno",
        "Auxiliar contable",
        "Coordinador general",
        "RRHH"
      ],
      "Comercial / Ventas": [
        "Recepcionista",
        "Atención al cliente",
        "Vendedor de mostrador (no presta servicio)",
        "Community manager",
        "Ejecutivo comercial"
      ],
      "Soporte / Gestión": [
        "Coordinador académico / terapéutico",
        "Supervisor operativo (no atiende clientes)",
        "Coordinador de agenda / citas"
      ]
    },

    "Alquileres y Espacios No Productivos": {
      "Alquileres": [
        "Alquiler del local (área administrativa)",
        "Alquiler área de recepción",
        "Alquiler área de ventas / tienda",
        "Alquiler oficina",
        "Alquiler depósito general",
        "Alquiler sala de espera"
      ],
      "Costos Asociados a Espacios": [
        "Mantenimiento de condominio",
        "Limpieza de áreas comunes (si aplica)",
        "Arbitrios por áreas comunes (si aplica)"
      ]
    },

    "Servicios Básicos": {
      "Servicios Públicos": [
        "Electricidad base (iluminación, oficinas)",
        "Agua (baños, limpieza general)",
        "Gas (no productivo)",
        "Alcantarillado"
      ],
      "Comunicaciones": [
        "Internet",
        "Teléfono fijo",
        "Telefonía móvil administrativa",
        "Planes de datos",
        "Central telefónica"
      ]
    },

    "Limpieza e Higiene No Productiva": {
      "Insumos de Limpieza": [
        "Detergente",
        "Lejía",
        "Desinfectantes",
        "Limpiavidrios",
        "Aromatizantes",
        "Bolsas de basura",
        "Papel higiénico",
        "Jabón de manos",
        "Alcohol para áreas comunes"
      ],
      "Servicios de Limpieza": [
        "Personal de limpieza",
        "Empresa de limpieza tercerizada",
        "Recojo de residuos"
      ]
    },

    "Marketing, Publicidad y Marca": {
      "Digital": [
        "Publicidad en redes (Meta Ads, Google Ads)",
        "Manejo de redes sociales",
        "Diseño gráfico",
        "Fotografía",
        "Video",
        "Página web",
        "Hosting",
        "Dominio",
        "Email marketing"
      ],
      "Físico": [
        "Volantes",
        "Banners",
        "Letreros",
        "Merchandising",
        "Material promocional"
      ]
    },

    "Servicios Profesionales Externos": {
      "Finanzas y Legal": [
        "Contabilidad externa",
        "Asesor tributario",
        "Asesoría legal",
        "Auditoría"
      ],
      "Consultoría y Soporte": [
        "Consultorías",
        "Soporte TI",
        "Mantenimiento informático"
      ]
    },

    "Sistemas, Software y Tecnología No Productiva": {
      "Software y Licencias": [
        "Software contable",
        "ERP / CRM",
        "Software de gestión",
        "Licencias administrativas",
        "Microsoft Office / Google Workspace"
      ],
      "Seguridad y Respaldo": [
        "Antivirus",
        "Backups",
        "Almacenamiento en la nube"
      ],
      "Infraestructura TI": [
        "Hosting (si no se registró en marketing)",
        "Dominios (si no se registró en marketing)",
        "Servicios de correo corporativo"
      ]
    },

    "Gastos Financieros y Bancarios": {
      "Banca y Cuentas": [
        "Comisiones bancarias",
        "Mantenimiento de cuenta",
        "Cargos por transferencias"
      ],
      "Cobros y Pagos": [
        "POS",
        "Pasarela de pagos"
      ],
      "Financiamiento": [
        "Intereses",
        "Costos de financiamiento"
      ]
    },

    "Impuestos, Tasas y Cumplimiento": {
      "Municipal y Local": [
        "Licencia municipal",
        "Defensa civil",
        "Arbitrios",
        "Impuesto predial"
      ],
      "Sanciones y Cumplimiento": [
        "Multas",
        "Certificaciones",
        "Permisos",
        "Registros"
      ]
    },

    "Seguros y Protección": {
      "Seguros": [
        "Seguro del local",
        "Seguro de equipos",
        "Seguro de responsabilidad civil",
        "Seguro del personal"
      ],
      "Seguridad": [
        "Seguridad privada",
        "Cámaras",
        "Alarmas"
      ]
    },

    "Papelería y Oficina": {
      "Útiles y Materiales": [
        "Cuadernos",
        "Lapiceros",
        "Tóner de oficina",
        "Papel A4",
        "Archivadores",
        "Carpetas"
      ],
      "Servicios": [
        "Impresiones administrativas",
        "Copias y escaneos",
        "Encuadernación (si aplica)"
      ]
    },

    "Mantenimiento General No Productivo": {
      "Infraestructura": [
        "Pintura del local",
        "Reparaciones generales",
        "Carpintería",
        "Mantenimiento de aire acondicionado (áreas comunes)"
      ],
      "Servicios Técnicos": [
        "Gasfitería",
        "Electricidad general"
      ]
    },

    "Otros Gastos Generales Frecuentes": {
      "Movilidad y Gestión": [
        "Movilidad administrativa",
        "Viáticos de gestión"
      ],
      "Personal Administrativo": [
        "Refrigerios del personal administrativo",
        "Uniformes administrativos",
        "Capacitaciones internas (no productivas)"
      ],
      "Cultura y Empresa": [
        "Eventos corporativos",
        "Integraciones internas"
      ]
    }
  },

  brands: [
    // Software / SaaS
    { name: "Google Workspace", occurrences: 0 },
    { name: "Microsoft 365", occurrences: 0 },
    { name: "Zoom", occurrences: 0 },
    { name: "Dropbox", occurrences: 0 },
    { name: "OneDrive", occurrences: 0 },
    { name: "Slack", occurrences: 0 },
    { name: "Notion", occurrences: 0 },

    // Publicidad / Ads
    { name: "Meta Ads", occurrences: 0 },
    { name: "Google Ads", occurrences: 0 },
    { name: "TikTok Ads", occurrences: 0 },

    // Pagos / Bancos (genérico LATAM)
    { name: "Visa", occurrences: 0 },
    { name: "Mastercard", occurrences: 0 },
    { name: "Mercado Pago", occurrences: 0 },
    { name: "Niubiz", occurrences: 0 },
    { name: "Izipay", occurrences: 0 },
    { name: "Culqi", occurrences: 0 },
    { name: "Yape", occurrences: 0 },
    { name: "Plin", occurrences: 0 },

    // Telecom
    { name: "Movistar", occurrences: 0 },
    { name: "Claro", occurrences: 0 },
    { name: "Entel", occurrences: 0 },
    { name: "Bitel", occurrences: 0 },

    // Insumos de oficina
    { name: "Pilot", occurrences: 0 },
    { name: "Faber-Castell", occurrences: 0 },
    { name: "Artesco", occurrences: 0 },
    { name: "HP", occurrences: 0 },
    { name: "Epson", occurrences: 0 },

    // Limpieza (común retail)
    { name: "Sapolio", occurrences: 0 },
    { name: "Clorox", occurrences: 0 },
    { name: "Bolívar", occurrences: 0 },

    // Genéricas
    { name: "SIN MARCA", occurrences: 0 },
    { name: "NO APLICA", occurrences: 0 }
  ],

  rules: [
    { match: "(sueldo|planilla|salario|honorario\\s?administrativo)", category: "Sueldos y Personal No Productivo", subcategory: "Administración", auto: true },
    { match: "(alquiler|renta|arrendamiento|dep[oó]sito|oficina|recepci[oó]n)", category: "Alquileres y Espacios No Productivos", subcategory: "Alquileres", auto: true },
    { match: "(luz|electricidad|agua|gas|alcantarillado)", category: "Servicios Básicos", subcategory: "Servicios Públicos", auto: true },
    { match: "(internet|tel[eé]fono|movil|m[oó]vil|datos|central\\s?telef[oó]nica)", category: "Servicios Básicos", subcategory: "Comunicaciones", auto: true },

    { match: "(lej[ií]a|detergente|desinfectante|limpiavidrios|aromatizante|bolsa\\s?basura|papel\\s?higi[eé]nico|jab[oó]n\\s?manos|alcohol)", category: "Limpieza e Higiene No Productiva", subcategory: "Insumos de Limpieza", auto: true },
    { match: "(limpieza\\s?tercerizada|personal\\s?limpieza|recojo\\s?residuos|basura)", category: "Limpieza e Higiene No Productiva", subcategory: "Servicios de Limpieza", auto: true },

    { match: "(meta\\s?ads|google\\s?ads|publicidad|anuncio|marketing|redes|dise[nñ]o|fotograf[ií]a|video|hosting|dominio|email\\s?marketing)", category: "Marketing, Publicidad y Marca", subcategory: "Digital", auto: true },
    { match: "(volante|banner|letrero|merch|merchandising|material\\s?promocional)", category: "Marketing, Publicidad y Marca", subcategory: "Físico", auto: true },

    { match: "(contabilidad\\s?externa|asesor[ií]a\\s?legal|auditor[ií]a|consultor[ií]a|asesor\\s?tributario)", category: "Servicios Profesionales Externos", subcategory: "Finanzas y Legal", auto: true },
    { match: "(soporte\\s?ti|mantenimiento\\s?inform[aá]tico|t[eé]cnico\\s?inform[aá]tico)", category: "Servicios Profesionales Externos", subcategory: "Consultoría y Soporte", auto: true },

    { match: "(software\\s?contable|erp|crm|licencia|microsoft\\s?365|google\\s?workspace|antivirus|backup|nube|almacenamiento)", category: "Sistemas, Software y Tecnología No Productiva", subcategory: "Software y Licencias", auto: true },

    { match: "(comisi[oó]n\\s?bancaria|mantenimiento\\s?cuenta|transferencia|pos|pasarela\\s?pagos|inter[eé]s|financiamiento)", category: "Gastos Financieros y Bancarios", subcategory: "Banca y Cuentas", auto: true },

    { match: "(licencia\\s?municipal|defensa\\s?civil|arbitrios|predial|multa|certificaci[oó]n|permiso|registro)", category: "Impuestos, Tasas y Cumplimiento", subcategory: "Municipal y Local", auto: true },

    { match: "(seguro|responsabilidad\\s?civil|c[aá]maras|alarmas|seguridad\\s?privada)", category: "Seguros y Protección", subcategory: "Seguros", auto: true },

    { match: "(papel\\s?a4|t[oó]ner|lapicero|cuaderno|archivador|carpeta|impresi[oó]n)", category: "Papelería y Oficina", subcategory: "Útiles y Materiales", auto: true },

    { match: "(pintura\\s?local|reparaci[oó]n|gasfiter[ií]a|electricidad\\s?general|carpinter[ií]a|aire\\s?acondicionado)", category: "Mantenimiento General No Productivo", subcategory: "Infraestructura", auto: true },

    { match: "(movilidad\\s?administrativa|vi[aá]ticos|refrigerio|uniforme|capacitaci[oó]n|evento\\s?corporativo)", category: "Otros Gastos Generales Frecuentes", subcategory: "Movilidad y Gestión", auto: true }
  ],

  stats: {
    totalExpenses: 0,
    totalBusinesses: 0,
    avgConfidence: 0,
    lastTrainingAt: null
  }
};

/**
 * Obtener todas las categorías de la taxonomía
 * @returns {Object} Categorías de overhead
 */
export const getOverheadCategories = () => {
  return OVERHEAD_TAXONOMY.categories;
};

/**
 * Obtener todas las reglas de matching
 * @returns {Array} Array de reglas
 */
export const getOverheadRules = () => {
  return OVERHEAD_TAXONOMY.rules;
};

/**
 * Obtener todas las marcas disponibles
 * @returns {Array} Array de marcas
 */
export const getOverheadBrands = () => {
  return OVERHEAD_TAXONOMY.brands;
};

/**
 * Obtener versión de la taxonomía
 * @returns {string} Versión actual
 */
export const getOverheadVersion = () => {
  return OVERHEAD_TAXONOMY.version;
};
