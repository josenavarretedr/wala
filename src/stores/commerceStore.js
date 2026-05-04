/**
 * Store: commerceStore (Pinia)
 * Estado plano para el módulo Admin Comercial.
 * Opera exclusivamente sobre la colección top-level `comercial`.
 * Sin businessId, currentBusiness, ni carga global multi-tenant.
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  fetchSettings,
  saveSettings,
  fetchRecords,
  createRecord,
  updateRecord,
  deleteRecord,
  getKPIsWeekly
} from '@/composables/useComercial'
import { DEFAULT_ZONAS, DEFAULT_SECTORES, METAS_SEMANALES_DEFAULT } from '@/constants/commerceConstants'

export const useCommerceStore = defineStore('commerce', () => {
  // ═══════════════════════════════════════════════════════════
  // STATE
  // ═══════════════════════════════════════════════════════════

  /** Documento comercial/settings */
  const settings = ref(null)

  /** Array de documentos comercial/{recordId} con docType 'record' */
  const records = ref([])

  const loading = ref(false)
  const error = ref(null)

  const filters = ref({
    zona: null,
    sector: null,
    statusPipeline: null,
    eventType: null,
    dateRange: [null, null]
  })

  // ═══════════════════════════════════════════════════════════
  // GETTERS
  // ═══════════════════════════════════════════════════════════

  const disponibleZones = computed(() => settings.value?.activeZones ?? DEFAULT_ZONAS)

  const disponibleSectors = computed(() => settings.value?.activeSectors ?? DEFAULT_SECTORES)

  const metasSemanales = computed(
    () => settings.value?.metasSemanales ?? { ...METAS_SEMANALES_DEFAULT }
  )

  const whatsappTemplates = computed(() => settings.value?.whatsappTemplates ?? {})

  const campanas = computed(() => settings.value?.campanas ?? [])

  const cohortes = computed(() => settings.value?.cohortes ?? [])

  /** Records filtrados por los filtros activos (client-side) */
  const filteredRecords = computed(() => {
    let result = records.value

    if (filters.value.zona) {
      result = result.filter((r) => r.zona === filters.value.zona)
    }
    if (filters.value.sector) {
      result = result.filter((r) => r.sector === filters.value.sector)
    }
    if (filters.value.statusPipeline) {
      result = result.filter((r) => r.statusPipeline === filters.value.statusPipeline)
    }
    if (filters.value.eventType) {
      result = result.filter((r) => r.eventType === filters.value.eventType)
    }

    return result
  })

  /** Records agrupados por statusPipeline para el tablero Kanban */
  const recordsByStatus = computed(() => {
    const grouped = {
      tarjeta_entregada: [],
      agendado: [],
      diagnosticado: [],
      en_seguimiento: [],
      cerrado_advisory: [],
      cerrado_wala: [],
      descartado: []
    }
    filteredRecords.value.forEach((r) => {
      if (grouped[r.statusPipeline]) {
        grouped[r.statusPipeline].push(r)
      }
    })
    return grouped
  })

  /** KPIs de la semana en curso calculados client-side sobre todos los records */
  const kpisWeekly = computed(() => getKPIsWeekly(records.value, metasSemanales.value))

  /** Alertas derivadas de kpisWeekly */
  const alertas = computed(() => kpisWeekly.value.alertas ?? [])

  // ═══════════════════════════════════════════════════════════
  // ACTIONS: Settings
  // ═══════════════════════════════════════════════════════════

  const fetchSettingsAction = async () => {
    try {
      loading.value = true
      error.value = null
      settings.value = await fetchSettings()
    } catch (err) {
      error.value = err.message
      console.error('[commerceStore] fetchSettings error:', err)
    } finally {
      loading.value = false
    }
  }

  const updateSettings = async (newData) => {
    try {
      loading.value = true
      await saveSettings(newData)
      settings.value = { ...settings.value, ...newData }
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // ═══════════════════════════════════════════════════════════
  // ACTIONS: Records
  // ═══════════════════════════════════════════════════════════

  const fetchRecordsAction = async (firestoreFilters = {}) => {
    try {
      loading.value = true
      error.value = null
      records.value = await fetchRecords(firestoreFilters)
    } catch (err) {
      error.value = err.message
      console.error('[commerceStore] fetchRecords error:', err)
    } finally {
      loading.value = false
    }
  }

  const addRecord = async (data) => {
    try {
      loading.value = true
      const recordId = await createRecord(data)
      // Optimistic: recargar records
      await fetchRecordsAction()
      return recordId
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const editRecord = async (recordId, data) => {
    try {
      loading.value = true
      await updateRecord(recordId, data)
      // Actualización optimista en memoria
      const idx = records.value.findIndex((r) => r.id === recordId)
      if (idx >= 0) {
        records.value[idx] = { ...records.value[idx], ...data }
      }
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const setRecordStatus = async (recordId, statusPipeline) => {
    return editRecord(recordId, { statusPipeline })
  }

  const removeRecord = async (recordId) => {
    try {
      loading.value = true
      await deleteRecord(recordId)
      records.value = records.value.filter((r) => r.id !== recordId)
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // ═══════════════════════════════════════════════════════════
  // ACTIONS: Carga inicial completa
  // ═══════════════════════════════════════════════════════════

  const initialize = async () => {
    try {
      loading.value = true
      error.value = null
      await Promise.all([fetchSettingsAction(), fetchRecordsAction()])
    } catch (err) {
      error.value = err.message
      console.error('[commerceStore] initialize error:', err)
    } finally {
      loading.value = false
    }
  }

  // ═══════════════════════════════════════════════════════════
  // ACTIONS: Filters
  // ═══════════════════════════════════════════════════════════

  const setFilters = (newFilters) => {
    filters.value = { ...filters.value, ...newFilters }
  }

  const clearFilters = () => {
    filters.value = {
      zona: null,
      sector: null,
      statusPipeline: null,
      eventType: null,
      dateRange: [null, null]
    }
  }

  return {
    // State
    settings,
    records,
    loading,
    error,
    filters,

    // Getters
    disponibleZones,
    disponibleSectors,
    metasSemanales,
    whatsappTemplates,
    campanas,
    cohortes,
    filteredRecords,
    recordsByStatus,
    kpisWeekly,
    alertas,

    // Actions — Settings
    fetchSettings: fetchSettingsAction,
    updateSettings,

    // Actions — Records
    fetchRecords: fetchRecordsAction,
    addRecord,
    editRecord,
    setRecordStatus,
    removeRecord,

    // Actions — Init & Filters
    initialize,
    setFilters,
    clearFilters
  }
})
