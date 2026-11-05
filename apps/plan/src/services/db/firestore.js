import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  getDocFromServer,
  getDocsFromServer,
  collection,
  query,
  where,
  writeBatch,
  onSnapshot
} from 'firebase/firestore';
import { db } from '@/services/firebase';

/**
 * Obtiene un documento priorizando lectura directa del servidor para datos en tiempo real
 */
export async function getDocWithServerPriority(docRef) {
  if (typeof navigator !== 'undefined' && navigator.onLine) {
    try {
      const snap = await getDocFromServer(docRef);
      return snap;
    } catch (err) {
      console.warn('[Firestore] Falló getDocFromServer, recurriendo a getDoc:', err);
    }
  }
  return await getDoc(docRef);
}

/**
 * Ejecuta una consulta priorizando lectura directa del servidor para datos en tiempo real
 */
export async function getDocsWithServerPriority(q) {
  if (typeof navigator !== 'undefined' && navigator.onLine) {
    try {
      const snap = await getDocsFromServer(q);
      return snap;
    } catch (err) {
      console.warn('[Firestore] Falló getDocsFromServer, recurriendo a getDocs:', err);
    }
  }
  return await getDocs(q);
}

/**
 * Helper para eliminar referencias circulares o proxies reactivos de Vue
 */
function toCleanFirestoreData(data) {
  if (!data) return {};
  return JSON.parse(JSON.stringify(data));
}

// ============================================================================
// 1. PARTICIPANTES
// ============================================================================

/**
 * Guarda o actualiza un participante en Firestore (Colección 'participants', doc(dni))
 * @param {string} dni
 * @param {object} data
 */
export async function saveParticipant(dni, data) {
  if (!dni) throw new Error('[Firestore] DNI requerido para saveParticipant');
  const cleanData = toCleanFirestoreData(data);
  const docRef = doc(db, 'participants', String(dni));
  await setDoc(docRef, cleanData, { merge: true });
  return { id: String(dni), ...cleanData };
}

/**
 * Obtiene el documento de un participante por su DNI
 * @param {string} dni
 */
export async function getParticipantDoc(dni) {
  if (!dni) return null;
  const docRef = doc(db, 'participants', String(dni));
  const snap = await getDoc(docRef);
  return snap.exists() ? snap.data() : null;
}

/**
 * Obtiene el documento de un negocio en Wala (businesses/{businessId})
 * @param {string} businessId
 */
export async function getBusinessDoc(businessId) {
  if (!businessId) return null;
  try {
    const docRef = doc(db, 'businesses', String(businessId));
    const snap = await getDoc(docRef);
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  } catch (err) {
    console.warn(`[Firestore] Error al consultar business ${businessId}:`, err);
    return null;
  }
}

/**
 * Busca un participante vinculado a un businessId específico
 * @param {string} businessId
 */
export async function getParticipantByBusinessId(businessId) {
  if (!businessId) return null;
  try {
    const q = query(
      collection(db, 'participants'),
      where('businessId', '==', String(businessId))
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      const docItem = snap.docs[0];
      return { id: docItem.id, ...docItem.data() };
    }
  } catch (err) {
    console.warn(`[Firestore] Error al buscar participante por businessId ${businessId}:`, err);
  }
  return null;
}

// ============================================================================
// 2. PROGRESO DE SESIONES (1 a 8)
// ============================================================================

/**
 * Guarda o actualiza el progreso de una sesión en Firestore
 * Colección 'session_progress', doc(`${dni}_S${sessionId}`)
 * @param {string} dni
 * @param {number|string} sessionId
 * @param {object} data
 */
export async function saveSessionProgress(dni, sessionId, data) {
  if (!dni || sessionId === undefined || sessionId === null) {
    throw new Error('[Firestore] DNI y sessionId requeridos para saveSessionProgress');
  }
  const cleanData = toCleanFirestoreData(data);
  const docId = `${dni}_S${sessionId}`;
  const docRef = doc(db, 'session_progress', docId);
  await setDoc(docRef, cleanData, { merge: true });
  return { id: docId, ...cleanData };
}

/**
 * Obtiene el progreso de una sesión específica
 * @param {string} dni
 * @param {number|string} sessionId
 */
export async function getSessionProgressDoc(dni, sessionId) {
  if (!dni || sessionId === undefined) return null;
  const docId = `${dni}_S${sessionId}`;
  const docRef = doc(db, 'session_progress', docId);
  const snap = await getDoc(docRef);
  return snap.exists() ? snap.data() : null;
}

// ============================================================================
// 3. SECCIONES DEL PLAN DE NEGOCIOS
// ============================================================================

