/* eslint-disable */
/**
 * welcome.js — Email 0: Bienvenida (Día 0)
 * 
 * Trigger: onBusinessCreated (cuando se crea el primer negocio del usuario)
 * Objetivo: Anclar el WHY + primer paso (registrar primera transacción)
 */

const { baseTemplate, metricCard, callout, COLORS } = require('./baseTemplate');

/**
 * @param {Object} vars
 * @param {string} vars.nombre - Nombre del usuario
 * @param {string} vars.businessId - ID del negocio (para deep link)
 * @returns {{ subject: string, html: string }}
 */
function welcome({ nombre = 'emprendedor', businessId = '' }) {
  const displayName = nombre || 'emprendedor';
  const ctaUrl = businessId
    ? `https://wala.lat/app/${businessId}/dashboard`
    : 'https://wala.lat/app';

  const subject = 'Tu negocio no necesita mas trabajo. Necesita mas claridad.';

  const body = `
    <p style="margin:0 0 6px 0; font-size:13px; color:${COLORS.textXLight}; text-transform:uppercase; letter-spacing:0.8px;">Bienvenido a WALA</p>
    <p style="margin:0 0 20px 0; font-size:22px; font-weight:700; color:${COLORS.text}; line-height:1.3;">
      Hola <span style="color:${COLORS.primary};">${displayName}</span>.
    </p>

    <p style="margin:0 0 16px 0;">
      Sabemos como se siente: trabajas todo el dia, vendes, compras, pagas...
      pero al final <strong>no sabes si realmente ganaste</strong>.
    </p>

    <p style="margin:0 0 20px 0;">
      WALA existe para eso.<br>
      No es una app mas. Es tu copiloto: te dice donde estas y que revisar.
    </p>

    ${callout({ text: '<strong>Un solo paso hoy:</strong><br>Registra tu primera venta o gasto y enciende tu primera llama 🔥', color: COLORS.primary, bg: COLORS.primaryLight })}
  `;

  const footer = 'No necesitas ser contador. Solo necesitas 2 minutos al dia.';

  const html = baseTemplate({
    preheader: 'WALA ya esta listo para ti.',
    body,
    ctaText: '👉 Registrar mi primer movimiento',
    ctaUrl,
    footer,
  });

  return { subject, html };
}

module.exports = { welcome };
