/**
 * Constantes para el Tablero Comercial
 * Variables editables en UI para cada campaña
 */

export const DEFAULT_ZONAS = [
  'Av. Balta y transversales (Alta)',
  'Zona salones / Av. Luis González (Alta)',
  'Mercado Modelo - puestos grandes (Media)',
  'Urbanizaciones residenciales (Media)',
  'Centro comercial / Real Plaza (Complementaria)'
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
  pruebasTarget: 5,
  agendadosTarget: 6,
  tasaAgendamientoMin: 12, // %
  diagnosticosEjecutadosTarget: 5,
  cierresTarget: 1, // Advisory
  cierresWalaTarget: 2, // WALA S/49
  tasaCierreMin: 20, // % (updated to 20% according to plan)
  cajaTarget: 450 // S/.
}

export const WHATSAPP_TEMPLATES = {
  tarjeta_entregada: 'Hola [Nombre]. Soy José, el de WALA. Te comparto lo que te comenté: nuestro copiloto te ayuda a ordenar tu negocio, entender tus números y tomar mejores decisiones. Si quieres, te paso el acceso para probarlo gratis 5 días o agendamos el diagnóstico para ver qué te conviene más. ¿Qué te queda mejor esta semana?',
  agendado: 'Hola [Nombre], te escribo para recordarte que tenemos agendado tu diagnóstico para mañana. ¡Nos vemos!',
  diagnosticado: '[Nombre], te mando el resumen de lo que vimos. Tus 3 áreas críticas fueron: [AREAS]. La que más te está costando plata ahora mismo es [AREA_PRINCIPAL]. ¿Cuándo arrancamos?',
  seguimiento_trial_1: 'Hola [Nombre], ¿cómo vas con WALA? Quería ver si pudiste ingresar. Recuerda que con WALA puedes registrar tus ventas y gastos diarios para tener tu negocio ordenado. Si tienes alguna duda me avisas.',
  seguimiento_trial_2: 'Hola [Nombre], ¿cómo vas con WALA? Mañana termina tu prueba gratuita de 5 días. Si quieres seguir usándolo para tener control de tus números, coméntame para activar tu suscripción de S/49/mes. ¿Cómo vas?',
  seguimiento_trial_3: 'Hola [Nombre], ya venció tu prueba gratuita de WALA. Este será mi último mensaje para no importunar. Si deseas ordenar tus finanzas y entender tus números más adelante, WALA estará listo por S/49/mes. ¡Mucho éxito en tus ventas!',
  seguimiento_advisory_1: '[Nombre], te mando el resumen de lo que vimos. Tus 3 áreas críticas fueron: [AREAS]. La que más te está costando plata ahora mismo es [AREA_PRINCIPAL]. ¿Cuándo arrancamos?',
  seguimiento_advisory_2: 'Hola [Nombre], te escribo para ver si pudiste pensar en el programa de asesoría y el plan de acción que armamos. ¿Cuándo nos vemos para empezar?',
  seguimiento_advisory_3: 'Hola [Nombre], este será mi último mensaje para no importunar. Si deseas ordenar tus finanzas y la asesoría personalizada más adelante, me avisas. ¡Un abrazo!',
  cierre_advisory: 'Con lo que veo en tus 3 áreas, lo que más te conviene es el programa completo: 2 meses, nos vemos cada semana, te acompaño con el plan de acción y tienes acceso a WALA incluido. El total es S/450, lo dividimos en dos: S/225 hoy y S/225 al mes. ¿Cuándo arrancamos?',
  cierre_wala: 'Bienvenido a WALA [Nombre]. Tu suscripción de S/49/mes está activa.'
}

export const LEAD_STATUS = {
  tarjeta_entregada: 'Visitado (Tarjeta Entregada)',
  prueba_activa: 'Prueba Activa (7d)',
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
