/**
 * Constantes para el Tablero Comercial
 * Variables editables en UI para cada campaña
 */

export const DEFAULT_ZONAS = [
  'Av. Balta',
  'Av. Luis González',
  'Mercado Modelo',
  'Urbanizaciones',
  'Centro Comercial'
]

export const DEFAULT_SECTORES = [
  'Salones',
  'Ferreterías',
  'Boutiques',
  'Talleres',
  'Comida',
  'Ópticas',
  'Farmacias',
  'Imprentas'
]

export const AREAS_CRITICAS = [
  'Costeo',
  'Inventario',
  'Flujo de Caja',
  'Gestión Financiera',
  'Proveedores',
  'Clientes',
  'Ventas'
]

export const METAS_SEMANALES_DEFAULT = {
  visitasTarget: 40,
  agendadosTarget: 6,
  tasaAgendamientoMin: 12, // %
  cierresTarget: 1,
  tasaCierreMin: 15, // %
  cajaTarget: 450 // S/.
}

export const WHATSAPP_TEMPLATES = {
  tarjeta_entregada: 'Hola [Nombre], soy José de WALA, te dejé mi tarjeta hoy. Cuando tengas 20 min me escribes para tu diagnóstico gratuito.',
  agendado: 'Hola [Nombre], te escribo para recordarte que tenemos agendado tu diagnóstico para mañana. ¡Nos vemos!',
  diagnosticado: '[Nombre], te mando el resumen de lo que vimos. Tus 3 áreas críticas fueron: [AREAS]. La que más te está costando plata ahora es [AREA_PRINCIPAL]. ¿Cuándo nos vemos para el plan de acción?',
  seguimiento_1: 'Hola [Nombre], ¿pudiste revisar el resumen? Cuéntame si arrancamos esta semana.',
  seguimiento_2: '[Nombre], seguimos pendientes. ¿Te parece si empezamos el programa en estos días?',
  seguimiento_3: 'Hola [Nombre], paso por aquí para saber si al final te animaste. Sería genial empezar a ordenar tus finanzas.',
  seguimiento_4: '[Nombre], este será mi último mensaje. Si decides avanzar más adelante, aquí tienes mi número. ¡Un abrazo!',
  cierre_advisory: '¡Excelente [Nombre]! Nos vemos pronto. Programa de asesoría 2 meses: S/.450.',
  cierre_wala: 'Bienvenido a WALA [Nombre]. Tu suscripción S/.49/mes está activa.'
}

export const LEAD_STATUS = {
  tarjeta_entregada: 'Visitado (Tarjeta Entregada)',
  agendado: 'Agendado',
  diagnosticado: 'Diagnosticado',
  en_seguimiento: 'En Seguimiento',
  cerrado_advisory: 'Cerrado: Advisory (S/450)',
  cerrado_wala: 'Cerrado: WALA (S/49)',
  descartado: 'Descartado'
}

export const VISITA_RESULTADO = {
  agendado: 'Agendado',
  no_agendado: 'No agendado'
}

export const DIAGNOSTICO_RESULTADO = {
  cierre: 'Cierre',
  seguimiento: 'Seguimiento',
  no_cierre: 'No cierre'
}

export const CIERRE_TIPO = {
  advisory: 'Advisory (S/.450)',
  wala: 'WALA (S/.49/mes)'
}

export const CIERRE_METODO = {
  yape: 'Yape',
  plin: 'Plin',
  efectivo: 'Efectivo'
}

export const SEGUIMIENTO_TIPO = {
  whatsapp: 'WhatsApp',
  llamada: 'Llamada',
  visita: 'Visita'
}