/**
 * Guarda o actualiza una sección del plan de negocios en Firestore
 * Colección 'business_plan_sections', doc(`${dni}_${sectionKey}`)
 * @param {string} dni
 * @param {string} sectionKey
 * @param {object} data
 */
export async function savePlanSection(dni, sectionKey, data) {
  if (!dni || !sectionKey) {
    throw new Error('[Firestore] DNI y sectionKey requeridos para savePlanSection');
  }
  const cleanData = toCleanFirestoreData(data);
  const docId = `${dni}_${sectionKey}`;
  const docRef = doc(db, 'business_plan_sections', docId);
  await setDoc(docRef, cleanData, { merge: true });
  return { id: docId, ...cleanData };
}

/**
 * Obtiene una sección de plan de negocios específica
 * @param {string} dni
 * @param {string} sectionKey
 */
export async function getPlanSectionDoc(dni, sectionKey) {
  if (!dni || !sectionKey) return null;
  const docId = `${dni}_${sectionKey}`;
  const docRef = doc(db, 'business_plan_sections', docId);
  const snap = await getDoc(docRef);
  return snap.exists() ? snap.data() : null;
}

// ============================================================================
// 4. MÓDULO DE COSTEO ("La Casera vs. El Plato")
// ============================================================================

/**
 * Guarda o actualiza el módulo de costeo en Firestore
 * Colección 'costing_module', doc(dni)
 * @param {string} dni
 * @param {object} data
 */
export async function saveCostingModule(dni, data) {
  if (!dni) throw new Error('[Firestore] DNI requerido para saveCostingModule');
  const cleanData = toCleanFirestoreData(data);
  const docRef = doc(db, 'costing_module', String(dni));
  await setDoc(docRef, cleanData, { merge: true });
  return { id: String(dni), ...cleanData };
}

/**
 * Obtiene el módulo de costeo de un participante
 * @param {string} dni
 */
export async function getCostingModuleDoc(dni) {
  if (!dni) return null;
  const docRef = doc(db, 'costing_module', String(dni));
  const snap = await getDoc(docRef);
  return snap.exists() ? snap.data() : null;
}

// ============================================================================
// 5. HIDRATACIÓN CRUZADA / DESCARGA DEL ÁRBOL COMPLETO DEL PARTICIPANTE
// ============================================================================

/**
 * Descarga el árbol documental completo del participante para hidratación cruzada
 * consultando con prioridad de servidor en tiempo real para reflejar las últimas ediciones.
 * @param {string} dni
 * @param {object} [options={}]
 * @param {boolean} [options.forceServer=true]
 * @returns {Promise<{ participant: object|null, sessionProgress: Array, planSections: Array, costingModule: object|null }>}
 */
