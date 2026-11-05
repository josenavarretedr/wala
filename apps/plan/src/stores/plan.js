import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import {
  getBusinessPlanSection,
  saveBusinessPlanSection
} from '@/services/db/indexedDB';
import {
  getPlanSectionDoc,
  listenParticipantPlanSections
} from '@/services/db/firestore';
import { enqueueMutation } from '@/services/sync/syncQueue';
import { useSessionStore } from './sessions';

/**
 * Mapa canónico de claves de sección para el plan de negocios
 */
export const SESSION_SECTION_KEYS = {
  1: 's1_identidad_negocio',
  2: 's2_planeamiento_estrategico',
  3: 's3_cliente_propuesta_valor',
  4: 's4_estrategia_comercial',
  5: 's5_modelo_negocio_canvas',
  6: 's6_costeo_directo_recetas',
  7: 's7_presupuesto_capital_semilla',
  8: 's8_evaluacion_integral_cierre'
};

/**
 * Definición exhaustiva de los 9 bloques estándar del Lienzo Canvas
 * con preguntas detonantes cotidianas, tips de campo y origen de precarga.
 */
export const CANVAS_BLOCK_DEFINITIONS = {
  valueProposition: {
    key: 'valueProposition',
    title: 'Propuesta de Valor',
    group: 'oferta',
    icon: '💎',
    triggerQuestion: '¿Qué hace que tu producto o servicio sea especial y por qué te eligen a ti antes que a la competencia?',
    tip: 'Destaca tu sabor único, rapidez de entrega, empaque ecológico o atención personalizada.',
    placeholder: 'Ej: Elaboramos hamburguesas caseras con panes horneados del día y salsas exclusivas a precio accesible para el bolsillo de nuestros vecinos.',
    sourceSession: 'Sesión 3',
    sourceField: 'valueProposition',
    badgeText: 'Oferta Central'
  },
  customerSegments: {
    key: 'customerSegments',
    title: 'Segmento de Clientes',
    group: 'mercado',
    icon: '👥',
    triggerQuestion: '¿Quiénes son las personas o negocios que pagan por tus productos y qué características tienen?',
    tip: 'Describe su edad, hábitos, si trabajan cerca o si son familias de la zona.',
    placeholder: 'Ej: Trabajadores y comerciantes del mercado local entre 20 y 50 años que disponen de 30 minutos para almorzar rico y rendidor.',
    sourceSession: 'Sesión 3',
    sourceField: 'targetCustomer',
    badgeText: 'Clientes Objetivo'
  },
  channels: {
    key: 'channels',
    title: 'Canales de Venta y Entrega',
    group: 'mercado',
    icon: '🛵',
    triggerQuestion: '¿A través de qué medios conocen tus ofertas, realizan los pedidos y reciben el producto?',
    tip: 'Punto físico de venta, pedidos diarios por WhatsApp, ferias o reparto en bicicleta/moto.',
    placeholder: 'Ej: Puesto en el mercado de 8am a 4pm, catálogo de productos por estados de WhatsApp y entregas a domicilio en moto.',
    sourceSession: 'Sesión 4',
    sourceField: 'placementStrategy',
    badgeText: 'Plaza y Entrega'
  },
  customerRelationships: {
    key: 'customerRelationships',
    title: 'Relación con los Clientes',
    group: 'mercado',
    icon: '🤝',
    triggerQuestion: '¿Cómo tratas y cuidas a tus clientes para que regresen y recomienden tu emprendimiento?',
    tip: 'Trato cordial, yapa o degustaciones, atención rápida de quejas o mensajes de agradecimiento.',
    placeholder: 'Ej: Trato cálido y familiar llamándolos por su nombre, respuesta inmediata por chat y promociones de "cliente frecuente".',
    sourceSession: null,
    sourceField: null,
    badgeText: 'Fidelización'
  },
  keyActivities: {
    key: 'keyActivities',
    title: 'Actividades Clave',
    group: 'operaciones',
    icon: '⚡',
    triggerQuestion: '¿Cuáles son las tareas indispensables que realizas a diario para que tu negocio funcione?',
    tip: 'Compras tempranas de insumos, preparación, estándares de higiene, despacho y cobranza.',
    placeholder: 'Ej: Compra diaria de carne y verduras frescas en el mayorista, preparación higiénica de alimentos, empaquetado y atención de pedidos.',
    sourceSession: null,
    sourceField: null,
    badgeText: 'Operación Diaria'
  },
  keyResources: {
    key: 'keyResources',
    title: 'Recursos Clave',
    group: 'operaciones',
    icon: '🍳',
    triggerQuestion: '¿Qué máquinas, herramientas, instalaciones y conocimientos son vitales para producir?',
    tip: 'Equipos indispensables, recetas familiares, local o puesto, teléfono inteligente para pedidos.',
    placeholder: 'Ej: Plancha freidora a gas de tres quemadores, mesa de trabajo en acero, congeladora para insumos y recetario artesanal propio.',
    sourceSession: null,
    sourceField: null,
    badgeText: 'Activos y Equipos'
  },
  keyPartners: {
    key: 'keyPartners',
    title: 'Socios y Aliados Clave',
    group: 'operaciones',
    icon: '🏢',
    triggerQuestion: '¿Quiénes son tus proveedores de confianza, aliados barriales o familiares que apoyan tu negocio?',
    tip: 'Proveedores que te dan crédito o buen precio, negocios amigos que te recomiendan o apoyo familiar.',
    placeholder: 'Ej: Casera de verduras que me da precio por mayor, la panadería del barrio con entregas fijas y familiares que ayudan en el despacho.',
    sourceSession: null,
    sourceField: null,
    badgeText: 'Aliados Estratégicos'
  },
  costStructure: {
    key: 'costStructure',
    title: 'Estructura de Costos',
    group: 'finanzas',
    icon: '📉',
    triggerQuestion: '¿En qué conceptos gastas la mayor parte de tu dinero para poder operar cada semana o mes?',
    tip: 'Insumos de recetas, compras por mayor, fletes, tiempo de servicio, descartables, gas o alquiler.',
    placeholder: 'Ej: Producción (insumos frescos, gas, empaques), Servicios (descartables, frascos/tintes, tiempo) o Comercio (compra por bulto, pasajes/flete y bolsas).',
    sourceSession: null,
    sourceField: null,
    badgeText: 'Costos Principales'
  },
  revenueStreams: {
    key: 'revenueStreams',
    title: 'Fuentes de Ingresos',
    group: 'finanzas',
    icon: '💰',
    triggerQuestion: '¿Por qué productos específicos te pagan tus clientes y qué medios de pago utilizas?',
    tip: 'Ventas de productos y combos, cobros en efectivo, billeteras digitales (Yape/Plin) o transferencias.',
    placeholder: 'Ej: Venta de hamburguesas individuales y combos con papas y bebidas. Cobros en efectivo y billeteras digitales (Yape y Plin).',
    sourceSession: null,
    sourceField: null,
    badgeText: 'Ingresos y Cobranza'
  }
};

