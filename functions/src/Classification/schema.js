/* eslint-disable */

const { z } = require('zod');

const ClassificationSchema = z.object({
  categoria: z.string().min(1),
  subcategoria: z.string().min(1),
  marca: z.string().nullable().optional(),
  presentacion: z.string().nullable().optional(),
  unidad: z.enum(['ml', 'l', 'g', 'kg', 'u']).nullable().optional(),
  tamano_num: z.number().nullable().optional(),
  confidence: z.number().min(0).max(1).default(0.6),
  source: z.enum(['cache', 'rules', 'embeddings', 'openai']).default('openai')
});

function validateClassification(obj) {
  const res = ClassificationSchema.safeParse(obj);
  if (!res.success) {
    // fallback seguro mínimo
    return ClassificationSchema.parse({
      categoria: 'Pendiente',
      subcategoria: 'Pendiente',
      confidence: 0.3,
      source: 'openai'
    });
  }
  return res.data;
}

module.exports = { ClassificationSchema, validateClassification };
