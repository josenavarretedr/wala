/* eslint-disable */

function buildPrompt({ business, product }) {
  return `
Eres un asistente de inventario. Clasifica el siguiente producto retornando solo JSON.

Contexto del negocio:
- Industria: ${business?.industry || "N/A"}
- Descripción: ${business?.description || ""}

Producto:
- ${product?.description}

Salida esperada:
{
  "type": "insumo|mercaderia|servicio",
  "brand": "string|null",
  "category": "string|null",
  "subcategory": "string|null",
  "tags": ["string"],
  "confidence": 0.0,
  "rationale": "string"
}
  `.trim();
}

module.exports = { buildPrompt };