export async function getRemoteParticipantData(dni, options = { forceServer: true }) {
  if (!dni) throw new Error('[Firestore] DNI requerido para getRemoteParticipantData');
  const cleanedDni = String(dni).trim();

  const CANONICAL_SECTION_KEYS = [
    's1_identidad_negocio',
    's2_planeamiento_estrategico',
    's3_cliente_propuesta_valor',
    's4_estrategia_comercial',
    's5_modelo_negocio_canvas',
    's6_costeo_directo_recetas',
    's7_presupuesto_capital_semilla',
    's8_evaluacion_integral_cierre'
  ];

  try {
    // 1. Participante en vivo desde el servidor
    const partPromise = getDocWithServerPriority(doc(db, 'participants', cleanedDni));

    // 2. Módulo de Costeo en vivo desde el servidor
    const costPromise = getDocWithServerPriority(doc(db, 'costing_module', cleanedDni));

    // 3. Progreso de Sesiones: Query indexada + Lecturas directas por ID canónico (S1..S8)
    const sessionQuery = query(
      collection(db, 'session_progress'),
      where('participantId', '==', cleanedDni)
    );
    const sessionQueryPromise = getDocsWithServerPriority(sessionQuery);

    const directProgressPromises = [];
    for (let sId = 1; sId <= 8; sId++) {
      directProgressPromises.push(getDocWithServerPriority(doc(db, 'session_progress', `${cleanedDni}_S${sId}`)));
      directProgressPromises.push(getDocWithServerPriority(doc(db, 'session_progress', `${cleanedDni}_${sId}`)));
    }

    // 4. Secciones del Plan: Query indexada + Lecturas directas por ID canónico y claves cortas
    const planQuery = query(
      collection(db, 'business_plan_sections'),
      where('participantId', '==', cleanedDni)
    );
    const planQueryPromise = getDocsWithServerPriority(planQuery);

    const directPlanPromises = [];
    for (let sId = 1; sId <= 8; sId++) {
      const secKey = CANONICAL_SECTION_KEYS[sId - 1];
      directPlanPromises.push(getDocWithServerPriority(doc(db, 'business_plan_sections', `${cleanedDni}_${secKey}`)));
      directPlanPromises.push(getDocWithServerPriority(doc(db, 'business_plan_sections', `${cleanedDni}_s${sId}`)));
      directPlanPromises.push(getDocWithServerPriority(doc(db, 'business_plan_sections', `${cleanedDni}_session_${sId}`)));
    }

    // Ejecución paralela masiva y ultra rápida
    const [partSnap, costSnap, sessionQuerySnap, planQuerySnap, ...restSnaps] = await Promise.all([
      partPromise,
      costPromise,
      sessionQueryPromise,
      planQueryPromise,
      ...directProgressPromises,
      ...directPlanPromises
    ]);

    const participant = partSnap.exists() ? partSnap.data() : null;
    const costingModule = costSnap.exists() ? costSnap.data() : null;

    // A. Consolidar progreso de sesiones sin duplicados
    const progressMap = new Map();
    sessionQuerySnap.forEach((docItem) => {
      progressMap.set(docItem.id, { id: docItem.id, ...docItem.data() });
    });

    const directProgSnaps = restSnaps.slice(0, directProgressPromises.length);
    for (const snap of directProgSnaps) {
      if (snap.exists() && !progressMap.has(snap.id)) {
        progressMap.set(snap.id, { id: snap.id, ...snap.data() });
      }
    }
    const sessionProgress = Array.from(progressMap.values());

    // B. Consolidar secciones del plan de negocios sin duplicados
    const planMap = new Map();
    planQuerySnap.forEach((docItem) => {
      planMap.set(docItem.id, { id: docItem.id, ...docItem.data() });
    });

    const directPlanSnaps = restSnaps.slice(directProgressPromises.length);
    for (const snap of directPlanSnaps) {
      if (snap.exists() && !planMap.has(snap.id)) {
        planMap.set(snap.id, { id: snap.id, ...snap.data() });
      }
    }
    const planSections = Array.from(planMap.values());

    return {
      participant,
      sessionProgress,
      planSections,
      costingModule
    };
  } catch (err) {
    console.error(`[Firestore] Error al descargar árbol remoto en vivo para DNI ${cleanedDni}:`, err);
    throw err;
  }
}

// ============================================================================
// 6. FACILITADOR, COHORTES Y SUPERVISIÓN EN TIEMPO REAL
// ============================================================================

/**
 * Escucha en tiempo real la lista de participantes de una cohorte
 * @param {string} cohortId
 * @param {Function} onUpdate
 * @param {Function} onError
 * @returns {Function} Unsubscribe function
 */
export function listenCohortParticipants(cohortId, onUpdate, onError) {
  if (!cohortId) return () => { };
  const q = query(
    collection(db, 'participants'),
    where('cohortId', '==', cohortId)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const participants = [];
      snapshot.forEach((docSnap) => {
        participants.push({ id: docSnap.id, ...docSnap.data() });
      });
      onUpdate(participants);
    },
    (err) => {
      console.error(`[Firestore] Error escuchando participantes de cohorte ${cohortId}:`, err);
      if (onError) onError(err);
    }
  );
}

/**
 * Escucha en tiempo real el progreso de sesiones de una cohorte
 * @param {string} cohortId
 * @param {Function} onUpdate
 * @param {Function} onError
 * @returns {Function} Unsubscribe function
 */
export function listenCohortSessionProgress(cohortId, onUpdate, onError) {
  if (!cohortId) return () => { };
  const q = query(
    collection(db, 'session_progress'),
    where('cohortId', '==', cohortId)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const progressList = [];
      snapshot.forEach((docSnap) => {
        progressList.push({ id: docSnap.id, ...docSnap.data() });
      });
      onUpdate(progressList);
    },
    (err) => {
      console.error(`[Firestore] Error escuchando progresos de cohorte ${cohortId}:`, err);
      if (onError) onError(err);
    }
  );
}

/**
 * Escucha en tiempo real las secciones del plan de un participante específico (Plan-Seed Firestore Listener)
 * @param {string} dni
 * @param {Function} onUpdate
 * @param {Function} onError
 * @returns {Function} Unsubscribe function
 */
