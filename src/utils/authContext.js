// utils/authContext.js - Sistema de gestión de contexto de autenticación
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/firebaseInit';
import { generateSecureUUID } from './generateUUID';

/**
 * Gestor centralizado del contexto de autenticación
 * Proporciona información consistente del usuario autenticado
 * para el sistema de trazabilidad
 */
export class AuthContextManager {
  constructor() {
    this.currentUser = null;
    this.authListeners = [];
    this.sessionId = generateSecureUUID();
    this.sessionStartTime = new Date().toISOString();
    this.initializeAuthListener();
  }

  /**
   * Inicializa el listener de cambios de autenticación
   * Se ejecuta automáticamente al crear la instancia
   */
  initializeAuthListener() {
    onAuthStateChanged(auth, (user) => {
      const previousUser = this.currentUser;
      this.currentUser = user;
      
      // Log del cambio de autenticación para trazabilidad
      this.logAuthChange(previousUser, user);
      
      // Notificar a todos los listeners
      this.notifyAuthChange(user);
    });
  }

  /**
   * Obtiene el contexto completo del usuario actual
   * @returns {Object|null} Contexto del usuario o null si no está autenticado
   */
  getCurrentUserContext() {
    if (!this.currentUser) {
      return null;
    }
    
    return {
      // Identificación del usuario
      userId: this.currentUser.uid,
      userName: this.currentUser.displayName || this.currentUser.email?.split('@')[0] || 'Usuario Anónimo',
      userEmail: this.currentUser.email,
      
      // Estado de autenticación
      isAuthenticated: true,
      authProvider: this.currentUser.providerData[0]?.providerId || 'email',
      emailVerified: this.currentUser.emailVerified,
      
      // Información de sesión
      sessionId: this.sessionId,
      sessionStartTime: this.sessionStartTime,
      lastSignInTime: this.currentUser.metadata?.lastSignInTime || null,
      
      // Metadatos adicionales para trazabilidad
      creationTime: this.currentUser.metadata?.creationTime || null,
      isNewUser: this.isNewUser(),
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Verifica si el usuario está autenticado
   * @returns {boolean} True si está autenticado
   */
  isUserAuthenticated() {
    return !!this.currentUser;
  }

  /**
   * Determina si es un usuario nuevo (registrado en las últimas 24 horas)
   * @returns {boolean} True si es nuevo usuario
   */
  isNewUser() {
    if (!this.currentUser?.metadata?.creationTime) return false;
    
    const creationTime = new Date(this.currentUser.metadata.creationTime);
    const now = new Date();
    const hoursSinceCreation = (now - creationTime) / (1000 * 60 * 60);
    
    return hoursSinceCreation < 24;
  }

  /**
   * Obtiene información básica del usuario para logs
   * @returns {Object} Información mínima del usuario
   */
  getUserBasicInfo() {
    if (!this.currentUser) {
      return {
        userId: null,
        userName: 'No autenticado',
        isAuthenticated: false
      };
    }

    return {
      userId: this.currentUser.uid,
      userName: this.currentUser.displayName || this.currentUser.email?.split('@')[0] || 'Usuario',
      isAuthenticated: true
    };
  }

  /**
   * Registra un listener para cambios de autenticación
   * @param {Function} callback - Función que se ejecuta cuando cambia la autenticación
   */
  onAuthChange(callback) {
    if (typeof callback === 'function') {
      this.authListeners.push(callback);
    }
  }

  /**
   * Remueve un listener de cambios de autenticación
   * @param {Function} callback - Función a remover
   */
  offAuthChange(callback) {
    this.authListeners = this.authListeners.filter(listener => listener !== callback);
  }

  /**
   * Notifica a todos los listeners sobre cambios de autenticación
   * @param {Object|null} user - Usuario actual o null
   */
  notifyAuthChange(user) {
    this.authListeners.forEach(callback => {
      try {
        callback(user);
      } catch (error) {
        console.error('Error en auth listener:', error);
      }
    });
  }

  /**
   * Registra cambios de autenticación para trazabilidad
   * @param {Object|null} previousUser - Usuario anterior
   * @param {Object|null} currentUser - Usuario actual
   */
  logAuthChange(previousUser, currentUser) {
    const changeType = this.determineAuthChangeType(previousUser, currentUser);
    
    console.log(`🔐 Auth Change: ${changeType}`, {
      sessionId: this.sessionId,
      previousUserId: previousUser?.uid || null,
      currentUserId: currentUser?.uid || null,
      timestamp: new Date().toISOString(),
      changeType
    });

    // TODO: Integrar con sistema de trazabilidad cuando esté disponible
    // this.traceAuthChange(changeType, previousUser, currentUser);
  }

  /**
   * Determina el tipo de cambio de autenticación
   * @param {Object|null} previousUser - Usuario anterior
   * @param {Object|null} currentUser - Usuario actual
   * @returns {string} Tipo de cambio
   */
  determineAuthChangeType(previousUser, currentUser) {
    if (!previousUser && currentUser) return 'login';
    if (previousUser && !currentUser) return 'logout';
    if (previousUser && currentUser && previousUser.uid !== currentUser.uid) return 'user_switch';
    if (!previousUser && !currentUser) return 'no_change';
    return 'session_refresh';
  }

  /**
   * Genera un nuevo session ID (útil para reiniciar sesión)
   */
  renewSessionId() {
    this.sessionId = generateSecureUUID();
    this.sessionStartTime = new Date().toISOString();
    
    console.log('🔄 Session renewed:', {
      newSessionId: this.sessionId,
      timestamp: this.sessionStartTime
    });
  }

  /**
   * Obtiene estadísticas de la sesión actual
   * @returns {Object} Estadísticas de sesión
   */
  getSessionStats() {
    const sessionDuration = new Date() - new Date(this.sessionStartTime);
    
    return {
      sessionId: this.sessionId,
      sessionStartTime: this.sessionStartTime,
      sessionDurationMs: sessionDuration,
      sessionDurationMinutes: Math.floor(sessionDuration / (1000 * 60)),
      isAuthenticated: this.isUserAuthenticated(),
      listenersCount: this.authListeners.length,
      currentUserId: this.currentUser?.uid || null
    };
  }

  // TODO: Preparado para futura integración con geoContext
  /**
   * Obtiene contexto geográfico (preparado para futura implementación)
   * @returns {Object} Contexto geográfico por defecto
   */
  /*
  getGeoContext() {
    // FUTURO: Integrar con geoContext cuando esté implementado
    return {
      ip: 'unknown',
      country: 'unknown',
      countryCode: 'unknown',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      // geoDetectionEnabled: false
    };
  }
  */
}

/**
 * Instancia singleton del gestor de contexto de autenticación
 * Usar esta instancia en toda la aplicación para mantener consistencia
 */
export const authContext = new AuthContextManager();

// Logging inicial para debugging
console.log('🚀 AuthContext initialized:', {
  sessionId: authContext.sessionId,
  timestamp: authContext.sessionStartTime
});