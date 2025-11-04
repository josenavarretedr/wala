// src/composables/useBusinessSettings.js
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebaseInit';

/**
 * Composable para gestionar la subcolección settings/ de un negocio
 * 
 * Proporciona funcionalidades para:
 * - Leer/escribir configuración general (config)
 * - Gestionar integraciones de terceros (integrations)
 * - Personalizar branding e interfaz (customization)
 * 
 * @returns {Object} Métodos para gestionar settings
 */
export function useBusinessSettings() {

  /**
   * Obtiene la configuración general del negocio
   * @param {string} businessId - ID del negocio
   * @returns {Promise<Object|null>} Configuración o null si no existe
   */
  async function getConfig(businessId) {
    try {
      const configRef = doc(db, 'businesses', businessId, 'settings', 'config');
      const configSnap = await getDoc(configRef);

      if (configSnap.exists()) {
        return configSnap.data();
      }

      console.warn(`⚠️ No existe configuración para negocio ${businessId}`);
      return null;
    } catch (error) {
      console.error('❌ Error obteniendo configuración:', error);
      throw error;
    }
  }

  /**
   * Actualiza la configuración general del negocio
   * @param {string} businessId - ID del negocio
   * @param {Object} config - Configuración a actualizar
   * @returns {Promise<void>}
   */
  async function updateConfig(businessId, config) {
    try {
      const configRef = doc(db, 'businesses', businessId, 'settings', 'config');

      await updateDoc(configRef, {
        ...config,
        updatedAt: new Date()
      });

      console.log(`✅ Configuración actualizada para negocio ${businessId}`);
    } catch (error) {
      console.error('❌ Error actualizando configuración:', error);
      throw error;
    }
  }

  /**
   * Crea la configuración inicial si no existe
   * @param {string} businessId - ID del negocio
   * @param {Object} config - Configuración inicial (opcional)
   * @returns {Promise<void>}
   */
  async function createConfig(businessId, config = {}) {
    try {
      const configRef = doc(db, 'businesses', businessId, 'settings', 'config');

      const defaultConfig = {
        workingHours: {
          monday: { open: '08:00', close: '18:00', isOpen: true },
          tuesday: { open: '08:00', close: '18:00', isOpen: true },
          wednesday: { open: '08:00', close: '18:00', isOpen: true },
          thursday: { open: '08:00', close: '18:00', isOpen: true },
          friday: { open: '08:00', close: '18:00', isOpen: true },
          saturday: { open: '09:00', close: '14:00', isOpen: true },
          sunday: { open: '00:00', close: '00:00', isOpen: false }
        },
        notifications: {
          email: true,
          push: true,
          lowStock: true,
          dailyReport: false
        },
        display: {
          theme: 'auto',
          language: 'es',
          dateFormat: 'DD/MM/YYYY',
          currencyFormat: '$1,000.00'
        },
        ...config,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await setDoc(configRef, defaultConfig);

      console.log(`✅ Configuración inicial creada para negocio ${businessId}`);
    } catch (error) {
      console.error('❌ Error creando configuración:', error);
      throw error;
    }
  }

  /**
   * Obtiene las integraciones configuradas del negocio
   * @param {string} businessId - ID del negocio
   * @returns {Promise<Object|null>} Integraciones o null si no existen
   */
  async function getIntegrations(businessId) {
    try {
      const intRef = doc(db, 'businesses', businessId, 'settings', 'integrations');
      const intSnap = await getDoc(intRef);

      if (intSnap.exists()) {
        return intSnap.data();
      }

      console.warn(`⚠️ No existen integraciones para negocio ${businessId}`);
      return null;
    } catch (error) {
      console.error('❌ Error obteniendo integraciones:', error);
      throw error;
    }
  }

  /**
   * Actualiza una integración específica
   * @param {string} businessId - ID del negocio
   * @param {string} category - Categoría de integración ('payment', 'accounting', 'shipping')
   * @param {string} provider - Proveedor específico ('stripe', 'paypal', etc.)
   * @param {Object} config - Configuración de la integración
   * @returns {Promise<void>}
   */
  async function updateIntegration(businessId, category, provider, config) {
    try {
      const intRef = doc(db, 'businesses', businessId, 'settings', 'integrations');

      await updateDoc(intRef, {
        [`${category}.${provider}`]: config,
        updatedAt: new Date()
      });

      console.log(`✅ Integración ${provider} actualizada para negocio ${businessId}`);
    } catch (error) {
      console.error('❌ Error actualizando integración:', error);
      throw error;
    }
  }

  /**
   * Habilita o deshabilita una integración
   * @param {string} businessId - ID del negocio
   * @param {string} category - Categoría de integración
   * @param {string} provider - Proveedor específico
   * @param {boolean} enabled - Estado de habilitación
   * @returns {Promise<void>}
   */
  async function toggleIntegration(businessId, category, provider, enabled) {
    try {
      const intRef = doc(db, 'businesses', businessId, 'settings', 'integrations');

      await updateDoc(intRef, {
        [`${category}.${provider}.enabled`]: enabled,
        updatedAt: new Date()
      });

      console.log(`✅ Integración ${provider} ${enabled ? 'habilitada' : 'deshabilitada'}`);
    } catch (error) {
      console.error('❌ Error cambiando estado de integración:', error);
      throw error;
    }
  }

  /**
   * Obtiene la personalización (branding) del negocio
   * @param {string} businessId - ID del negocio
   * @returns {Promise<Object|null>} Personalización o null si no existe
   */
  async function getCustomization(businessId) {
    try {
      const custRef = doc(db, 'businesses', businessId, 'settings', 'customization');
      const custSnap = await getDoc(custRef);

      if (custSnap.exists()) {
        return custSnap.data();
      }

      console.warn(`⚠️ No existe personalización para negocio ${businessId}`);
      return null;
    } catch (error) {
      console.error('❌ Error obteniendo personalización:', error);
      throw error;
    }
  }

  /**
   * Actualiza la personalización del negocio
   * @param {string} businessId - ID del negocio
   * @param {Object} customization - Personalización a actualizar
   * @returns {Promise<void>}
   */
  async function updateCustomization(businessId, customization) {
    try {
      const custRef = doc(db, 'businesses', businessId, 'settings', 'customization');

      await updateDoc(custRef, {
        ...customization,
        updatedAt: new Date()
      });

      console.log(`✅ Personalización actualizada para negocio ${businessId}`);
    } catch (error) {
      console.error('❌ Error actualizando personalización:', error);
      throw error;
    }
  }

  /**
   * Actualiza solo el branding (colores y logos)
   * @param {string} businessId - ID del negocio
   * @param {Object} branding - Branding a actualizar
   * @returns {Promise<void>}
   */
  async function updateBranding(businessId, branding) {
    try {
      const custRef = doc(db, 'businesses', businessId, 'settings', 'customization');

      await updateDoc(custRef, {
        'branding': branding,
        updatedAt: new Date()
      });

      console.log(`✅ Branding actualizado para negocio ${businessId}`);
    } catch (error) {
      console.error('❌ Error actualizando branding:', error);
      throw error;
    }
  }

  /**
   * Actualiza las plantillas de documentos (invoice/receipt)
   * @param {string} businessId - ID del negocio
   * @param {string} type - Tipo de documento ('invoice' o 'receipt')
   * @param {Object} template - Configuración de la plantilla
   * @returns {Promise<void>}
   */
  async function updateDocumentTemplate(businessId, type, template) {
    try {
      const custRef = doc(db, 'businesses', businessId, 'settings', 'customization');

      await updateDoc(custRef, {
        [type]: template,
        updatedAt: new Date()
      });

      console.log(`✅ Plantilla de ${type} actualizada para negocio ${businessId}`);
    } catch (error) {
      console.error('❌ Error actualizando plantilla:', error);
      throw error;
    }
  }

  /**
   * Obtiene toda la configuración de settings/ en un solo objeto
   * @param {string} businessId - ID del negocio
   * @returns {Promise<Object>} Objeto con config, integrations, customization
   */
  async function getAllSettings(businessId) {
    try {
      const [config, integrations, customization] = await Promise.all([
        getConfig(businessId),
        getIntegrations(businessId),
        getCustomization(businessId)
      ]);

      return {
        config,
        integrations,
        customization
      };
    } catch (error) {
      console.error('❌ Error obteniendo todas las configuraciones:', error);
      throw error;
    }
  }

  return {
    // Config
    getConfig,
    updateConfig,
    createConfig,

    // Integrations
    getIntegrations,
    updateIntegration,
    toggleIntegration,

    // Customization
    getCustomization,
    updateCustomization,
    updateBranding,
    updateDocumentTemplate,

    // Utilidades
    getAllSettings
  };
}