export function listenParticipantPlanSections(dni, onUpdate, onError) {
  if (!dni) return () => { };
  const cleanedDni = String(dni).trim();
  const q = query(
    collection(db, 'business_plan_sections'),
    where('participantId', '==', cleanedDni)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const sections = [];
      snapshot.forEach((docSnap) => {
        sections.push({ id: docSnap.id, ...docSnap.data() });
      });
      onUpdate(sections);
    },
    (err) => {
      console.warn(`[Firestore] Error escuchando secciones de plan para participante ${cleanedDni}:`, err);
      if (onError) onError(err);
    }
  );
}

/**
 * Escucha en tiempo real el progreso de sesiones de un participante específico
 * @param {string} dni
 * @param {Function} onUpdate
 * @param {Function} onError
 * @returns {Function} Unsubscribe function
 */
export function listenParticipantSessionProgress(dni, onUpdate, onError) {
  if (!dni) return () => { };
  const cleanedDni = String(dni).trim();
  const q = query(
    collection(db, 'session_progress'),
    where('participantId', '==', cleanedDni)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const progressList = [];
      snapshot.forEach((docSnap) => {
        progressList.push({ id: docSnap.id, ...docSnap.data() });
      });
      onUpdate(progressList);
    },
    (err) => {
      console.warn(`[Firestore] Error escuchando progresos de participante ${cleanedDni}:`, err);
      if (onError) onError(err);
    }
  );
}

/**
 * Escucha en tiempo real el módulo de costeo e inversión de un participante específico (Sesión 6 y 7)
 * @param {string} dni
 * @param {Function} onUpdate
 * @param {Function} onError
 * @returns {Function} Unsubscribe function
 */
export function listenParticipantCostingModule(dni, onUpdate, onError) {
  if (!dni) return () => { };
  const cleanedDni = String(dni).trim();
  const docRef = doc(db, 'costing_module', cleanedDni);

  return onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        onUpdate({ id: snapshot.id, ...snapshot.data() });
      } else {
        onUpdate(null);
      }
    },
    (err) => {
      console.warn(`[Firestore] Error escuchando módulo de costeo para participante ${cleanedDni}:`, err);
      if (onError) onError(err);
    }
  );
}


/**
 * Crea o inicializa los registros para un participante nuevo (participante + 8 sesiones)
 * @param {object} raw
 * @param {string} cohortId
 * @returns {{ participantDoc: object, sessionDocs: Array }}
 */
export function buildParticipantAndSessionsData(raw, cohortId) {
  const dni = String(raw.dni || '').trim();
  const now = new Date().toISOString();

  const participantDoc = {
    dni,
    documentType: dni.length === 8 && /^\d+$/.test(dni) ? 'DNI' : 'Cédula',
    cohortId,
    organizationId: raw.organizationId || 'ONG-LOCAL',
    personalInfo: {
      firstName: raw.nombres || raw.firstName || '',
      lastName: raw.apellidos || raw.lastName || '',
      phone: raw.telefono || raw.phone || '',
      gender: raw.gender || '',
      location: {
        department: raw.departamento || '',
        province: raw.provincia || '',
        district: raw.distrito || '',
        address: raw.direccion || ''
      }
    },
    businessBasicInfo: {
      commercialName: raw.nombre_negocio || raw.commercialName || `Emprendimiento de ${raw.nombres || dni}`,
      businessNature: raw.naturaleza || raw.businessNature || 'produccion',
      sector: raw.rubro || raw.sector || 'General',
      subSector: raw.subSector || '',
      operatingStatus: raw.operatingStatus || 'idea',
      monthsInOperation: Number(raw.monthsInOperation) || 0
    },
    programStatus: {
      currentSession: 1,
      overallProgressPercentage: 0,
      isFlaggedForReview: false,
      status: 'activo'
    },
    syncMetadata: {
      createdAt: now,
      updatedAt: now,
      lastSyncAt: now,
      localSyncStatus: 'synced'
    }
  };

  const sessionDocs = [];
  for (let i = 1; i <= 8; i++) {
    sessionDocs.push({
      docId: `${dni}_S${i}`,
      data: {
        participantId: dni,
        cohortId,
        sessionId: i,
        sessionCode: `S${i}`,
        state: i === 1 ? 'en_progreso' : 'bloqueado',
        gatekeeping: {
          microlearningCompleted: false,
          microlearningCompletedAt: null,
          quizUnlocked: false,
          formUnlocked: false
        },
        quizAssessment: {
          passed: false,
          maxAttemptsAllowed: null,
          totalAttempts: 0,
          bestScore: 0,
          lastAttemptAt: null,
          attemptsHistory: []
        },
        formSubmission: {
          isCompleted: false,
          submittedAt: null,
          isApproved: false
        },
        syncMetadata: {
          createdAt: now,
          updatedAt: now
        }
      }
    });
  }

  return { participantDoc, sessionDocs };
}

