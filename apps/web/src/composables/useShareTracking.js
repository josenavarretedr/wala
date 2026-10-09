/**
 * useShareTracking.js - Composable para tracking de eventos de compartir
 * Integra Firebase Analytics para monitorear el uso de la funcionalidad
 */

import { ref } from 'vue';
import { getAnalytics, logEvent } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';
import appFirebase from '@/firebaseInit';

export function useShareTracking() {
  const analytics = getAnalytics(appFirebase);
  const auth = getAuth(appFirebase);

  const isTracking = ref(false);
  const lastEventId = ref(null);

  /**
   * Obtiene contexto del usuario actual
   * @returns {Object}
   */
  const getUserContext = () => {
    const user = auth.currentUser;

    return {
      userId: user?.uid || 'anonymous',
      userEmail: user?.email || 'not-logged',
      timestamp: new Date().toISOString(),
      timestampMs: Date.now()
    };
  };

  /**
   * Genera ID único para el evento
   * @returns {string}
   */
  const generateEventId = () => {
    return `share_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  /**
   * Trackea inicio de intento de compartir
   * @param {Object} params - Parámetros del evento
   */
  const trackShareAttempt = async (params = {}) => {
    const {
      componentType = 'unknown',
      fileName = 'unknown',
      hasWatermark = true
    } = params;

    isTracking.value = true;
    const eventId = generateEventId();
    lastEventId.value = eventId;

    try {
      const userContext = getUserContext();

      await logEvent(analytics, 'share_attempt', {
        event_id: eventId,
        component_type: componentType,
        file_name: fileName,
        has_watermark: hasWatermark,
        user_id: userContext.userId,
        timestamp: userContext.timestamp
      });

      console.log('📊 Tracking: share_attempt', {
        eventId,
        componentType
      });

    } catch (error) {
      console.error('❌ Error tracking share attempt:', error);
    } finally {
      isTracking.value = false;
    }
  };

  /**
   * Trackea compartir exitoso
   * @param {Object} params - Parámetros del evento
   */
  const trackShareSuccess = async (params = {}) => {
    const {
      componentType = 'unknown',
      shareMethod = 'unknown', // 'webshare' | 'download'
      fileName = 'unknown',
      fileSize = 0,
      captureTime = 0,
      totalTime = 0
    } = params;

    isTracking.value = true;

    try {
      const userContext = getUserContext();

      await logEvent(analytics, 'share_success', {
        event_id: lastEventId.value || generateEventId(),
        component_type: componentType,
        share_method: shareMethod,
        file_name: fileName,
        file_size_kb: Math.round(fileSize / 1024),
        capture_time_ms: captureTime,
        total_time_ms: totalTime,
        user_id: userContext.userId,
        timestamp: userContext.timestamp,
        platform: getMobilePlatform(),
        browser: getBrowser()
      });

      console.log('📊 Tracking: share_success', {
        componentType,
        shareMethod,
        fileSizeKB: Math.round(fileSize / 1024)
      });

    } catch (error) {
      console.error('❌ Error tracking share success:', error);
    } finally {
      isTracking.value = false;
    }
  };

  /**
   * Trackea error al compartir
   * @param {Object} params - Parámetros del evento
   */
  const trackShareError = async (params = {}) => {
    const {
      componentType = 'unknown',
      errorType = 'unknown',
      errorMessage = '',
      stage = 'unknown' // 'capture' | 'process' | 'share'
    } = params;

    isTracking.value = true;

    try {
      const userContext = getUserContext();

      await logEvent(analytics, 'share_error', {
        event_id: lastEventId.value || generateEventId(),
        component_type: componentType,
        error_type: errorType,
        error_message: errorMessage.substring(0, 100), // Limitar tamaño
        stage: stage,
        user_id: userContext.userId,
        timestamp: userContext.timestamp
      });

      console.log('📊 Tracking: share_error', {
        componentType,
        errorType,
        stage
      });

    } catch (error) {
      console.error('❌ Error tracking share error:', error);
    } finally {
      isTracking.value = false;
    }
  };

  /**
   * Trackea cancelación de compartir
   * @param {Object} params - Parámetros del evento
   */
  const trackShareCancelled = async (params = {}) => {
    const {
      componentType = 'unknown',
      stage = 'unknown'
    } = params;

    isTracking.value = true;

    try {
      const userContext = getUserContext();

      await logEvent(analytics, 'share_cancelled', {
        event_id: lastEventId.value || generateEventId(),
        component_type: componentType,
        stage: stage,
        user_id: userContext.userId,
        timestamp: userContext.timestamp
      });

      console.log('📊 Tracking: share_cancelled', {
        componentType,
        stage
      });

    } catch (error) {
      console.error('❌ Error tracking share cancelled:', error);
    } finally {
      isTracking.value = false;
    }
  };

  /**
   * Trackea métricas de performance
   * @param {Object} metrics - Métricas a trackear
   */
  const trackSharePerformance = async (metrics = {}) => {
    const {
      componentType = 'unknown',
      captureTime = 0,
      processingTime = 0,
      shareTime = 0,
      totalTime = 0,
      imageWidth = 0,
      imageHeight = 0,
      fileSize = 0
    } = metrics;

    try {
      await logEvent(analytics, 'share_performance', {
        component_type: componentType,
        capture_time_ms: captureTime,
        processing_time_ms: processingTime,
        share_time_ms: shareTime,
        total_time_ms: totalTime,
        image_width: imageWidth,
        image_height: imageHeight,
        file_size_kb: Math.round(fileSize / 1024),
        timestamp: new Date().toISOString()
      });

      console.log('📊 Tracking: share_performance', {
        totalTime: `${totalTime}ms`,
        fileSize: `${Math.round(fileSize / 1024)}KB`
      });

    } catch (error) {
      console.error('❌ Error tracking share performance:', error);
    }
  };

  /**
   * Obtiene la plataforma móvil
   * @returns {string}
   */
  const getMobilePlatform = () => {
    if (typeof navigator === 'undefined') return 'unknown';

    const userAgent = navigator.userAgent.toLowerCase();

    if (userAgent.includes('android')) return 'android';
    if (userAgent.includes('iphone')) return 'iphone';
    if (userAgent.includes('ipad')) return 'ipad';
    if (userAgent.includes('mobile')) return 'mobile';

    return 'desktop';
  };

  /**
   * Obtiene información del navegador
   * @returns {string}
   */
  const getBrowser = () => {
    if (typeof navigator === 'undefined') return 'unknown';

    const userAgent = navigator.userAgent.toLowerCase();

    if (userAgent.includes('chrome')) return 'chrome';
    if (userAgent.includes('safari')) return 'safari';
    if (userAgent.includes('firefox')) return 'firefox';
    if (userAgent.includes('edge')) return 'edge';
    if (userAgent.includes('opera')) return 'opera';

    return 'other';
  };

  /**
   * Trackea evento personalizado de compartir
   * @param {string} eventName - Nombre del evento
   * @param {Object} params - Parámetros adicionales
   */
  const trackCustomShareEvent = async (eventName, params = {}) => {
    try {
      const userContext = getUserContext();

      await logEvent(analytics, eventName, {
        ...params,
        user_id: userContext.userId,
        timestamp: userContext.timestamp
      });

      console.log(`📊 Tracking: ${eventName}`, params);

    } catch (error) {
      console.error(`❌ Error tracking ${eventName}:`, error);
    }
  };

  /**
   * Obtiene estadísticas de uso (debe implementarse en Analytics)
   * @returns {Object}
   */
  const getShareStats = () => {
    return {
      totalShares: 0, // Se obtendría de Analytics
      successRate: 0,
      preferredMethod: 'unknown',
      averageTime: 0,
      lastShare: lastEventId.value
    };
  };

  return {
    // Estado
    isTracking,
    lastEventId,

    // Métodos principales
    trackShareAttempt,
    trackShareSuccess,
    trackShareError,
    trackShareCancelled,
    trackSharePerformance,

    // Métodos adicionales
    trackCustomShareEvent,
    getUserContext,
    getMobilePlatform,
    getBrowser,
    getShareStats
  };
}
