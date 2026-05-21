import { getPromptMaestro, getRutasMaestras, getAllBancos } from '../services/fileParser';
import { CTA_POR_FUNNEL, HORMOZI_REQUERIDO } from './compatibilityRules';

export function buildPrompt(config) {
  const {
    selectedArea, selectedIndicador, selectedNivel,
    selectedFunnel, selectedRuta, selectedVoz, sector
  } = config;

  const bancos = getAllBancos();
  const bancoArea = bancos[selectedArea];
  const indicador = bancoArea?.indicadores.find(i => i.id === selectedIndicador);
  const nivel = indicador?.niveles[selectedNivel];

  // Extrae solo las acciones del nivel seleccionado
  const accionesDelNivel = nivel?.acciones || [];
  const descripcionNivel = nivel?.descripcion || '';

  const nivelLabel = selectedNivel ? selectedNivel.replace('_', ' → ') : '';
  const hormozi = HORMOZI_REQUERIDO[selectedFunnel] || { over_delivery: false, costo_inaccion: false, garantia: false, urgencia: false };
  const ctaInstructionsMap = {
    'TOFU': 'freemium (WALA lo resuelve gratis. Acción concreta dentro de WALA. Link en mi perfil. Es gratis)',
    'MOFU-A': 'CTA principal: Diagnóstico gratuito + Urgencia. ' +
              'CTA secundario al final: WALA Pro como opción para quien no está listo para la llamada. ' +
              'El diagnóstico siempre va primero. WALA Pro nunca va antes del diagnóstico.',
    'MOFU-B': 'wala_pro (WALA Pro 7 días gratis. Link en mi perfil. Sin compromisos. Diagnóstico gratuito como segunda opción)',
    'BOFU': 'diagnostico_gratuito + garantia + urgencia'
  };
  const ctaInstruccion = ctaInstructionsMap[selectedFunnel] || '';

  const overDeliveryInstruction = hormozi.over_delivery ? `
### INSTRUCCIÓN DE OVER-DELIVERY:
El campo over_delivery.texto es la versión de referencia — 
la idea central, el dato o la revelación que debe impactar.

Dentro del campo guion, en el timestamp indicado, escribe 
una PARÁFRASIS de esa misma idea: misma revelación, 
lenguaje adaptado al flujo narrativo del guion para que 
suene natural en ese momento específico.

Reglas de la paráfrasis:
- Misma revelación o consecuencia central
- Mismo sector y elemento concreto (no generalizar)
- Puede cambiar la estructura de la frase
- No puede diluir el impacto ni hacerla más técnica
- No puede agregar información nueva que no esté en over_delivery.texto

El resultado: dos versiones del mismo golpe. 
Una para el JSON (referencia), una en el guion (producción).
` : '';

  // Construye el contexto del indicador+nivel para el LLM
  const contextoMetodologico = `
## DATOS DEL INDICADOR SELECCIONADO

- **Área**: ${selectedArea} — ${bancoArea?.area || ''}
- **Indicador**: ${selectedIndicador} — ${indicador?.nombre || ''}
- **Nivel del emprendedor**: ${nivelLabel}
- **Descripción de este nivel**: ${descripcionNivel}
- **Sector del emprendedor**: ${sector}

### Acciones disponibles en este nivel (máximo usa 1-2 como referencia para el caso):
${accionesDelNivel.map((a, i) => `${i + 1}. ${a.texto} (${a.frecuencia})`).join('\n')}
`;

  // Instrucción operativa específica para esta combinación
  const instruccionOperativa = `
## INSTRUCCIÓN DE GENERACIÓN

Genera un guion para:
- **Etapa de funnel**: ${selectedFunnel}
- **Ruta maestra**: ${selectedRuta}
- **Voz narrative**: ${selectedVoz}
- **Sector**: ${sector}

### Elementos obligatorios para ${selectedFunnel}:
- Over-delivery: ${hormozi.over_delivery ? 'OBLIGATORIO — regla de oro en el desarrollo. Revisa la instrucción específica abajo.' : 'No requerido'}
- Costo de inacción: ${hormozi.costo_inaccion ? 'OBLIGATORIO — bloque propio de costo' : 'No requerido'}
- Garantía: ${hormozi.garantia ? 'OBLIGATORIO — una frase al final del CTA ("Y si en 2 meses no tienes más claridad sobre tu negocio que hoy, no te cobro. Así de simple.")' : 'NO incluir'}
- Urgencia: ${hormozi.urgencia ? 'OBLIGATORIO — una frase ("Los cupos para este mes son limitados. Si esto resuena con lo que estás viviendo, escríbeme hoy."), después del CTA' : 'NO incluir'}

${overDeliveryInstruction}

### CTA para esta etapa:
${ctaInstruccion}

### Restricciones absolutas:
- NO mencionar precio del programa en el video en ningún momento
- NO mencionar diagnóstico en TOFU
${selectedFunnel === 'BOFU' ? '- Voz B (WALA) está prohibida en BOFU' : ''}
- El sector del emprendedor (${sector}) debe aparecer en el over-delivery

Devuelve el resultado ÚNICAMENTE en el formato JSON definido en la sección 17 del Prompt Maestro.
`;

  return {
    system: getPromptMaestro(),
    context: getRutasMaestras(),
    user: contextoMetodologico + instruccionOperativa
  };
}