/**
 * Guarda en lote una lista de participantes con sus 8 sesiones en Firestore
 * Gestiona automáticamente particiones de 50 participantes (450 operaciones) por batch
 * @param {Array} rawList
 * @param {string} cohortId
 * @returns {Promise<{ total: number, batchesCount: number }>}
 */
export async function batchSaveParticipants(rawList, cohortId) {
  if (!Array.isArray(rawList) || rawList.length === 0) {
    return { total: 0, batchesCount: 0 };
  }

  const CHUNK_SIZE = 50; // 50 participantes * 9 docs = 450 ops (límite firestore es 500)
  let batchesCount = 0;

  for (let i = 0; i < rawList.length; i += CHUNK_SIZE) {
    const chunk = rawList.slice(i, i + CHUNK_SIZE);
    const batch = writeBatch(db);

    for (const rawItem of chunk) {
      const { participantDoc, sessionDocs } = buildParticipantAndSessionsData(rawItem, cohortId);
      const partRef = doc(db, 'participants', participantDoc.dni);
      batch.set(partRef, toCleanFirestoreData(participantDoc), { merge: true });

      for (const sDoc of sessionDocs) {
        const sRef = doc(db, 'session_progress', sDoc.docId);
        batch.set(sRef, toCleanFirestoreData(sDoc.data), { merge: true });
      }
    }

    await batch.commit();
    batchesCount++;
  }

  return { total: rawList.length, batchesCount };
}

/**
 * Registra manualmente un participante individual con sus 8 sesiones
 * @param {object} raw
 * @param {string} cohortId
 */
export async function createSingleParticipant(raw, cohortId) {
  const { participantDoc, sessionDocs } = buildParticipantAndSessionsData(raw, cohortId);
  const batch = writeBatch(db);

  const partRef = doc(db, 'participants', participantDoc.dni);
  batch.set(partRef, toCleanFirestoreData(participantDoc), { merge: true });

  for (const sDoc of sessionDocs) {
    const sRef = doc(db, 'session_progress', sDoc.docId);
    batch.set(sRef, toCleanFirestoreData(sDoc.data), { merge: true });
  }

  await batch.commit();
  return participantDoc;
}

/**
 * Guarda la revisión técnica de los campos de una sesión por parte del consultor.
 * Soporta tanto guardar borrador (isApproved: false) como aprobación final (isApproved: true).
 *
 * @param {string} dni - DNI del participante
 * @param {number} sessionId - ID de la sesión (1..8)
 * @param {string} sectionKey - Clave de la sección (ej. 's2_planeamiento_estrategico')
 * @param {Array<Object>} fields - Lista de campos a guardar
 * @param {string} reviewerEmail - Email o identificador del consultor
 * @param {boolean} [isApproved=false] - Si es true, marca 'aprobado' y completa la sesión
 */
