/* eslint-disable */
/**
 * streak7.js — Email: ¡7 días! 🏆
 * 
 * Trigger: onStreakUpdated → streak.current === 7
 * Objetivo: Celebrar el North Star metric - racha de 7 días
 */

const { baseTemplate, metricCard, callout, COLORS } = require('./baseTemplate');

/**
 * @param {Object} vars
 * @param {string} vars.nombre - Nombre del usuario
 * @param {string} vars.businessId - ID del negocio
 * @returns {{ subject: string, html: string }}
 */
function streak7({ nombre = 'emprendedor', businessId = '' }) {
  const displayName = nombre || 'emprendedor';
  const ctaUrl = businessId
    ? `https://wala.lat/app/${businessId}/streak`
    : 'https://wala.lat/app';

  const subject = '🏆 7 DIAS. Lo lograste.';

  const body = `
    <p style="margin:0 0 6px 0; font-size:13px; color:${COLORS.textXLight}; text-transform:uppercase; letter-spacing:0.8px;">North Star alcanzado</p>
    <p style="margin:0 0 20px 0; font-size:22px; font-weight:700; color:${COLORS.text}; line-height:1.3;">
      <span style="color:${COLORS.primary};">${displayName}</span>,<br>lo lograste. 7 dias.
    </p>

    ${metricCard({ emoji: '🏆', label: 'Racha completada', value: '7 dias consecutivos', bg: 'linear-gradient(135deg, #FEF2F2, #FFF7ED)' })}

    <p style="margin:0 0 16px 0;">
      Esto no es un numero.<br>
      Es <strong>una semana entera</strong> sabiendo como va tu negocio.
    </p>

    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 20px 0; border-radius:10px; overflow:hidden; border:1px solid ${COLORS.border};">
      <tr>
        <td style="padding:14px 16px; background:${COLORS.bgMid}; text-align:center; width:50%; border-right:1px solid ${COLORS.border};">
          <span style="font-size:11px; color:${COLORS.textXLight}; display:block; margin-bottom:4px; text-transform:uppercase; letter-spacing:0.5px;">Antes</span>
          <strong style="color:${COLORS.textXLight}; font-size:15px;">No sabias</strong>
        </td>
        <td style="padding:14px 16px; background:${COLORS.greenLight}; text-align:center; width:50%;">
          <span style="font-size:11px; color:${COLORS.textXLight}; display:block; margin-bottom:4px; text-transform:uppercase; letter-spacing:0.5px;">Ahora</span>
          <strong style="color:${COLORS.green}; font-size:15px;">Claridad total</strong>
        </td>
      </tr>
    </table>

    <p style="margin:0 0 20px 0;">Eso nadie te lo quita.</p>

    ${callout({ text: '<strong>El siguiente reto:</strong> Llegar a 14 dias.<br>Pero por hoy, disfruta esto. Te lo ganaste.', color: COLORS.primary, bg: COLORS.primaryLight })}
  `;

  const html = baseTemplate({
    preheader: 'Una semana entera sabiendo como va tu negocio.',
    body,
    ctaText: '🏆 Ver mi racha',
    ctaUrl,
    footer: '— WALA, tu copiloto.',
  });

  return { subject, html };
}

module.exports = { streak7 };
