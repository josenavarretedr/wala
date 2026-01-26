/* eslint-disable */

/**
 * htmlSanitizer.js - Utilidad para sanitizar HTML antes de renderizar
 * Elimina elementos potencialmente peligrosos para seguridad
 */

const DANGEROUS_TAGS = ['script', 'iframe', 'object', 'embed', 'form', 'input', 'button'];
const DANGEROUS_ATTRS = ['onclick', 'onerror', 'onload', 'onmouseover', 'onfocus', 'onblur'];
const DANGEROUS_PROTOCOLS = ['javascript:', 'data:text/html', 'vbscript:'];

/**
 * Sanitiza HTML eliminando elementos y atributos peligrosos
 * @param {string} html - HTML a sanitizar
 * @returns {string} HTML limpio
 */
function sanitizeHTML(html) {
  if (!html || typeof html !== 'string') {
    return '';
  }

  let sanitized = html;

  // 1. Eliminar tags peligrosos
  DANGEROUS_TAGS.forEach(tag => {
    const regex = new RegExp(`<${tag}[^>]*>.*?</${tag}>`, 'gis');
    sanitized = sanitized.replace(regex, '');

    // También eliminar tags self-closing
    const selfClosingRegex = new RegExp(`<${tag}[^>]*/>`, 'gi');
    sanitized = sanitized.replace(selfClosingRegex, '');
  });

  // 2. Eliminar atributos de eventos
  DANGEROUS_ATTRS.forEach(attr => {
    const regex = new RegExp(`\\s${attr}\\s*=\\s*["'][^"']*["']`, 'gi');
    sanitized = sanitized.replace(regex, '');
  });

  // 3. Eliminar protocolos peligrosos en href/src
  DANGEROUS_PROTOCOLS.forEach(protocol => {
    const regex = new RegExp(`(href|src)\\s*=\\s*["']${protocol}[^"']*["']`, 'gi');
    sanitized = sanitized.replace(regex, '');
  });

  // 4. Validar que el HTML resultante no esté vacío
  const hasContent = sanitized.trim().length > 0 && /<[^>]+>/.test(sanitized);

  return hasContent ? sanitized : '';
}

/**
 * Valida dimensiones del viewport
 * @param {number} width - Ancho
 * @param {number} height - Alto
 * @returns {boolean}
 */
function validateDimensions(width, height) {
  const MAX_WIDTH = 1200;
  const MAX_HEIGHT = 2500;
  const MIN_WIDTH = 100;
  const MIN_HEIGHT = 100;

  return (
    width >= MIN_WIDTH &&
    width <= MAX_WIDTH &&
    height >= MIN_HEIGHT &&
    height <= MAX_HEIGHT
  );
}

/**
 * Valida tamaño del HTML
 * @param {string} html - HTML a validar
 * @returns {boolean}
 */
function validateHTMLSize(html) {
  const MAX_SIZE_KB = 500;
  const sizeInBytes = Buffer.byteLength(html, 'utf8');
  const sizeInKB = sizeInBytes / 1024;

  return sizeInKB <= MAX_SIZE_KB;
}

module.exports = {
  sanitizeHTML,
  validateDimensions,
  validateHTMLSize
};