export async function savePlanSectionReview(dni, sessionId, sectionKey, fields = [], reviewerEmail = '', isApproved = false) {
  const cleanedDni = String(dni).trim();
  const now = new Date().toISOString();

  const secDocId = `${cleanedDni}_${sectionKey}`;
  const secRef = doc(db, 'business_plan_sections', secDocId);
  const existingSec = await getDoc(secRef);

  let secData = existingSec.exists() ? existingSec.data() : {
    participantId: cleanedDni,
    sessionId: Number(sessionId),
    sectionKey,
    fields: {}
  };

  secData.participantId = cleanedDni;
  secData.sessionId = Number(sessionId);
  secData.sectionKey = sectionKey;

  if (!secData.fields) secData.fields = {};

  for (const f of fields) {
    const fieldId = f.fieldId || f.id;
    if (!fieldId) continue;

    const existingField = secData.fields[fieldId] || {};
    const rawVal = f.rawInput !== undefined ? f.rawInput : (existingField.rawInput?.text || existingField.rawInput || '');
    const notesVal = f.consultantNotes !== undefined ? f.consultantNotes : (existingField.consultantNotes || existingField.consultantReview?.feedbackNotes || '');
    const aiVal = f.aiRefinement !== undefined ? f.aiRefinement : (existingField.aiRefinement?.refinedText || existingField.aiRefinement || '');
    const approvedVal = f.finalApprovedText !== undefined ? f.finalApprovedText : (existingField.consultantReview?.finalApprovedText || existingField.finalApprovedText || '');

    const fieldStatus = isApproved ? 'aprobado' : 'pendiente_revision';

    secData.fields[fieldId] = {
      fieldLabel: f.label || existingField.fieldLabel || fieldId,
      rawInput: {
        text: String(rawVal),
        capturedVia: existingField.rawInput?.capturedVia || 'text',
        createdAt: existingField.rawInput?.createdAt || now
      },
      consultantNotes: String(notesVal),
      aiRefinement: aiVal ? {
        model: typeof aiVal === 'object' ? (aiVal.model || 'gemini-3.6-flash') : 'gemini-3.6-flash',
        refinedText: typeof aiVal === 'object' ? (aiVal.refinedText || '') : String(aiVal),
        generatedAt: existingField.aiRefinement?.generatedAt || now
      } : (existingField.aiRefinement || null),
      status: fieldStatus,
      finalApprovedText: String(approvedVal),
      consultantReview: {
        status: fieldStatus,
        finalApprovedText: String(approvedVal),
        feedbackNotes: String(notesVal),
        reviewedBy: reviewerEmail || 'facilitador',
        reviewedAt: now
      }
    };
  }

  secData.updatedAt = now;
  await setDoc(secRef, toCleanFirestoreData(secData), { merge: true });

  // Actualizar session_progress
  const sessDocId = `${cleanedDni}_S${sessionId}`;
  const sessRef = doc(db, 'session_progress', sessDocId);

  if (isApproved) {
    await setDoc(
      sessRef,
      toCleanFirestoreData({
        state: 'completado',
        formSubmission: {
          isCompleted: true,
          submittedAt: now,
          isApproved: true,
          approvedBy: reviewerEmail || 'facilitador',
          approvedAt: now
        },
        syncMetadata: {
          updatedAt: now
        }
      }),
      { merge: true }
    );
  } else {
    // Si es borrador, mantener como pendiente_revision
    await setDoc(
      sessRef,
      toCleanFirestoreData({
        state: 'pendiente_revision',
        formSubmission: {
          isCompleted: true,
          isApproved: false
        },
        syncMetadata: {
          updatedAt: now
        }
      }),
      { merge: true }
    );
  }

  return { success: true };
}

/**
 * Aprueba una sección del plan de negocios y actualiza el semáforo a completado
 * @param {string} dni
 * @param {number} sessionId
 * @param {string} sectionKey
 * @param {string} fieldKey
 * @param {string} approvedText
 * @param {string} reviewerEmail
 */
export async function approvePlanSectionAndSession(dni, sessionId, sectionKey, fieldKey, approvedText, reviewerEmail) {
  return savePlanSectionReview(
    dni,
    sessionId,
    sectionKey,
    [{ fieldId: fieldKey, finalApprovedText: approvedText, status: 'aprobado' }],
    reviewerEmail,
    true
  );
}

// ============================================================================
// 7. GESTIÓN DE COHORTES Y TECHO DE CAPITAL SEMILLA
// ============================================================================

/**
 * Guarda o actualiza la configuración de una cohorte en Firestore
 * Colección 'cohorts', doc(cohortId)
 * @param {string} cohortId - Identificador único de la cohorte (ej. 'OIT-CHICLAYO-01')
 * @param {object} cohortData - Datos de la cohorte ({ name, seedCapitalCeiling, ... })
 */
export async function saveCohortDoc(cohortId, cohortData = {}) {
  if (!cohortId) throw new Error('[Firestore] cohortId requerido para saveCohortDoc');
  const cleanId = String(cohortId).trim().toUpperCase();
  const now = new Date().toISOString();

  const cleanData = toCleanFirestoreData({
    ...cohortData,
    cohortId: cleanId,
    name: cohortData.name || cleanId,
    seedCapitalCeiling: Number(cohortData.seedCapitalCeiling) || 3000.0,
    updatedAt: now,
    createdAt: cohortData.createdAt || now
  });

  const docRef = doc(db, 'cohorts', cleanId);
  await setDoc(docRef, cleanData, { merge: true });
  return cleanData;
}

/**
 * Obtiene los datos de configuración de una cohorte por su ID
 * @param {string} cohortId
 */
export async function getCohortDoc(cohortId) {
  if (!cohortId) return null;
  const cleanId = String(cohortId).trim().toUpperCase();
  const docRef = doc(db, 'cohorts', cleanId);
  const snap = await getDoc(docRef);
  return snap.exists() ? snap.data() : null;
}

/**
 * Escucha en tiempo real los cambios de una cohorte específica (incluyendo su techo de capital semilla)
 * @param {string} cohortId
 * @param {Function} onUpdate
 * @param {Function} onError
 * @returns {Function} Unsubscribe function
 */
