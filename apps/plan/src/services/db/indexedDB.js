import { openDB } from 'idb';

const DB_NAME = 'emprendeapp_db';
const DB_VERSION = 1;

let dbPromise = null;

export async function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion, newVersion, transaction) {
        // 1. Participantes (KeyPath: dni)
        if (!db.objectStoreNames.contains('participants')) {
          const participantStore = db.createObjectStore('participants', { keyPath: 'dni' });
          participantStore.createIndex('cohortId', 'cohortId', { unique: false });
        }

        // 2. Progreso de Sesiones (KeyPath: id = `${participantId}_${sessionId}`)
        if (!db.objectStoreNames.contains('session_progress')) {
          const sessionStore = db.createObjectStore('session_progress', { keyPath: 'id' });
          sessionStore.createIndex('participantId', 'participantId', { unique: false });
          sessionStore.createIndex('sessionId', 'sessionId', { unique: false });
        }

        // 3. Secciones del Plan de Negocios (KeyPath: id = `${participantId}_${sessionId}_${sectionKey}`)
        if (!db.objectStoreNames.contains('business_plan_sections')) {
          const planStore = db.createObjectStore('business_plan_sections', { keyPath: 'id' });
          planStore.createIndex('participantId', 'participantId', { unique: false });
          planStore.createIndex('sessionId', 'sessionId', { unique: false });
        }

        // 4. Módulo de Costeo (KeyPath: participantId)
        if (!db.objectStoreNames.contains('costing_module')) {
          db.createObjectStore('costing_module', { keyPath: 'participantId' });
        }

        // 5. Cola de Sincronización Offline (KeyPath: id autoincremental)
        if (!db.objectStoreNames.contains('sync_queue')) {
          const syncStore = db.createObjectStore('sync_queue', { keyPath: 'id', autoIncrement: true });
          syncStore.createIndex('status', 'status', { unique: false });
          syncStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      }
    });
  }
  return dbPromise;
}

// Helper para eliminar Proxies reactivos de Vue y garantizar clonado seguro en IndexedDB
function toCleanObject(obj) {
  if (!obj) return obj;
  return JSON.parse(JSON.stringify(obj));
}

// --- MÉTODOS DE PARTICIPANTES ---

export async function getParticipant(dni) {
  const db = await getDB();
  return db.get('participants', String(dni));
}

export async function saveParticipant(participant) {
  const db = await getDB();
  const clean = toCleanObject(participant);
  const item = {
    ...clean,
    dni: String(clean.dni),
    syncMetadata: {
      ...clean.syncMetadata,
      updatedAt: new Date().toISOString()
    }
  };
  await db.put('participants', item);
  return item;
}

export async function getAllParticipants() {
  const db = await getDB();
  return db.getAll('participants');
}

/**
 * Transfiere localmente un participante de cohorte en IndexedDB
 * Actualiza el registro del participante y sus 8 sesiones en el almacén local
 * @param {string} dni
 * @param {string} toCohortId
 * @param {object} transferRecord
 */
export async function transferParticipantCohortLocal(dni, toCohortId, transferRecord) {
  const db = await getDB();
  const cleanedDni = String(dni).trim();
  const cleanTo = String(toCohortId).trim().toUpperCase();

  // 1. Actualizar participante
  const currentPart = await db.get('participants', cleanedDni);
  if (currentPart) {
    const existingHistory = Array.isArray(currentPart.cohortHistory) ? currentPart.cohortHistory : [];
    const updatedHistory = [...existingHistory, transferRecord];
    currentPart.cohortId = cleanTo;
    currentPart.cohortHistory = updatedHistory;
    if (currentPart.syncMetadata) {
      currentPart.syncMetadata.updatedAt = new Date().toISOString();
    }
    await db.put('participants', currentPart);
  }

  // 2. Actualizar las 8 sesiones de progreso
  for (let s = 1; s <= 8; s++) {
    const id = `${cleanedDni}_${s}`;
    const prog = await db.get('session_progress', id);
    if (prog) {
      prog.cohortId = cleanTo;
      if (prog.syncMetadata) {
        prog.syncMetadata.updatedAt = new Date().toISOString();
      }
      await db.put('session_progress', prog);
    }
  }
}

/**
 * Elimina un participante y todos sus registros locales en IndexedDB
 * (participante, 8 sesiones, costeo, secciones de plan de negocios)
 * @param {string} dni
 */
export async function deleteParticipantLocal(dni) {
  const db = await getDB();
  const cleanedDni = String(dni).trim();

  // 1. Eliminar de 'participants'
  await db.delete('participants', cleanedDni);

  // 2. Eliminar de 'session_progress' (1 a 8)
  for (let s = 1; s <= 8; s++) {
    await db.delete('session_progress', `${cleanedDni}_${s}`);
  }

  // 3. Eliminar de 'costing_module'
  await db.delete('costing_module', cleanedDni);

  // 4. Eliminar de 'business_plan_sections'
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
  for (let s = 1; s <= 8; s++) {
    const secKey = sectionKeys[s - 1];
    await db.delete('business_plan_sections', `${cleanedDni}_${s}_${secKey}`);
  }
}


