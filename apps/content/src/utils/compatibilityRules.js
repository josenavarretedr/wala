// Rutas disponibles por etapa de funnel
// Fuente: RutasWala_v3.md, sección 11
export const RUTAS_POR_FUNNEL = {
  'TOFU': ['Diagnostico', 'Contraste', 'Revelacion', 'Activacion'],
  'MOFU-A': ['Contraste', 'Revelacion'],
  'MOFU-B': ['Activacion'],
  'BOFU': ['Revelacion']
};

// Voces disponibles por etapa
// Fuente: PromptMaestro V10, sección 13
export const VOCES_POR_FUNNEL = {
  'TOFU': ['Jose', 'WALA'],
  'MOFU-A': ['Jose'],        // MOFU-A exclusivo José (V10 regla crítica)
  'MOFU-B': ['Jose', 'WALA'],
  'BOFU': ['Jose']         // BOFU siempre José (principio #14)
};

// Metadatos de cada ruta para mostrar en UI
export const RUTAS_META = {
  'Diagnostico': {
    label: 'Diagnóstico',
    descripcion: 'El emprendedor se reconoce en lo que describe el video',
    viralidad: 'medio',
    anguloBase: 'Espejo'
  },
  'Contraste': {
    label: 'Contraste',
    descripcion: 'Compara dos niveles: dónde está vs dónde puede estar',
    viralidad: 'alto',
    anguloBase: 'Versus'
  },
  'Revelacion': {
    label: 'Revelación',
    descripcion: 'Muestra una pérdida invisible que el emprendedor no veía',
    viralidad: 'alto',
    anguloBase: 'Costo'
  },
  'Activacion': {
    label: 'Activación',
    descripcion: 'Acción concreta que puede hacer hoy en 5 minutos',
    viralidad: 'medio',
    anguloBase: 'Acción'
  }
};

// CTA que corresponde automáticamente por etapa (nunca se le pregunta al LLM)
export const CTA_POR_FUNNEL = {
  'TOFU': 'freemium',
  'MOFU-A': 'diagnostico_gratuito + wala_pro_secundario',
  'MOFU-B': 'wala_pro',
  'BOFU': 'diagnostico_gratuito + garantia + urgencia'
};

// Elementos Hormozi obligatorios por etapa
export const HORMOZI_REQUERIDO = {
  'TOFU': { over_delivery: true, costo_inaccion: false, garantia: false, urgencia: false },
  'MOFU-A': { over_delivery: true, costo_inaccion: true, garantia: false, urgencia: true },
  'MOFU-B': { over_delivery: false, costo_inaccion: false, garantia: false, urgencia: false },
  'BOFU': { over_delivery: true, costo_inaccion: true, garantia: true, urgencia: true }
};
