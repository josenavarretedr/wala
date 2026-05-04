/**
 * Composable: useComercial
 * CRUD exclusivo sobre la colección top-level `comercial`.
 * Sin dependencias de businesses/, users/ ni subcollections.
 *
 * Estructura de colección:
 *   comercial/settings     → docType: 'settings'  (configuración, metas, campañas)
 *   comercial/{recordId}   → docType: 'record'    (registros operativos)
 */

import { db } from '@/firebaseInit'
import {
  doc,
  collection,
  getDoc,
  setDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore'
import { METAS_SEMANALES_DEFAULT, DEFAULT_ZONAS, DEFAULT_SECTORES, WHATSAPP_TEMPLATES } from '@/constants/commerceConstants'

const COLLECTION = 'comercial'
const SETTINGS_DOC_ID = 'settings'

// ─────────────────────────────────────────────────────────────
// SETTINGS
// ─────────────────────────────────────────────────────────────

/**
 * Carga la configuración global desde comercial/settings.
 * Si el documento no existe, retorna los defaults.
 * @returns {Promise<Object>} settings
 */
export async function fetchSettings() {
  const ref = doc(db, COLLECTION, SETTINGS_DOC_ID)
  const snap = await getDoc(ref)
  if (!snap.exists()) {
    return {
      docType: 'settings',
      activeZones: [...DEFAULT_ZONAS],
      activeSectors: [...DEFAULT_SECTORES],
      metasSemanales: { ...METAS_SEMANALES_DEFAULT },
      whatsappTemplates: { ...WHATSAPP_TEMPLATES },
      campanas: [],
      cohortes: []
    }
  }
  return { id: snap.id, ...snap.data() }
}

/**
 * Guarda (merge) la configuración en comercial/settings.
 * @param {Object} data  Campos a actualizar (se hace merge)
 */
export async function saveSettings(data) {
  const ref = doc(db, COLLECTION, SETTINGS_DOC_ID)
  await setDoc(
    ref,
    {
      docType: 'settings',
      ...data,
      updatedAt: serverTimestamp()
    },
    { merge: true }
  )
}

// ─────────────────────────────────────────────────────────────
// RECORDS
// ─────────────────────────────────────────────────────────────

/**
 * Carga todos los registros operativos (docType === 'record').
 * Filtros opcionales aplicados en Firestore (requieren índice compuesto si combinados).
 * @param {Object} [filters]
 * @param {string} [filters.statusPipeline]
 * @param {string} [filters.zona]
 * @param {string} [filters.cohorte]
 * @returns {Promise<Object[]>} records
 */
export async function fetchRecords(filters = {}) {
  const ref = collection(db, COLLECTION)
  const constraints = [where('docType', '==', 'record'), orderBy('fechaEvento', 'desc')]

  if (filters.statusPipeline) {
    constraints.splice(1, 0, where('statusPipeline', '==', filters.statusPipeline))
  }
  if (filters.zona) {
    constraints.splice(1, 0, where('zona', '==', filters.zona))
  }
  if (filters.cohorte) {
    constraints.splice(1, 0, where('cohorte', '==', filters.cohorte))
  }

  const q = query(ref, ...constraints)
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

/**
 * Crea un nuevo registro operativo en comercial/{auto-id}.
 * @param {Object} data  Campos del record (sin docType ni timestamps)
 * @returns {Promise<string>} recordId
 */
export async function createRecord(data) {
  const ref = collection(db, COLLECTION)
  const now = serverTimestamp()
  const docRef = await addDoc(ref, {
    docType: 'record',
    // Obligatorios (el caller debe proveerlos)
    eventType: data.eventType ?? null,
    statusPipeline: data.statusPipeline ?? 'tarjeta_entregada',
    businessName: data.businessName ?? '',
    contactName: data.contactName ?? '',
    contactPhone: data.contactPhone ?? '',
    zona: data.zona ?? '',
    sector: data.sector ?? '',
    resultado: data.resultado ?? '',
    monto: data.monto ?? 0,
    fechaEvento: data.fechaEvento ?? Timestamp.now(),
    notas: data.notas ?? '',
    // Opcionales
    fechaAgendada: data.fechaAgendada ?? null,
    tipoCierre: data.tipoCierre ?? null,
    tipoSeguimiento: data.tipoSeguimiento ?? null,
    areasCriticas: data.areasCriticas ?? [],
    mensajeWhatsapp: data.mensajeWhatsapp ?? '',
    cohorte: data.cohorte ?? null,
    campana: data.campana ?? null,
    // Timestamps
    createdAt: now,
    updatedAt: now
  })
  return docRef.id
}

/**
 * Actualiza campos específicos de un registro.
 * @param {string} recordId
 * @param {Object} data  Campos a actualizar
 */
export async function updateRecord(recordId, data) {
  const ref = doc(db, COLLECTION, recordId)
  await updateDoc(ref, {
    ...data,
    updatedAt: serverTimestamp()
  })
}

/**
 * Elimina un registro operativo.
 * @param {string} recordId
 */
export async function deleteRecord(recordId) {
  const ref = doc(db, COLLECTION, recordId)
  await deleteDoc(ref)
}

// ─────────────────────────────────────────────────────────────
// KPIs (client-side sobre la semana en curso)
// ─────────────────────────────────────────────────────────────

/**
 * Calcula KPIs semanales a partir de los records en memoria.
 * "Semana en curso" = lunes 00:00 → ahora.
 * @param {Object[]} records  Array de records (todos, no filtrados)
 * @param {Object} metas      metasSemanales del settings
 * @returns {Object} kpis
 */
export function getKPIsWeekly(records, metas = {}) {
  const now = new Date()
  const dayOfWeek = now.getDay() === 0 ? 6 : now.getDay() - 1 // lunes=0
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - dayOfWeek)
  startOfWeek.setHours(0, 0, 0, 0)

  const weekRecords = records.filter((r) => {
    const fecha = r.fechaEvento?.toDate ? r.fechaEvento.toDate() : new Date(r.fechaEvento)
    return fecha >= startOfWeek
  })

  const visitas = weekRecords.filter((r) => r.eventType === 'visita')
  const diagnosticos = weekRecords.filter((r) => r.eventType === 'diagnostico')
  const cierres = weekRecords.filter((r) => r.eventType === 'cierre')

  const visitasTotal = visitas.length
  const agendados = visitas.filter((r) => r.resultado === 'agendado').length

  const tasaAgendamiento =
    visitasTotal > 0 ? Math.round((agendados / visitasTotal) * 100) : 0

  const cierresAdvisory = cierres.filter((r) => r.tipoCierre === 'advisory').length
  const cierresWala = cierres.filter((r) => r.tipoCierre === 'wala').length
  const totalCierres = cierresAdvisory + cierresWala

  const tasaCierre =
    diagnosticos.length > 0 ? Math.round((totalCierres / diagnosticos.length) * 100) : 0

  const cajaAdvisory = cierresAdvisory * 225
  const cajaWala = cierresWala * 49
  const cajaTotal = cajaAdvisory + cajaWala

  // Alertas
  const alertas = []
  const visitasTarget = metas.visitasTarget ?? METAS_SEMANALES_DEFAULT.visitasTarget
  const tasaAgendamientoMin = metas.tasaAgendamientoMin ?? METAS_SEMANALES_DEFAULT.tasaAgendamientoMin
  const cierresTarget = metas.cierresTarget ?? METAS_SEMANALES_DEFAULT.cierresTarget
  const cajaTarget = metas.cajaTarget ?? METAS_SEMANALES_DEFAULT.cajaTarget

  if (visitasTotal < visitasTarget * 0.5) {
    alertas.push(`⚠️ Solo ${visitasTotal} visitas de ${visitasTarget} esperadas esta semana`)
  }
  if (visitasTotal > 0 && tasaAgendamiento < tasaAgendamientoMin) {
    alertas.push(`⚠️ Tasa de agendamiento ${tasaAgendamiento}% bajo mínimo ${tasaAgendamientoMin}%`)
  }
  if (totalCierres < cierresTarget && diagnosticos.length >= cierresTarget) {
    alertas.push(`⚠️ ${totalCierres} cierres de ${cierresTarget} esperados`)
  }
  if (cajaTotal < cajaTarget * 0.5 && cierres.length > 0) {
    alertas.push(`⚠️ Caja S/.${cajaTotal} bajo 50% de la meta S/.${cajaTarget}`)
  }

  return {
    visitasTotal,
    agendados,
    tasaAgendamiento,
    diagnosticosTotal: diagnosticos.length,
    cierresAdvisory,
    cierresWala,
    totalCierres,
    tasaCierre,
    cajaAdvisory,
    cajaWala,
    cajaTotal,
    alertas
  }
}

/**
 * Helper: genera un mensaje de WhatsApp a partir del record y templates.
 * @param {Object} record
 * @param {Object} templates  whatsappTemplates desde settings
 * @returns {string}
 */
export function buildWhatsappMessage(record, templates = {}) {
  const name = record.contactName || '[Nombre]'
  const fecha = record.fechaAgendada || '[fecha]'

  if (record.eventType === 'visita') {
    return (templates.pitch || WHATSAPP_TEMPLATES.pitch).replace('[Nombre]', name)
  }
  if (record.eventType === 'diagnostico') {
    return (templates.seguimiento48h || WHATSAPP_TEMPLATES.seguimiento48h)
      .replace('[Nombre]', name)
      .replace('[AREAS]', (record.areasCriticas || []).join(', '))
      .replace('[AREA_PRINCIPAL]', (record.areasCriticas || [])[0] || '')
  }
  if (record.eventType === 'cierre') {
    return (templates.cierre || WHATSAPP_TEMPLATES.cierre)
      .replace('[FECHA]', fecha)
  }
  if (record.eventType === 'seguimiento') {
    return `${name}, quería confirmarte que todo está en orden. ¿Alguna duda?`
  }
  return ''
}

// Re-exportar composable como hook (compatibilidad con stores)
export function useComercial() {
  return {
    fetchSettings,
    saveSettings,
    fetchRecords,
    createRecord,
    updateRecord,
    deleteRecord,
    getKPIsWeekly,
    buildWhatsappMessage
  }
}