export function listenCohortDoc(cohortId, onUpdate, onError) {
  if (!cohortId) return () => {};
  const cleanId = String(cohortId).trim().toUpperCase();
  const docRef = doc(db, 'cohorts', cleanId);

  return onSnapshot(
    docRef,
    (snap) => {
      if (snap.exists()) {
        onUpdate({ id: snap.id, ...snap.data() });
      } else {
        onUpdate(null);
      }
    },
    (err) => {
      console.error(`[Firestore] Error escuchando cohorte ${cleanId}:`, err);
      if (onError) onError(err);
    }
  );
}

/**
 * Obtiene todos los documentos de la colección 'cohorts'
 */
export async function getAllCohortsDocs() {
  const colRef = collection(db, 'cohorts');
  const snap = await getDocs(colRef);
  const list = [];
  snap.forEach((d) => list.push({ id: d.id, ...d.data() }));
  return list;
}

/**
 * Escucha en tiempo real todas las cohortes registradas en Firestore
 * @param {Function} onUpdate
 * @param {Function} onError
 * @returns {Function} Unsubscribe function
 */
export function listenAllCohorts(onUpdate, onError) {
  const colRef = collection(db, 'cohorts');
  return onSnapshot(
    colRef,
    (snap) => {
      const list = [];
      snap.forEach((d) => list.push({ id: d.id, ...d.data() }));
      onUpdate(list);
    },
    (err) => {
      console.error('[Firestore] Error escuchando todas las cohortes:', err);
      if (onError) onError(err);
    }
  );
}

/**
 * Transfiere un participante de una cohorte a otra en Firestore de forma atómica
 * con trazabilidad completa en participantDoc.cohortHistory y en la colección 'cohort_transfers'.
 *
 * @param {object} params
 * @param {string} params.dni - DNI o cédula del participante
 * @param {string} params.fromCohortId - Cohorte de origen
 * @param {string} params.toCohortId - Cohorte de destino
 * @param {string} params.reason - Motivo de la transferencia
 * @param {string} [params.notes=''] - Notas adicionales del facilitador
 * @param {object} params.facilitatorUser - Usuario facilitador responsable ({ email, displayName, uid })
 * @param {number} [params.previousCeiling=3000] - Techo anterior de capital semilla
 * @param {number} [params.newCeiling=3000] - Nuevo techo de capital semilla
 * @param {number} [params.currentSession=1] - Sesión actual
 * @param {number} [params.completedSessionsCount=0] - Cantidad de sesiones aprobadas
 * @returns {Promise<object>} Registro de transferencia generado
 */
export async function transferParticipantCohortFirestore({
  dni,
  fromCohortId,
  toCohortId,
  reason,
  notes = '',
  facilitatorUser = {},
  previousCeiling = 3000,
  newCeiling = 3000,
  currentSession = 1,
  completedSessionsCount = 0
}) {
  const cleanedDni = String(dni).trim();
  const cleanFrom = String(fromCohortId || '').trim().toUpperCase();
  const cleanTo = String(toCohortId || '').trim().toUpperCase();
  const now = new Date().toISOString();
  const transferId = `trf_${Date.now()}_${cleanedDni}`;

  if (!cleanedDni) throw new Error('[Firestore] DNI es obligatorio para transferir participante');
  if (!cleanTo) throw new Error('[Firestore] Cohorte destino es obligatoria');
  if (cleanFrom === cleanTo) throw new Error('[Firestore] La cohorte destino no puede ser idéntica a la actual');

  const transferRecord = {
    transferId,
    participantId: cleanedDni,
    fromCohortId: cleanFrom,
    toCohortId: cleanTo,
    transferredAt: now,
    transferredBy: {
      email: facilitatorUser?.email || 'facilitador@planseed.org',
      displayName: facilitatorUser?.displayName || 'Facilitador',
      uid: facilitatorUser?.uid || 'facilitador-uid'
    },
    reason: String(reason || 'Reasignación de cohorte').trim(),
    notes: String(notes || '').trim(),
    previousCeiling: Number(previousCeiling) || 3000,
    newCeiling: Number(newCeiling) || 3000,
    currentSession: Number(currentSession) || 1,
    completedSessionsCount: Number(completedSessionsCount) || 0
  };

  const batch = writeBatch(db);

  // 1. Obtener documento del participante para preservar su historial previo
  const partRef = doc(db, 'participants', cleanedDni);
  const partSnap = await getDoc(partRef);
  let existingHistory = [];
  let participantName = '';
  let commercialName = '';

  if (partSnap.exists()) {
    const pData = partSnap.data();
    existingHistory = Array.isArray(pData.cohortHistory) ? pData.cohortHistory : [];
    participantName = `${pData.personalInfo?.firstName || ''} ${pData.personalInfo?.lastName || ''}`.trim() || cleanedDni;
    commercialName = pData.businessBasicInfo?.commercialName || '';
  }

  const updatedHistory = [...existingHistory, transferRecord];

  // Actualizar documento del participante
  batch.set(
    partRef,
    toCleanFirestoreData({
      cohortId: cleanTo,
      cohortHistory: updatedHistory,
      syncMetadata: {
        updatedAt: now,
        lastSyncAt: now,
        localSyncStatus: 'synced'
      }
    }),
    { merge: true }
  );

  // 2. Actualizar cohortId en las 8 sesiones de progreso
  for (let s = 1; s <= 8; s++) {
    const sRef = doc(db, 'session_progress', `${cleanedDni}_S${s}`);
    batch.set(
      sRef,
      toCleanFirestoreData({
        cohortId: cleanTo,
        'syncMetadata.updatedAt': now
      }),
      { merge: true }
    );
  }

  // 3. Registrar evento en la colección centralizada de auditoría 'cohort_transfers'
  const auditRef = doc(db, 'cohort_transfers', transferId);
  batch.set(
    auditRef,
    toCleanFirestoreData({
      ...transferRecord,
      participantName,
      commercialName
    })
  );

  // 4. Si existe módulo de costeo en Firestore, actualizar el techo de capital semilla
  const costRef = doc(db, 'costing_module', cleanedDni);
  const costSnap = await getDoc(costRef);
  if (costSnap.exists()) {
    const costData = costSnap.data();
    if (costData?.seedCapitalInvestmentPlan) {
      batch.set(
        costRef,
        toCleanFirestoreData({
          seedCapitalInvestmentPlan: {
            ...costData.seedCapitalInvestmentPlan,
            seedCapitalCeiling: Number(newCeiling) || 3000
          }
        }),
        { merge: true }
      );
    }
  }

  await batch.commit();
  return { ...transferRecord, participantName, commercialName };
}