// --- MÉTODOS DE PROGRESO DE SESIONES ---

export async function getSessionProgress(participantId, sessionId) {
  const db = await getDB();
  const id = `${participantId}_${sessionId}`;
  return db.get('session_progress', id);
}

export async function saveSessionProgress(progress) {
  const db = await getDB();
  const clean = toCleanObject(progress);
  const id = `${clean.participantId}_${clean.sessionId}`;
  const record = { ...clean, id };
  await db.put('session_progress', record);
  return record;
}

// --- MÉTODOS DE PLAN DE NEGOCIOS ---

export async function getBusinessPlanSection(participantId, sessionId, sectionKey) {
  const db = await getDB();
  const id = `${participantId}_${sessionId}_${sectionKey}`;
  return db.get('business_plan_sections', id);
}

export async function saveBusinessPlanSection(section) {
  const db = await getDB();
  const clean = toCleanObject(section);
  const id = `${clean.participantId}_${clean.sessionId}_${clean.sectionKey}`;
  const record = { ...clean, id };
  await db.put('business_plan_sections', record);
  return record;
}

// --- MÉTODOS DE COSTEO ---

export async function getCostingModule(participantId) {
  const db = await getDB();
  return db.get('costing_module', String(participantId));
}

export async function saveCostingModule(costingData) {
  const db = await getDB();
  const clean = toCleanObject(costingData);
  await db.put('costing_module', clean);
  return clean;
}

// --- COLA DE SINCRONIZACIÓN OFFLINE (FIFO) ---

export async function enqueueSyncItem({ collection, docId, action = 'SET', payload }) {
  const db = await getDB();
  const cleanPayload = toCleanObject(payload);
  const entry = {
    collection,
    docId: String(docId),
    action: action || 'SET',
    payload: cleanPayload,
    timestamp: new Date().toISOString(),
    attempts: 0,
    status: 'pending' // 'pending' | 'syncing' | 'failed'
  };
  const id = await db.add('sync_queue', entry);
  return { ...entry, id };
}

export async function getPendingSyncQueue() {
  const db = await getDB();
  const allItems = await db.getAll('sync_queue');
  // Filtrar ítems que necesitan procesamiento y ordenar FIFO por ID ascendente / timestamp
  return allItems
    .filter((item) => item.status === 'pending' || item.status === 'syncing' || item.status === 'failed')
    .sort((a, b) => {
      if (a.id && b.id) return a.id - b.id;
      return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    });
}

export async function removeSyncItem(id) {
  const db = await getDB();
  await db.delete('sync_queue', id);
}

export async function updateSyncQueueItem(id, updates = {}) {
  const db = await getDB();
  const item = await db.get('sync_queue', id);
  if (item) {
    const updated = {
      ...item,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    await db.put('sync_queue', updated);
    return updated;
  }
  return null;
}

export async function countPendingSyncItems() {
  const db = await getDB();
  const items = await db.getAll('sync_queue');
  return items.filter((i) => i.status === 'pending' || i.status === 'syncing' || i.status === 'failed').length;
}

// Métodos de compatibilidad previa
export async function enqueueSync({ collection, action, payload }) {
  const docId = payload?.id || payload?.dni || payload?.participantId || `doc_${Date.now()}`;
  return enqueueSyncItem({ collection, docId, action, payload });
}

export async function getPendingSyncItems() {
  return getPendingSyncQueue();
}

export async function updateSyncItemStatus(id, status, errorMessage = null) {
  return updateSyncQueueItem(id, {
    status,
    ...(errorMessage ? { error: errorMessage } : {}),
    processedAt: new Date().toISOString()
  });
}

// --- SEED DE DATOS DE PRUEBA (Chiclayo Cohorte 2026 de docs/schema.json) ---

export async function seedInitialData() {
  const db = await getDB();
  const count = await db.count('participants');
  
  if (count === 0) {
    const demoParticipant = {
      dni: "45892134",
      documentType: "DNI",
      cohortId: "COHORTE-2026-CHICLAYO-01",
      organizationId: "ONG-MEDIOS-DE-VIDA-NORTE",
      personalInfo: {
        firstName: "María",
        lastName: "Flores Pérez",
        phone: "+51987654321",
        gender: "Femenino",
        location: {
          department: "Lambayeque",
          province: "Chiclayo",
          district: "José Leonardo Ortiz",
          address: "Av. México 450"
        }
      },
      businessBasicInfo: {
        commercialName: "Sabor Criollo de María",
        sector: "Gastronomía",
        subSector: "Comida rápida / Hamburguesas",
        operatingStatus: "en_marcha",
        monthsInOperation: 8
      },
      programStatus: {
        currentSession: 6,
        overallProgressPercentage: 75.0,
        isFlaggedForReview: false,
        status: "activo"
      },
      syncMetadata: {
        createdAt: "2026-09-01T08:30:00Z",
        updatedAt: "2026-09-11T12:45:00Z",
        lastSyncAt: "2026-09-11T12:50:00Z",
        localSyncStatus: "synced"
      }
    };

    await db.put('participants', demoParticipant);
    console.info('[IndexedDB] Datos semilla iniciales cargados con éxito para demostración.');
  }
}
