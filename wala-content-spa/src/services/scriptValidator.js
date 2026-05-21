import { HORMOZI_REQUERIDO } from '../utils/compatibilityRules';

export function validateScript(scriptJson, config) {
  const { selectedFunnel, selectedVoz } = config;
  const reqs = HORMOZI_REQUERIDO[selectedFunnel] || { over_delivery: false, costo_inaccion: false, garantia: false, urgencia: false };
  const errors = [];
  const warnings = [];

  // Validaciones duras (bloquean guardado)
  if (reqs.over_delivery && !scriptJson.over_delivery?.presente) {
    errors.push('Over-delivery obligatorio no detectado en el guion');
  }

  if (scriptJson.over_delivery?.presente && scriptJson.over_delivery?.texto) {
    const guion = (scriptJson.guion || '').toLowerCase();
    
    // Toma las primeras palabras clave de la revelación central
    // (no el texto completo — el LLM parafrasea, eso es esperado)
    const overDeliveryTexto = scriptJson.over_delivery.texto.toLowerCase();
    
    // Extrae 3-4 palabras únicas y concretas del over-delivery
    // que sea improbable que aparezcan por casualidad
    const palabrasClave = overDeliveryTexto
      .replace(/[^a-záéíóúñü\s]/gi, '')
      .split(/\s+/)
      .filter(p => p.length > 5)  // ignora artículos y conectores
      .slice(0, 4);
    
    // El guion pasa si al menos 2 de esas palabras clave aparecen
    const coincidencias = palabrasClave.filter(p => guion.includes(p));
    
    if (coincidencias.length < 2) {
      errors.push(
        'El over-delivery no parece estar reflejado en el guion. ' +
        'Debe aparecer como paráfrasis en el desarrollo del video.'
      );
    }
    // Si hay 1 coincidencia, warning suave — no bloquea
    else if (coincidencias.length < 3) {
      warnings.push(
        'El over-delivery está presente pero con poca densidad ' +
        'en el guion. Verificar que la revelación tenga suficiente impacto.'
      );
    }
    // Si hay 3+ coincidencias → pasa sin comentarios
  }
  
  if (reqs.costo_inaccion && !scriptJson.costo_inaccion?.presente) {
    errors.push('Bloque de costo de inacción obligatorio no detectado');
  }
  
  if (reqs.garantia && !scriptJson.hormozi_elementos?.garantia_en_cta) {
    errors.push('Garantía de resultado obligatoria en BOFU no encontrada');
  }
  
  if (reqs.urgencia && !scriptJson.hormozi_elementos?.urgencia_en_cta) {
    errors.push('Urgencia auténtica obligatoria no encontrada');
  }
  
  if (selectedFunnel === 'BOFU' && scriptJson.metadatos?.voz === 'WALA') {
    errors.push('Voz B (WALA) está prohibida en BOFU');
  }
  
  if (selectedFunnel === 'TOFU' && scriptJson.hormozi_elementos?.diagnostico_gratuito_presente) {
    errors.push('El diagnóstico gratuito no puede aparecer en TOFU');
  }
  
  if (['MOFU-A', 'BOFU'].includes(selectedFunnel) && !scriptJson.cta?.menciona_diagnostico) {
    errors.push('El CTA de MOFU-A y BOFU debe mencionar el diagnóstico gratuito');
  }

  // Detecta si WALA Pro aparece antes del diagnóstico en MOFU-A
  if (selectedFunnel === 'MOFU-A') {
    const guion = scriptJson.guion || '';
    const posWalaPro = guion.indexOf('WALA Pro');
    const posDiagnostico = guion.indexOf('diagnóstico gratuito');
    if (posWalaPro !== -1 && posDiagnostico !== -1 && posWalaPro < posDiagnostico) {
      errors.push('En MOFU-A el diagnóstico gratuito debe aparecer antes que WALA Pro');
    }
  }

  // Advertencias (no bloquean pero se muestran)
  if (!scriptJson.resultado_identitario?.capa) {
    warnings.push('No se detectó capa identitaria (miedo/caos/tranquilidad) en el gancho');
  }
  
  if (!scriptJson.metadatos?.sector) {
    warnings.push('El sector del emprendedor no está en los metadatos');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}