/**
 * Las 4 áreas temáticas del Canvas adaptadas para interacción en acordeón móvil
 */
export const CANVAS_THEMATIC_GROUPS = [
  {
    id: 'oferta',
    name: 'Oferta',
    subtitle: 'El corazón de tu propuesta',
    icon: '💎',
    badgeClass: 'bg-purple-100 text-purple-800 border-purple-200',
    borderClass: 'border-purple-500',
    headerBgClass: 'bg-purple-50/80 hover:bg-purple-100/60',
    accentTextClass: 'text-purple-700',
    dotClass: 'bg-purple-500',
    blockKeys: ['valueProposition']
  },
  {
    id: 'mercado',
    name: 'Mercado',
    subtitle: 'Tus clientes, canales y atención',
    icon: '👥',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    borderClass: 'border-emerald-500',
    headerBgClass: 'bg-emerald-50/80 hover:bg-emerald-100/60',
    accentTextClass: 'text-emerald-700',
    dotClass: 'bg-emerald-500',
    blockKeys: ['customerSegments', 'channels', 'customerRelationships']
  },
  {
    id: 'operaciones',
    name: 'Operaciones',
    subtitle: 'Tareas diarias, equipos y aliados',
    icon: '⚙️',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
    borderClass: 'border-amber-500',
    headerBgClass: 'bg-amber-50/80 hover:bg-amber-100/60',
    accentTextClass: 'text-amber-700',
    dotClass: 'bg-amber-500',
    blockKeys: ['keyActivities', 'keyResources', 'keyPartners']
  },
  {
    id: 'finanzas',
    name: 'Finanzas',
    subtitle: 'Estructura de costos e ingresos',
    icon: '💳',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-200',
    borderClass: 'border-blue-500',
    headerBgClass: 'bg-blue-50/80 hover:bg-blue-100/60',
    accentTextClass: 'text-blue-700',
    dotClass: 'bg-blue-500',
    blockKeys: ['costStructure', 'revenueStreams']
  }
];

