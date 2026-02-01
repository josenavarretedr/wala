/* eslint-disable */

/**
 * Límites de plan para uso de IA
 */
const PLAN_LIMITS = {
  free: {
    maxClassificationsPerDay: 50,
    maxLLMCallsPerDay: 10,
    canUseAI: true
  },
  premium: {
    maxClassificationsPerDay: 500,
    maxLLMCallsPerDay: 200,
    canUseAI: true
  }
};

/**
 * Configuración de Grok/OpenAI
 */
const AI_CONFIG = {
  grok: {
    model: process.env.GROK_MODEL || 'grok-3-mini',
    apiKey: process.env.XAI_API_KEY,
    endpoint: 'https://api.x.ai/v1/chat/completions'
  },
  openai: {
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    apiKey: process.env.OPENAI_API_KEY
  }
};

/**
 * Thresholds de confianza para clasificación
 */
const CONFIDENCE_THRESHOLDS = {
  AUTO_CLASSIFY: 0.90,  // >= 90% → Clasificar automáticamente
  SUGGEST: 0.70,        // >= 70% → Sugerir pero pedir confirmación
  MANUAL: 0.70          // < 70% → Marcar como manual_required
};

/**
 * TTL para caché de clasificaciones (30 días en milisegundos)
 */
const CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000;

module.exports = {
  PLAN_LIMITS,
  AI_CONFIG,
  CONFIDENCE_THRESHOLDS,
  CACHE_TTL_MS
};
