/* eslint-disable */
/**
 * Onboarding Module — Exports
 * 
 * Sistema de emails de onboarding via Resend.
 * Activado por eventos de Firestore (crear negocio, cambios de streak).
 * 
 * Fase 1: Welcome email al crear negocio
 * Fase 2: Emails reactivos al streak (first-flame, streak-3, streak-7, streak-lost)
 * Fase 3: Emails programados (scheduled) — por implementar
 */

// Fase 1: Email de bienvenida al crear negocio
const { onBusinessCreatedOnboarding } = require('./onBusinessCreatedOnboarding');

// Fase 2: Emails reactivos al streak
const { onStreakUpdated } = require('./onStreakUpdated');

module.exports = {
  onBusinessCreatedOnboarding,
  onStreakUpdated,
};
