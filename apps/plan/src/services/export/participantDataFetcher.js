import { getRemoteParticipantData } from '@/services/db/firestore';
import {
  getParticipant,
  saveParticipant,
  getBusinessPlanSection,
  saveBusinessPlanSection,
  getCostingModule,
  saveCostingModule,
  getSessionProgress,
  saveSessionProgress
} from '@/services/db/indexedDB';
import { processQueue } from '@/services/sync/syncQueue';
import { SESSION_SECTION_KEYS } from '@/stores/plan';
import { SESSIONS_DATA } from '@/data/sessionsData';
import { useCostingCalculator } from '@/composables/useCostingCalculator';

/**
 * Normaliza y agrega toda la información cualitativa, financiera y de progreso
 * de un participante específico desde Firestore con prioridad de servidor en tiempo real (Online)
 * o IndexedDB (Offline), asegurando que se extraigan las respuestas más recientes.
 *
 * @param {string} dni - DNI del participante
 * @param {Object} [options={}] - Opciones de configuración
 * @param {number} [options.ceiling] - Techo de capital semilla dinámico asignado a la cohorte
 * @param {boolean} [options.forceServer=true] - Forzar consulta directa al servidor de Firestore
 * @returns {Promise<{
 *   participantData: Object,
 *   costingData: Object,
 *   planSections: Object,
 *   sessionProgressList: Array,
 *   unapprovedCount: number,
 *   unapprovedSections: Array
 * }>}
 */
