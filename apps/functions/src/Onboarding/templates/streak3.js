/* eslint-disable */
/**
 * streak3.js — Email 2: Racha de 3 🔥🔥🔥
 * 
 * Trigger: onStreakUpdated → streak.current === 3
 * Objetivo: Reforzar hábito y mostrar que ya hay datos útiles
 */

const { baseTemplate, metricCard, callout, COLORS } = require('./baseTemplate');

/**
 * @param {Object} vars
 * @param {string} vars.nombre - Nombre del usuario
 * @param {string} vars.businessId - ID del negocio
 * @returns {{ subject: string, html: string }}
 */
function streak3({ nombre = 'emprendedor', businessId = '' }) {
  const displayName = nombre || 'emprendedor';
  const ctaUrl = businessId
    ? `https://wala.lat/app/${businessId}/dashboard`
    : 'https://wala.lat/app';

  const subject = '🔥🔥🔥 3 dias seguidos. Ya eres diferente.';

  const body = `
    <p style="margin:0 0 6px 0; font-size:13px; color:${COLORS.textXLight}; text-transform:uppercase; letter-spacing:0.8px;">Racha en progreso</p>
    <p style="margin:0 0 20px 0; font-size:22px; font-weight:700; color:${COLORS.text}; line-height:1.3;">
      <span style="color:${COLORS.primary};">${displayName}</span>,<br>ya eres diferente.
    </p>

    ${metricCard({ emoji: '🔥🔥🔥', label: 'Racha actual', value: '3 dias consecutivos' })}

    <p style="margin:0 0 16px 0;">
      La mayoria abandona despues del primero.<br>
      <strong>Tu no.</strong>
    </p>

    <p style="margin:0 0 12px 0;">Con 3 dias de datos, WALA ya puede mostrarte:</p>

    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 20px 0;">
      <tr>
        <td style="padding:10px 12px; background:${COLORS.bgLight}; border-radius:8px; border:1px solid ${COLORS.borderLight}; font-size:14px; color:${COLORS.textMid};">
          &rsaquo;&nbsp; Cuanto vendiste<br>
          &rsaquo;&nbsp; Cuanto gastaste<br>
          &rsaquo;&nbsp; Que quedo realmente
        </td>
      </tr>
    </table>

    ${callout({ text: '<strong>4 dias mas y llegas a la semana completa.</strong><br>Tu negocio te lo va a agradecer.', color: COLORS.green, bg: COLORS.greenLight })}
  `;

  const html = baseTemplate({
    preheader: 'La mayoria abandona despues del primero. Tu no.',
    body,
    ctaText: '📊 Ver mi resumen',
    ctaUrl,
  });

  return { subject, html };
}

module.exports = { streak3 };
