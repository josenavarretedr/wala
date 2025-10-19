/* eslint-disable */

const { callGrok } = require('../../Helpers/callAI');

const { extractSizeAndUnit, detectBrand } = require('./textUtils');
const { validateClassification } = require('./schema');

// Taxonomía base mínima (v1)
const TAXONOMIA_BASE = [
  'Bebidas/Gaseosas', 'Bebidas/Agua', 'Bebidas/Jugos',
  'Lácteos/Leche', 'Lácteos/Yogurt',
  'Snacks/Galletas', 'Snacks/Papas'
];

async function openaiZeroShotClassify({ text, businessCtx }) {
  const sys = `Eres un clasificador de productos para retail LATAM.
Devuelve SOLO JSON válido con: categoria, subcategoria, marca, presentacion, unidad (ml|l|g|kg|u), tamaño_num (número), confidence (0-1). Si dudas, igual responde con tu mejor estimación y confidence baja.`;

  const userPayload = JSON.stringify({
    producto: text,
    taxonomiaBase: TAXONOMIA_BASE,
    contextoNegocio: businessCtx || {}
  });

  const resp = await callGrok.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0.1,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: sys },
      { role: 'user', content: userPayload }
    ]
  });

  let parsed = {};
  try { parsed = JSON.parse(resp.choices?.[0]?.message?.content || '{}'); } catch { }

  // Heurísticas locales para completar
  const { size, unit } = extractSizeAndUnit(text);
  if (parsed.tamaño_num == null && size != null) parsed.tamaño_num = size;
  if (!parsed.unidad && unit) parsed.unidad = unit;
  if (!parsed.marca) parsed.marca = detectBrand(text);
  if (parsed.confidence == null) parsed.confidence = 0.6;
  parsed.source = 'openai';

  return validateClassification(parsed);
}

module.exports = { openaiZeroShotClassify };
