// utils/generateUUID.js
import { v4 as uuidv4 } from "uuid";

/**
 * Genera un UUID v4 seguro usando la librería uuid
 * @returns {string} UUID único
 */
export const generateSecureUUID = () => {
  return uuidv4();
};

/**
 * Alias para mantener compatibilidad
 * @returns {string} UUID único
 */
export const generateUUID = () => {
  return generateSecureUUID();
};

/**
 * Genera UUID con prefijo para diferentes tipos de entidades
 * @param {string} prefix - Prefijo para identificar el tipo (ej: 'txn', 'inv', 'usr')
 * @returns {string} UUID con prefijo
 */
export const generatePrefixedUUID = (prefix = '') => {
  const uuid = generateSecureUUID();
  return prefix ? `${prefix}_${uuid}` : uuid;
};

/**
 * Genera UUID corto para logs internos (sin guiones)
 * @returns {string} UUID sin formato
 */
export const generateShortUUID = () => {
  return generateSecureUUID().replace(/-/g, '');
};