const INITIAL_CANVAS_STATE = () => ({
  valueProposition: { text: '', isAutoFilled: false, status: 'vacio' },
  customerSegments: { text: '', isAutoFilled: false, status: 'vacio' },
  channels: { text: '', isAutoFilled: false, status: 'vacio' },
  customerRelationships: { text: '', isAutoFilled: false, status: 'vacio' },
  keyActivities: { text: '', isAutoFilled: false, status: 'vacio' },
  keyResources: { text: '', isAutoFilled: false, status: 'vacio' },
  keyPartners: { text: '', isAutoFilled: false, status: 'vacio' },
  costStructure: { text: '', isAutoFilled: false, status: 'vacio' },
  revenueStreams: { text: '', isAutoFilled: false, status: 'vacio' }
});

export const usePlanStore = defineStore('plan', () => {
  const canvas = ref(INITIAL_CANVAS_STATE());
  const dualFields = ref({});
  const isLoading = ref(false);
  const isSaving = ref(false);
  const isLoaded = ref(false);
  const lastSavedAt = ref(null);

  // Computed: validación por bloque individual (mínimo 15 caracteres)
  function isBlockComplete(blockKey) {
    const text = canvas.value[blockKey]?.text || '';
    return text.trim().length >= 15;
  }

  // Computed: cantidad de bloques completados
  const completedBlocksCount = computed(() => {
    let count = 0;
    for (const key of Object.keys(CANVAS_BLOCK_DEFINITIONS)) {
      if (isBlockComplete(key)) count++;
    }
    return count;
  });

  const totalBlocksCount = 9;

  // Computed: todo el Canvas está completo
  const allBlocksComplete = computed(() => completedBlocksCount.value === totalBlocksCount);

  // Porcentaje de avance del Canvas
  const progressPercentage = computed(() => {
    return Math.round((completedBlocksCount.value / totalBlocksCount) * 100);
  });

  // Estadísticas por grupo temático
  const groupStats = computed(() => {
    const stats = {};
    for (const group of CANVAS_THEMATIC_GROUPS) {
      let completedInGroup = 0;
      for (const blockKey of group.blockKeys) {
        if (isBlockComplete(blockKey)) completedInGroup++;
      }
      stats[group.id] = {
        total: group.blockKeys.length,
        completed: completedInGroup,
        isGroupComplete: completedInGroup === group.blockKeys.length
      };
    }
    return stats;
  });

  /**
   * Carga los datos del Canvas desde IndexedDB y ejecuta la precarga inteligente
   * desde las Sesiones 3 y 4 en caso de campos vacíos.
   */
  async function loadCanvas(participantId) {
    if (!participantId) return;
    isLoading.value = true;

    try {
      // 1. Obtener registro previo de la Sesión 5 en IndexedDB
      const existingRecord = await getBusinessPlanSection(participantId, 5, 's5_modelo_negocio_canvas');
      const state = INITIAL_CANVAS_STATE();

      if (existingRecord?.canvasModel) {
        for (const key of Object.keys(state)) {
          if (existingRecord.canvasModel[key]) {
            state[key] = {
              text: existingRecord.canvasModel[key].text || '',
              isAutoFilled: !!existingRecord.canvasModel[key].isAutoFilled,
              status: (existingRecord.canvasModel[key].text || '').trim().length >= 15 ? 'completado' : 'vacio'
            };
          }
        }
      }

      // 2. Lógica de Precarga Inteligente (Evitar doble digitación)
      // Cargar datos previos de Sesión 3 y Sesión 4
      const sessionStore = useSessionStore();
      const s3Section = await getBusinessPlanSection(participantId, 3, 's3_cliente_propuesta_valor');
      const s4Section = await getBusinessPlanSection(participantId, 4, 's4_estrategia_comercial');

      const s3Answers = sessionStore.getFormAnswers(3) || {};
      const s4Answers = sessionStore.getFormAnswers(4) || {};

      // A) Propuesta de Valor (desde Sesión 3: valueProposition)
      if (!state.valueProposition.text.trim()) {
        const s3Val = s3Section?.fields?.valueProposition?.rawInput?.text || s3Answers.valueProposition || '';
        if (s3Val.trim()) {
          state.valueProposition.text = s3Val.trim();
          state.valueProposition.isAutoFilled = true;
          state.valueProposition.status = s3Val.trim().length >= 15 ? 'completado' : 'vacio';
        }
      }

      // B) Segmento de Clientes (desde Sesión 3: targetCustomer)
      if (!state.customerSegments.text.trim()) {
        const s3Cust = s3Section?.fields?.targetCustomer?.rawInput?.text || s3Answers.targetCustomer || '';
        if (s3Cust.trim()) {
          state.customerSegments.text = s3Cust.trim();
          state.customerSegments.isAutoFilled = true;
          state.customerSegments.status = s3Cust.trim().length >= 15 ? 'completado' : 'vacio';
        }
      }

      // C) Canales (desde Sesión 4: placementStrategy)
      if (!state.channels.text.trim()) {
        const s4Chan = s4Section?.fields?.placementStrategy?.rawInput?.text || s4Answers.placementStrategy || '';
        if (s4Chan.trim()) {
          state.channels.text = s4Chan.trim();
          state.channels.isAutoFilled = true;
          state.channels.status = s4Chan.trim().length >= 15 ? 'completado' : 'vacio';
        }
      }

      canvas.value = state;
      isLoaded.value = true;

      // Guardar el estado inicial hidratado en IndexedDB de forma transparente
      await saveCanvas(participantId, false);
    } catch (err) {
      console.error('[PlanStore] Error al cargar Canvas:', err);
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Actualiza el texto de un bloque y persiste inmediatamente en IndexedDB
   */
  async function updateBlock(participantId, blockKey, text) {
    if (!canvas.value[blockKey]) return;

    const trimmed = String(text || '');
    canvas.value[blockKey].text = trimmed;
    canvas.value[blockKey].isAutoFilled = false; // El usuario editó activamente
    canvas.value[blockKey].status = trimmed.trim().length >= 15 ? 'completado' : 'vacio';

    await saveCanvas(participantId);
  }

  /**
   * Confirma la información precargada con un solo toque
   */
  async function confirmAutoFill(participantId, blockKey) {
    if (!canvas.value[blockKey]) return;
    canvas.value[blockKey].isAutoFilled = false;
    await saveCanvas(participantId);
  }

  /**
   * Persiste el Canvas en IndexedDB y encola sincronización
   */
  async function saveCanvas(participantId, enqueue = true) {
    if (!participantId) return;
    isSaving.value = true;

    try {
      const now = new Date().toISOString();
      lastSavedAt.value = now;

      // Formato dual-state compatible con el sistema de trazabilidad IA y consultoría
      const formattedFields = {};
      const cleanCanvasModel = {};

      for (const [key, blockDef] of Object.entries(CANVAS_BLOCK_DEFINITIONS)) {
        const block = canvas.value[key] || { text: '', isAutoFilled: false, status: 'vacio' };
        cleanCanvasModel[key] = {
          title: blockDef.title,
          group: blockDef.group,
          text: block.text,
          isAutoFilled: !!block.isAutoFilled,
          status: block.text.trim().length >= 15 ? 'completado' : 'vacio'
        };

        formattedFields[key] = {
          fieldLabel: blockDef.title,
          rawInput: {
            text: block.text,
            capturedVia: 'canvas_touch',
            isAutoFilled: !!block.isAutoFilled,
            createdAt: now
          },
          aiRefinement: null,
          consultantReview: {
            status: 'pendiente_revision',
            finalApprovedText: null,
            reviewedBy: null,
            reviewedAt: null,
            feedbackNotes: null
          }
        };
      }

      const sectionRecord = {
        participantId: String(participantId),
        sessionId: 5,
        sectionKey: 's5_modelo_negocio_canvas',
        canvasModel: cleanCanvasModel,
        fields: formattedFields,
        updatedAt: now
      };

      await saveBusinessPlanSection(sectionRecord);

      if (enqueue) {
        await enqueueMutation({
          collection: 'business_plan_sections',
          docId: `${participantId}_s5_modelo_negocio_canvas`,
          action: 'SET',
          payload: sectionRecord
        });
      }
    } catch (err) {
      console.error('[PlanStore] Error al guardar Canvas:', err);
    } finally {
      isSaving.value = false;
    }
  }

  /**
   * Valida que los 9 bloques cumplan con >= 15 caracteres y envía la sesión
   * para desbloquear la Sesión 6 vía Gatekeeping pedagógico
   */
  async function submitCanvas(participantId) {
    if (!participantId) return { success: false, message: 'Identificación de participante requerida.' };

    // Validar los 9 bloques estrictamente (> 15 caracteres por bloque)
    const incompleteKeys = Object.keys(CANVAS_BLOCK_DEFINITIONS).filter((k) => !isBlockComplete(k));
    if (incompleteKeys.length > 0) {
      return {
        success: false,
        incompleteKeys,
        message: `Faltan ${incompleteKeys.length} bloques por completar con al menos 15 caracteres.`
      };
    }

    // Persistir el Canvas
    await saveCanvas(participantId, true);

    // Enviar a través de useSessionStore para aplicar gatekeeping y desbloquear Sesión 6
    const sessionStore = useSessionStore();
    const flatAnswers = {};
    for (const key of Object.keys(CANVAS_BLOCK_DEFINITIONS)) {
      flatAnswers[key] = canvas.value[key].text;
    }

    const result = await sessionStore.submitFormSection(participantId, 5, flatAnswers);
    return result;
  }

  /**
   * Obtiene el objeto dual estructurado para un campo específico
   */
  function getDualField(sessionId, fieldKey) {
    const key = `${sessionId}_${fieldKey}`;
    return dualFields.value[key] || {
      rawInput: '',
      consultantNotes: '',
      aiRefinement: '',
      finalApprovedText: '',
      status: 'borrador'
    };
  }

  // Desuscriptor de listener en tiempo real de secciones de plan del participante
  let unsubParticipantPlan = null;
  const activePlanListenerDni = ref(null);

  function deriveSessionIdFromKey(key) {
    if (!key) return null;
    const match = String(key).match(/s([1-8])/i);
    return match ? Number(match[1]) : null;
  }

  /**
   * Carga una sección cualitativa completa desde IndexedDB y la refresca desde Firestore si hay conexión
   */
  async function loadQualitativeSection(participantId, sessionId, sectionKey) {
    if (!participantId) return;

    // 1. Carga inmediata desde IndexedDB (Offline-First)
    try {
      let record = await getBusinessPlanSection(participantId, sessionId, sectionKey);
      if (!record) {
        // Fallback por si existía con clave corta previa (ej: s2)
        record = await getBusinessPlanSection(participantId, sessionId, `s${sessionId}`);
      }
      if (record?.fields) {
        for (const [key, fieldObj] of Object.entries(record.fields)) {
          dualFields.value[`${sessionId}_${key}`] = {
            rawInput: fieldObj.rawInput?.text || (typeof fieldObj.rawInput === 'string' ? fieldObj.rawInput : ''),
            consultantNotes: fieldObj.consultantNotes || fieldObj.consultantReview?.feedbackNotes || '',
            aiRefinement: fieldObj.aiRefinement?.refinedText || (typeof fieldObj.aiRefinement === 'string' ? fieldObj.aiRefinement : ''),
            finalApprovedText: fieldObj.consultantReview?.finalApprovedText || fieldObj.finalApprovedText || '',
            status: fieldObj.consultantReview?.status || fieldObj.status || 'borrador'
          };
        }
      }
    } catch (err) {
      console.warn(`[PlanStore] Error leyendo sección local ${sectionKey}:`, err);
    }

    // 2. Si hay conexión a internet, consultar Firestore en segundo plano
    if (typeof navigator !== 'undefined' && navigator.onLine) {
      try {
        let remoteDoc = await getPlanSectionDoc(participantId, sectionKey);
        if (!remoteDoc) {
          remoteDoc = await getPlanSectionDoc(participantId, `s${sessionId}`);
        }
        if (remoteDoc?.fields) {
          await saveBusinessPlanSection({
            ...remoteDoc,
            participantId: String(participantId),
            sessionId: Number(sessionId),
            sectionKey
          });

          for (const [key, fieldObj] of Object.entries(remoteDoc.fields)) {
            dualFields.value[`${sessionId}_${key}`] = {
              rawInput: fieldObj.rawInput?.text || (typeof fieldObj.rawInput === 'string' ? fieldObj.rawInput : ''),
              consultantNotes: fieldObj.consultantNotes || fieldObj.consultantReview?.feedbackNotes || '',
              aiRefinement: fieldObj.aiRefinement?.refinedText || (typeof fieldObj.aiRefinement === 'string' ? fieldObj.aiRefinement : ''),
              finalApprovedText: fieldObj.consultantReview?.finalApprovedText || fieldObj.finalApprovedText || '',
              status: fieldObj.consultantReview?.status || fieldObj.status || 'borrador'
            };
          }
        }
      } catch (remoteErr) {
        console.warn(`[PlanStore] No se pudo refrescar sección remota ${sectionKey}:`, remoteErr);
      }
    }
  }

  /**
   * Inicia escucha en tiempo real de las secciones del plan del participante en Firestore
   */
  function startParticipantPlanListener(dni) {
    if (!dni || activePlanListenerDni.value === dni) return;
    if (unsubParticipantPlan) {
      unsubParticipantPlan();
      unsubParticipantPlan = null;
    }

    activePlanListenerDni.value = dni;

    unsubParticipantPlan = listenParticipantPlanSections(
      dni,
      async (sections) => {
        for (const sec of sections) {
          const sId = Number(sec.sessionId) || deriveSessionIdFromKey(sec.sectionKey);
          if (!sId || !sec.fields) continue;

          await saveBusinessPlanSection({
            ...sec,
            participantId: String(dni),
            sessionId: sId,
            sectionKey: sec.sectionKey
          });

          for (const [key, fieldObj] of Object.entries(sec.fields)) {
            dualFields.value[`${sId}_${key}`] = {
              rawInput: fieldObj.rawInput?.text || (typeof fieldObj.rawInput === 'string' ? fieldObj.rawInput : ''),
              consultantNotes: fieldObj.consultantNotes || fieldObj.consultantReview?.feedbackNotes || '',
              aiRefinement: fieldObj.aiRefinement?.refinedText || (typeof fieldObj.aiRefinement === 'string' ? fieldObj.aiRefinement : ''),
              finalApprovedText: fieldObj.consultantReview?.finalApprovedText || fieldObj.finalApprovedText || '',
              status: fieldObj.consultantReview?.status || fieldObj.status || 'borrador'
            };
          }
        }
      },
      (err) => {
        console.warn('[PlanStore] Error en listener en tiempo real de plan:', err);
      }
    );
  }

  function stopParticipantPlanListener() {
    if (unsubParticipantPlan) {
      unsubParticipantPlan();
      unsubParticipantPlan = null;
    }
    activePlanListenerDni.value = null;
  }

  /**
   * Persiste el objeto estructurado dual en Pinia, IndexedDB y encola sincronización
   */
  async function saveDualField(participantId, sessionId, sectionKey, fieldKey, dualData, fieldLabel = '') {
    if (!participantId) return;

    const cacheKey = `${sessionId}_${fieldKey}`;
    dualFields.value[cacheKey] = {
      rawInput: dualData.rawInput ?? '',
      consultantNotes: dualData.consultantNotes ?? '',
      aiRefinement: dualData.aiRefinement ?? '',
      finalApprovedText: dualData.finalApprovedText ?? '',
      status: dualData.status || 'borrador'
    };

    try {
      const now = new Date().toISOString();
      let record = await getBusinessPlanSection(participantId, sessionId, sectionKey);

      if (!record) {
        record = {
          participantId: String(participantId),
          sessionId: Number(sessionId),
          sectionKey: String(sectionKey),
          fields: {},
          updatedAt: now
        };
      }

      if (!record.fields) {
        record.fields = {};
      }

      const existingField = record.fields[fieldKey] || {};

      record.fields[fieldKey] = {
        fieldLabel: fieldLabel || existingField.fieldLabel || fieldKey,
        rawInput: {
          text: String(dualData.rawInput ?? existingField.rawInput?.text ?? ''),
          capturedVia: 'text',
          createdAt: existingField.rawInput?.createdAt || now
        },
        consultantNotes: String(dualData.consultantNotes ?? existingField.consultantNotes ?? ''),
        aiRefinement: dualData.aiRefinement
          ? {
            model: 'gemini-3.6-flash',
            refinedText: String(dualData.aiRefinement),
            generatedAt: existingField.aiRefinement?.generatedAt || now
          }
          : existingField.aiRefinement || null,
        consultantReview: {
          status: dualData.status || existingField.consultantReview?.status || 'borrador',
          finalApprovedText: dualData.finalApprovedText ?? existingField.consultantReview?.finalApprovedText ?? null,
          reviewedBy: existingField.consultantReview?.reviewedBy || null,
          reviewedAt: existingField.consultantReview?.reviewedAt || null,
          feedbackNotes: dualData.consultantNotes ?? existingField.consultantReview?.feedbackNotes ?? null
        }
      };

      record.updatedAt = now;
      await saveBusinessPlanSection(record);

      await enqueueMutation({
        collection: 'business_plan_sections',
        docId: `${participantId}_${sectionKey}`,
        action: 'SET',
        payload: record
      });
    } catch (err) {
      console.error(`[PlanStore] Error al guardar campo dual ${fieldKey}:`, err);
    }
  }

  return {
    canvas,
    dualFields,
    isLoading,
    isSaving,
    isLoaded,
    lastSavedAt,
    totalBlocksCount,
    completedBlocksCount,
    allBlocksComplete,
    progressPercentage,
    groupStats,
    isBlockComplete,
    loadCanvas,
    updateBlock,
    confirmAutoFill,
    saveCanvas,
    submitCanvas,
    getDualField,
    loadQualitativeSection,
    saveDualField,
    startParticipantPlanListener,
    stopParticipantPlanListener,
    SESSION_SECTION_KEYS
  };
});
