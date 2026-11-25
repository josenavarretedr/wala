export const WHATSAPP_NUMBER = '51921492993';
export const REGISTER_PATH = '/auth/register';
export const LOGIN_PATH = '/auth/login';
export const DIAGNOSTICO_PATH = '/diagnostico';

export const DEFAULT_DIAGNOSTICO_MESSAGE =
  'Hola José, vi la página de WALA y quiero agendar mi diagnóstico gratuito de 30 minutos. ¿Agendamos para esta semana?';

export const DEFAULT_SOPORTE_MESSAGE =
  'Hola José, vi la página de WALA y tengo una consulta.';

export const DEFAULT_ETAPA0_CONSULTA_MESSAGE =
  'Hola José, vi wala.lat/diagnostico. Aún estoy empezando mi negocio y tengo una consulta rápida sobre WALA.';

export function buildWhatsAppUrl(message = DEFAULT_DIAGNOSTICO_MESSAGE) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
