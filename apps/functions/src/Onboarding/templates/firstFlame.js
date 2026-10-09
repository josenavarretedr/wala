/* eslint-disable */
/**
 * firstFlame.js — Email 1: Primera llama 🔥
 * 
 * Trigger: onStreakUpdated → streak.current === 1 (primera vez)
 * Objetivo: Celebrar primer día completo y motivar a seguir
 */

const { baseTemplate, metricCard, callout, COLORS } = require('./baseTemplate');

/**
 * @param {Object} vars
 * @param {string} vars.nombre - Nombre del usuario
 * @param {string} vars.businessId - ID del negocio
 * @returns {{ subject: string, html: string }}
 */
function firstFlame({ nombre = 'emprendedor', businessId = '' }) {
  const displayName = nombre || 'emprendedor';
  const ctaUrl = businessId
    ? `https://wala.lat/app/${businessId}/dashboard`
    : 'https://wala.lat/app';

  const subject = '🔥 La racha con tu negocio esta encendida.';

  const body = `
    <p style="margin:0 0 6px 0; font-size:13px; color:${COLORS.textXLight}; text-transform:uppercase; letter-spacing:0.8px;">Primer dia completado</p>
    <p style="margin:0 0 20px 0; font-size:22px; font-weight:700; color:${COLORS.text}; line-height:1.3;">
      <span style="color:${COLORS.primary};">${displayName}</span>, lo hiciste.
    </p>

    ${metricCard({ emoji: '🔥', label: 'Racha actual', value: '1 dia consecutivo' })}

    <p style="margin:0 0 16px 0;">
      Parece poco, pero es enorme.<br>
      Hoy sabes algo que ayer no sabias sobre tu negocio.
    </p>

    <p style="margin:0 0 20px 0;">
      Manana, haz lo mismo: registra tus movimientos.<br>
      <strong>Dos dias seguidos y tu llama crece.</strong>
    </p>

    ${callout({ text: 'Cada dia que registras, WALA entiende mejor tu negocio.<br>Y tu tambien.', color: COLORS.textXLight, bg: COLORS.bgMid })}
  `;

  const html = baseTemplate({
    preheader: 'Tu racha acaba de empezar: 1 dia consecutivo.',
    body,
    ctaText: '🔥 Abrir WALA',
    ctaUrl,
  });

  return { subject, html };
}

module.exports = { firstFlame };
