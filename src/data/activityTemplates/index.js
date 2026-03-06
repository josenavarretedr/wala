/**
 * Índice central de templates de actividades predefinidas.
 * Cada template contiene fields listos para cargar en NewActivity.
 *
 * Para agregar nuevos templates:
 * 1. Crea un archivo .js en esta carpeta con el array de templates
 * 2. Impórtalo aquí y agrégalo al array `allTemplates`
 */

import { identificacionTemplates } from './identificacion'
import { capacitacionTemplates } from './capacitacion'
import { canvasTemplates } from './canvas'

/**
 * Todos los templates disponibles en el sistema
 * Cada uno tiene: id, name, description, suggestedStage, fields[]
 */
export const allTemplates = [
  ...identificacionTemplates,
  ...capacitacionTemplates,
  ...canvasTemplates,
]

/**
 * Agrupa templates por etapa sugerida
 * @returns {Record<string, Array>} Mapa stageName -> templates[]
 */
export function getTemplatesByStage() {
  const groups = {}
  for (const tpl of allTemplates) {
    const stage = tpl.suggestedStage || 'Sin etapa'
    if (!groups[stage]) groups[stage] = []
    groups[stage].push(tpl)
  }
  return groups
}

/**
 * Busca templates que coincidan con un texto de búsqueda
 * @param {string} query
 * @returns {Array}
 */
export function searchTemplates(query) {
  const q = query.toLowerCase().trim()
  if (!q) return allTemplates
  return allTemplates.filter(
    (t) =>
      t.name.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.suggestedStage.toLowerCase().includes(q)
  )
}

/**
 * Genera los fields de un template con IDs únicos (para evitar colisiones)
 * @param {object} template
 * @returns {Array} fields con IDs regenerados
 */
export function cloneTemplateFields(template) {
  const now = Date.now()
  return template.fields.map((f, i) => ({
    ...f,
    id: `field_${now}_${i}`,
    order: i,
  }))
}
