/* eslint-disable */
/**
 * streakLost.js — Email: Racha perdida
 * 
 * Trigger: onStreakUpdated → streak.current bajó a 0 desde >= 2
 *          (se rompió la racha, no es la primera vez)
 * Objetivo: Recuperar sin culpa, motivar a volver
 */

const { baseTemplate, metricCard, callout, COLORS } = require('./baseTemplate');

/**
 * @param {Object} vars
 * @param {string} vars.nombre - Nombre del usuario
 * @param {string} vars.businessId - ID del negocio
 * @param {number} vars.previousStreak - Racha anterior antes de perderse
 * @returns {{ subject: string, html: string }}
 */
function streakLost({ nombre = 'emprendedor', businessId = '', previousStreak = 0 }) {
  const displayName = nombre || 'emprendedor';
  const prev = previousStreak || 0;
  const ctaUrl = businessId
    ? `https://wala.lat/app/${businessId}/dashboard`
    : 'https://wala.lat/app';

  const subject = `Tu racha de ${prev} dia${prev !== 1 ? 's' : ''} se pauso.`;

  const body = `
    <p style="margin:0 0 6px 0; font-size:13px; color:${COLORS.textXLight}; text-transform:uppercase; letter-spacing:0.8px;">Racha pausada</p>
    <p style="margin:0 0 20px 0; font-size:22px; font-weight:700; color:${COLORS.text}; line-height:1.3;">
      <span style="color:${COLORS.primary};">${displayName}</span>,<br>puedes volver hoy mismo.
    </p>

    ${metricCard({ emoji: '❄️', label: 'Racha anterior', value: `${prev} dia${prev !== 1 ? 's' : ''}`, bg: COLORS.bgLight, color: COLORS.textMid })}

    <p style="margin:0 0 16px 0;">
      Pero mira lo que ya probaste: <strong>puedes hacerlo.</strong><br>
      ${prev} dia${prev !== 1 ? 's' : ''} no se borra${prev !== 1 ? 'n' : ''}. Esa disciplina sigue ahi.
    </p>

    <p style="margin:0 0 20px 0;">
      El camino no es no fallar nunca.<br>
      <strong>Es volver rapido.</strong>
    </p>

    ${callout({ text: 'Un solo registro hoy enciende la llama de nuevo 🔥', color: COLORS.primary, bg: COLORS.primaryLight })}
  `;

  const html = baseTemplate({
    preheader: 'Tu racha se pauso, pero puedes volver hoy.',
    body,
    ctaText: '🔥 Reactivar mi racha hoy',
    ctaUrl,
  });

  return { subject, html };
}

module.exports = { streakLost };