/**
 * Elimina atómicamente un participante y todos sus registros asociados
 * (sesiones, costeo, secciones de plan) de Firestore con trazabilidad de auditoría.
 *
 * @param {object} params
 * @param {string} params.dni - DNI del participante
 * @param {string} params.cohortId - ID de la cohorte
 * @param {string} [params.participantName=''] - Nombre del participante
 * @param {string} [params.commercialName=''] - Nombre comercial
 * @param {object} [params.facilitatorUser=null] - Usuario facilitador
 * @returns {Promise<object>}
 */
export async function deleteParticipantFirestore({
  dni,
  cohortId,
  participantName = '',
  commercialName = '',
  facilitatorUser = null
}) {
  const cleanedDni = String(dni).trim();
  if (!cleanedDni) throw new Error('DNI del participante es requerido para eliminar');

  const now = new Date().toISOString();
  const batch = writeBatch(db);

  // 1. Eliminar documento del participante
  const partRef = doc(db, 'participants', cleanedDni);
  batch.delete(partRef);

  // 2. Eliminar las 8 sesiones de progreso
  for (let s = 1; s <= 8; s++) {
    const sRef = doc(db, 'session_progress', `${cleanedDni}_S${s}`);
    batch.delete(sRef);
  }

  // 3. Eliminar módulo de costeo
  const costRef = doc(db, 'costing_module', cleanedDni);
  batch.delete(costRef);

  // 4. Eliminar secciones del plan de negocios
  const sectionKeys = [
    's1_identidad',
    's2_planeamiento_estrategico',
    's3_propuesta_valor',
    's4_estrategia_comercial',
    's5_modelo_canvas',
    's6_costeo_fijacion_precios',
    's7_plan_inversion_financiamiento',
    's8_resumen_ejecutivo'
  ];
  for (const secKey of sectionKeys) {
    const secRef = doc(db, 'business_plan_sections', `${cleanedDni}_${secKey}`);
    batch.delete(secRef);
  }

  // 5. Registrar evento de auditoría en 'cohort_deletions'
  const deletionId = `del_${Date.now()}_${cleanedDni}`;
  const auditRef = doc(db, 'cohort_deletions', deletionId);
  batch.set(
    auditRef,
    toCleanFirestoreData({
      deletionId,
      participantId: cleanedDni,
      cohortId: String(cohortId || '').trim().toUpperCase(),
      participantName,
      commercialName,
      deletedAt: now,
      deletedBy: {
        email: facilitatorUser?.email || 'facilitador@planseed.org',
        displayName: facilitatorUser?.displayName || 'Facilitador',
        uid: facilitatorUser?.uid || 'unknown'
      }
    })
  );

  await batch.commit();
  return { deletionId, participantId: cleanedDni, deletedAt: now };
}