export async function fetchFullParticipantPlanData(dni, options = {}) {
  if (!dni) throw new Error('[participantDataFetcher] DNI es obligatorio.');

  const cleanDni = String(dni).trim();
  const calc = useCostingCalculator();
  let rawData = null;

  // 1. Vaciar la cola de sincronización local antes de consultar Firestore
  // Esto garantiza que cualquier edición reciente en el navegador se despache primero a la nube
  if (typeof navigator !== 'undefined' && navigator.onLine) {
    try {
      await processQueue();
    } catch (syncErr) {
      console.warn('[participantDataFetcher] Advertencia al procesar cola previa:', syncErr);
    }
  }

  // 2. Intentar obtener datos frescos en tiempo real desde Firestore
  if (typeof navigator !== 'undefined' && navigator.onLine) {
    try {
      rawData = await getRemoteParticipantData(cleanDni, { forceServer: options.forceServer !== false });

      // Mantener coherencia local en IndexedDB con la última versión de Firestore
      if (rawData?.costingModule) {
        try {
          await saveCostingModule(rawData.costingModule);
        } catch (e) {
          console.warn('[participantDataFetcher] Error sincronizando costingModule a IndexedDB:', e);
        }
      }
      if (rawData?.participant) {
        try {
          await saveParticipant(rawData.participant);
        } catch (e) {
          console.warn('[participantDataFetcher] Error sincronizando participant a IndexedDB:', e);
        }
      }
    } catch (err) {
      console.warn(`[participantDataFetcher] Falló descarga en vivo para DNI ${cleanDni}. Usando IndexedDB local:`, err);
    }
  }

  // 3. Si no hay datos remotos o estamos offline, hidratar desde IndexedDB
  if (!rawData || !rawData.participant) {
    const localParticipant = await getParticipant(cleanDni);
    const localCosting = await getCostingModule(cleanDni);

    const localSections = [];
    const localProgress = [];

    for (let sId = 1; sId <= 8; sId++) {
      const secKey = SESSION_SECTION_KEYS[sId];
      const secDoc = await getBusinessPlanSection(cleanDni, sId, secKey);
      if (secDoc) {
        localSections.push(secDoc);
      }

      const progDoc = await getSessionProgress(cleanDni, sId);
      if (progDoc) {
        localProgress.push(progDoc);
      }
    }

    rawData = {
      participant: localParticipant,
      costingModule: localCosting,
      planSections: localSections,
      sessionProgress: localProgress
    };
  }

  // 4. Estructurar metadatos del participante
  const participantData = rawData.participant || {
    dni: cleanDni,
    cohortId: 'COHORTE-ACTIVA',
    personalInfo: { firstName: '', lastName: '', phone: '', location: {} },
    businessBasicInfo: { commercialName: '', sector: '', businessNature: 'produccion' }
  };

  const businessNature = participantData.businessBasicInfo?.businessNature || 'produccion';

  // 5. Indexar y consolidar progreso de sesiones
  const sessionProgressList = rawData.sessionProgress || [];
  const progressMap = {};
  for (const prog of sessionProgressList) {
    const sId = Number(prog.sessionId) || deriveSessionIdFromKey(prog.id);
    if (sId) progressMap[sId] = prog;
  }

  // 6. Indexar secciones cualitativas y extraer respuestas de formSubmission.answers
  const sectionsMap = {};
  const bySession = {};

  // Inicializar plantillas vacías para las 8 sesiones
  for (let sId = 1; sId <= 8; sId++) {
    const secKey = SESSION_SECTION_KEYS[sId];
    sectionsMap[secKey] = {
      participantId: cleanDni,
      sessionId: sId,
      sectionKey: secKey,
      fields: {},
      canvasModel: null
    };
    bySession[sId] = sectionsMap[secKey];
  }

  if (Array.isArray(rawData.planSections)) {
    for (const sec of rawData.planSections) {
      const sId = Number(sec.sessionId) || deriveSessionIdFromKey(sec.sectionKey || sec.id);
      const secKey = sec.sectionKey || (sId ? SESSION_SECTION_KEYS[sId] : null);

      if (secKey && sectionsMap[secKey]) {
        sectionsMap[secKey] = {
          ...sectionsMap[secKey],
          ...sec,
          fields: { ...(sectionsMap[secKey].fields || {}), ...(sec.fields || {}) },
          canvasModel: sec.canvasModel || sectionsMap[secKey].canvasModel
        };
        if (sId) {
          bySession[sId] = sectionsMap[secKey];
        }
      }
    }
  }

  // Integración profunda de respuestas en tiempo real desde formSubmission.answers
  for (let sId = 1; sId <= 8; sId++) {
    const secKey = SESSION_SECTION_KEYS[sId];
    const sec = sectionsMap[secKey];
    const sessionMeta = SESSIONS_DATA.find((s) => s.id === sId);
    const prog = progressMap[sId];
    const answers = prog?.formSubmission?.answers || {};

    if (sessionMeta?.formFields) {
      for (const fieldDef of sessionMeta.formFields) {
        const fieldId = fieldDef.id;
        const currentField = sec.fields[fieldId];

        // Verificar si el campo no tiene texto resuelto
        const hasText = currentField && (
          currentField.finalApprovedText ||
          currentField.consultantReview?.finalApprovedText ||
          currentField.aiRefinement?.refinedText ||
          (typeof currentField.aiRefinement === 'string' && currentField.aiRefinement) ||
          currentField.rawInput?.text ||
          (typeof currentField.rawInput === 'string' && currentField.rawInput)
        );

        // Si no tiene texto pero el participante respondió en el formulario, inyectar la respuesta
        if (!hasText && answers[fieldId] !== undefined && String(answers[fieldId]).trim()) {
          sec.fields[fieldId] = {
            fieldLabel: fieldDef.label || fieldId,
            rawInput: {
              text: String(answers[fieldId]).trim(),
              capturedVia: 'form_submission'
            },
            consultantNotes: '',
            aiRefinement: null,
            finalApprovedText: null,
            status: 'pendiente_revision'
          };
        }
      }
    }
  }

  // Fallbacks de enriquecimiento para Sesión 1 (Identidad)
  const s1Sec = sectionsMap['s1_identidad_negocio'];
  if (s1Sec) {
    if (!s1Sec.fields.commercialName && participantData.businessBasicInfo?.commercialName) {
      s1Sec.fields.commercialName = {
        fieldLabel: 'Nombre Comercial',
        rawInput: { text: participantData.businessBasicInfo.commercialName },
        finalApprovedText: participantData.businessBasicInfo.commercialName
      };
    }
    if (!s1Sec.fields.businessStory && participantData.businessBasicInfo?.businessStory) {
      s1Sec.fields.businessStory = {
        fieldLabel: 'Historia del Negocio',
        rawInput: { text: participantData.businessBasicInfo.businessStory }
      };
    }
    if (!s1Sec.fields.businessNature && participantData.businessBasicInfo?.businessNature) {
      s1Sec.fields.businessNature = {
        fieldLabel: 'Naturaleza Operativa',
        rawInput: { text: participantData.businessBasicInfo.businessNature }
      };
    }
    if (!s1Sec.fields.sector && participantData.businessBasicInfo?.sector) {
      s1Sec.fields.sector = {
        fieldLabel: 'Rubro / Sector',
        rawInput: { text: participantData.businessBasicInfo.sector }
      };
    }
    if (!s1Sec.fields.address && (participantData.personalInfo?.location?.address || participantData.personalInfo?.address)) {
      s1Sec.fields.address = {
        fieldLabel: 'Dirección o Punto de Venta',
        rawInput: { text: participantData.personalInfo?.location?.address || participantData.personalInfo?.address }
      };
    }
  }

  // Enriquecimiento para Sesión 5 (Lienzo Canvas)
  const s5Sec = sectionsMap['s5_modelo_negocio_canvas'];
  if (s5Sec) {
    let canvasModel = s5Sec.canvasModel || {};
    const s3Fields = sectionsMap['s3_cliente_propuesta_valor']?.fields || {};
    const s4Fields = sectionsMap['s4_estrategia_comercial']?.fields || {};

    // Si los bloques están vacíos, autocompletar con propuesta de valor, clientes y canales
    if (!canvasModel.valueProposition?.text && s3Fields.valueProposition) {
      const valText = s3Fields.valueProposition.finalApprovedText || s3Fields.valueProposition.aiRefinement?.refinedText || s3Fields.valueProposition.rawInput?.text || '';
      if (valText) {
        canvasModel.valueProposition = { text: valText, status: 'completado' };
      }
    }
    if (!canvasModel.customerSegments?.text && s3Fields.targetCustomer) {
      const custText = s3Fields.targetCustomer.finalApprovedText || s3Fields.targetCustomer.aiRefinement?.refinedText || s3Fields.targetCustomer.rawInput?.text || '';
      if (custText) {
        canvasModel.customerSegments = { text: custText, status: 'completado' };
      }
    }
    if (!canvasModel.channels?.text && s4Fields.placementStrategy) {
      const chanText = s4Fields.placementStrategy.finalApprovedText || s4Fields.placementStrategy.aiRefinement?.refinedText || s4Fields.placementStrategy.rawInput?.text || '';
      if (chanText) {
        canvasModel.channels = { text: chanText, status: 'completado' };
      }
    }
    s5Sec.canvasModel = canvasModel;
  }

  // 7. Recálculo y Normalización Financiera de Costeo (S6) e Inversión (S7)
  const resolvedCeiling = Number(
    options.ceiling ||
    rawData.costingModule?.seedCapitalInvestmentPlan?.seedCapitalCeiling ||
    3000.0
  );

  const rawProducts = Array.isArray(rawData.costingModule?.products) ? rawData.costingModule.products : [];
  const calculatedProducts = rawProducts.map((prod) => {
    const pNature = prod.businessNature || businessNature;
    const salePrice = Number(prod.commercialization?.currentSalePrice || prod.financialSummary?.salePrice || prod.salePrice || 0);
    const monthlyVol = Number(prod.commercialization?.estimatedMonthlySalesVolume || 0);

    if (pNature === 'produccion') {
      const batchSize = Math.max(1, Number(prod.batchConfig?.batchSize || 1));
      const ings = (prod.ingredients || []).map((ing) => {
        const math = calc.computeIngredientMath({
          quantityUsed: ing.recipeConsumption?.quantityUsed,
          packageCost: ing.marketPurchase?.packageCost,
          quantityInPackage: ing.marketPurchase?.quantityInPackage,
          batchSize
        });
        return { ...ing, automatedMath: math };
      });
      const financials = calc.computeProductFinancials({
        ingredients: ings,
        batchSize,
        salePrice,
        estimatedMonthlySalesVolume: monthlyVol
      });
      return {
        ...prod,
        businessNature: 'produccion',
        ingredients: ings,
        financialSummary: financials
      };
    } else if (pNature === 'servicio') {
      const sConf = prod.serviceConfig || {};
      const labor = rawData.costingModule?.serviceLaborSettings || { desiredMonthlySalary: 1200, daysWorkedPerMonth: 25, hoursWorkedPerDay: 8, costPerMinute: 0.10 };
      const costPerMin = labor.costPerMinute || calc.calculateLaborCostPerMinute(labor);
      const financials = calc.computeServiceFinancials({
        durationMinutes: sConf.durationMinutes || 30,
        costPerMinute: costPerMin,
        supplies: sConf.supplies || [],
        salePrice,
        estimatedMonthlySalesVolume: monthlyVol
      });
      return {
        ...prod,
        businessNature: 'servicio',
        serviceConfig: { ...sConf, costPerMinute: costPerMin },
        financialSummary: financials
      };
    } else {
      // comercio
      const cConf = prod.commerceConfig || {};
      const financials = calc.computeCommerceFinancials({
        packagePurchasePrice: cConf.packagePurchasePrice || 0,
        unitsPerPackage: cConf.unitsPerPackage || 1,
        freightExpense: cConf.freightExpense || 0,
        totalItemsInTrip: cConf.totalItemsInTrip || 1,
        packagingCostPerUnit: cConf.packagingCostPerUnit || 0,
        salePrice,
        estimatedMonthlySalesVolume: monthlyVol
      });
      return {
        ...prod,
        businessNature: 'comercio',
        financialSummary: financials
      };
    }
  });

  // Normalizar Presupuesto de Inversión (S7)
  const existingSeedPlan = rawData.costingModule?.seedCapitalInvestmentPlan || {};
  const existingItems = Array.isArray(existingSeedPlan.investmentItems) ? existingSeedPlan.investmentItems : [];

  // Rubro A (Manual)
  const manualItems = existingItems.filter((i) =>
    !i.isLaborContribution &&
    i.rubro !== 'rubro_b' &&
    !i.isAutoDerivedFromS6 &&
    i.category !== 'Insumos y Capital de Trabajo' &&
    i.category !== 'Mano de Obra Propia'
  );

  // Rubro B (Capital de Trabajo derivado de recetas a 1 mes)
  const derivedWorkingCap = calc.getMonthlyWorkingCapitalRequirements({ products: calculatedProducts });
  let workingCapItems = derivedWorkingCap.map((req) => {
    const prev = existingItems.find((i) => i.itemId === req.itemId || (i.productId === req.productId && (i.ingredientId === req.ingredientId || i.supplyId === req.supplyId)));
    const isFinanced = prev ? prev.financedBySeedCapital : true;
    return {
      ...req,
      financedBySeedCapital: isFinanced,
      source: isFinanced ? 'capital_semilla' : 'propio'
    };
  });

  if (workingCapItems.length === 0) {
    workingCapItems = existingItems.filter((i) =>
      i.rubro === 'rubro_b' ||
      (i.isAutoDerivedFromS6 && !i.isLaborContribution) ||
      (!i.rubro && i.category === 'Insumos y Capital de Trabajo')
    );
  }

  // Rubro C (Mano de obra propia fijada como contrapartida)
  const existingLabor = existingItems.find((i) => i.isLaborContribution);
  let laborItems = [];
  if (existingLabor) {
    laborItems = [{ ...existingLabor, financedBySeedCapital: false, source: 'propio' }];
  } else {
    const laborVal = calc.calculateProjectedMonthlyLaborValue({
      businessNature,
      serviceLaborSettings: rawData.costingModule?.serviceLaborSettings,
      products: calculatedProducts
    }) || 1200;

    laborItems = [{
      itemId: 'LABOR-OWN-CONTRIBUTION',
      category: 'Mano de Obra Propia',
      rubro: 'rubro_c',
      description: 'Dedicación y Mano de Obra Propia del Emprendedor (1 Mes)',
      quantity: 1,
      unit: 'mes',
      unitPriceEstimated: laborVal,
      totalPrice: laborVal,
      financedBySeedCapital: false,
      source: 'propio',
      isLaborContribution: true,
      isAutoDerivedFromS6: true,
      priority: 'alta'
    }];
  }

  const allInvestmentItems = [...manualItems, ...workingCapItems, ...laborItems];
  const computedSeed = calc.computeSeedCapitalPlan({
    items: allInvestmentItems,
    ceiling: resolvedCeiling
  });

  const monthlyProductionAndSales = calc.computeMonthlyProductionAndSalesProjection(
    calculatedProducts,
    rawData.costingModule?.serviceLaborSettings
  );

  const workingCapitalMemory = calc.getWorkingCapitalBreakdownMemory({
    products: calculatedProducts,
    serviceLaborSettings: rawData.costingModule?.serviceLaborSettings
  });

  const costingData = {
    currency: 'PEN',
    products: calculatedProducts,
    serviceLaborSettings: rawData.costingModule?.serviceLaborSettings || null,
    monthlyProductionAndSales,
    workingCapitalMemory,
    seedCapitalInvestmentPlan: {
      seedCapitalCeiling: resolvedCeiling,
      totalBusinessInvestment: computedSeed.totalBusinessInvestment,
      allocatedTotal: computedSeed.allocatedSeedCapital,
      allocatedSeedCapital: computedSeed.allocatedSeedCapital,
      ownContribution: computedSeed.ownContribution,
      remainingBudget: computedSeed.remainingBudget,
      isBudgetCompliant: computedSeed.isBudgetCompliant,
      investmentItems: allInvestmentItems,
      rubros: computedSeed.rubros
    }
  };

  // 8. Evaluar estado de aprobación formal por sesión (1 a 8)
  const unapprovedSections = [];

  for (let sId = 1; sId <= 8; sId++) {
    const prog = progressMap[sId];
    const secDoc = bySession[sId];
    const sessionMeta = SESSIONS_DATA.find((s) => s.id === sId);
    const sessionTitle = sessionMeta ? `Sesión ${sId}: ${sessionMeta.title}` : `Sesión ${sId}`;

    let isFullyApproved = false;

    if (prog?.formSubmission?.isApproved || (prog?.state === 'completado' && !prog?.isFlaggedForReview)) {
      isFullyApproved = true;
    } else if (secDoc && secDoc.fields && Object.keys(secDoc.fields).length > 0) {
      const fields = Object.values(secDoc.fields);
      const allFieldsApproved = fields.length > 0 && fields.every(
        (f) => f?.consultantReview?.status === 'aprobado' || f?.status === 'aprobado'
      );
      if (allFieldsApproved) {
        isFullyApproved = true;
      }
    }

    if (!isFullyApproved) {
      unapprovedSections.push({
        sessionId: sId,
        title: sessionTitle,
        state: prog?.state || 'no_iniciada'
      });
    }
  }

  // 9. Guardar la versión enriquecida y fresca en IndexedDB para disponibilidad offline
  try {
    await saveCostingModule(costingData);
    for (let sId = 1; sId <= 8; sId++) {
      const secKey = SESSION_SECTION_KEYS[sId];
      if (sectionsMap[secKey]) {
        await saveBusinessPlanSection(sectionsMap[secKey]);
      }
    }
  } catch (idbErr) {
    console.warn('[participantDataFetcher] Advertencia actualizando IndexedDB:', idbErr);
  }

  return {
    participantData,
    costingData,
    planSections: {
      ...sectionsMap,
      bySession,
      canvas: sectionsMap['s5_modelo_negocio_canvas']?.canvasModel || null
    },
    sessionProgressList,
    unapprovedCount: unapprovedSections.length,
    unapprovedSections
  };
}

function deriveSessionIdFromKey(key) {
  if (!key) return null;
  const match = String(key).match(/s([1-8])/i);
  return match ? Number(match[1]) : null;
}
