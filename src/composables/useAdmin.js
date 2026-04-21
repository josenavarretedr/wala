import { ref } from 'vue'
import { httpsCallable } from 'firebase/functions'
import { functionsUsCentral1 } from '@/firebaseInit'

function handleError(err, fallback) {
  console.error(`❌ [useAdmin] ${fallback}:`, err)
  if (err.code === 'functions/permission-denied') return 'No tienes permisos de administrador.'
  if (err.code === 'functions/unauthenticated') return 'Debes iniciar sesión.'
  if (err.code === 'functions/already-exists') return 'El negocio ya está inscrito en este programa.'
  if (err.code === 'functions/not-found') return 'Negocio o programa no encontrado.'
  if (err.code === 'functions/failed-precondition') return err.message || 'No se cumple una condición requerida para completar la acción.'
  return err.message || fallback
}

export function useAdmin() {
  const loading = ref(false)
  const error = ref(null)
  const businessList = ref([])
  const programList = ref([])

  /**
   * Obtiene todos los negocios con su suscripción y programas
   */
  const loadAllBusinesses = async () => {
    loading.value = true
    error.value = null
    try {
      const fn = httpsCallable(functionsUsCentral1, 'adminGetAllBusinesses')
      const res = await fn()
      if (res.data?.success) {
        businessList.value = res.data.businesses || []
        console.log(`✅ [useAdmin] ${businessList.value.length} negocios cargados.`)
      }
      return businessList.value
    } catch (err) {
      error.value = handleError(err, 'Error cargando negocios')
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Obtiene todos los programas activos
   */
  const loadAllPrograms = async () => {
    try {
      const fn = httpsCallable(functionsUsCentral1, 'adminGetAllPrograms')
      const res = await fn()
      if (res.data?.success) {
        programList.value = res.data.programs || []
      }
      return programList.value
    } catch (err) {
      error.value = handleError(err, 'Error cargando programas')
      throw err
    }
  }

  /**
   * Actualiza la suscripción de un negocio
   */
  const updateSubscription = async (businessId, { plan, status, endDate, allowUnlimitedPaidPlan = false }) => {
    loading.value = true
    error.value = null
    try {
      const fn = httpsCallable(functionsUsCentral1, 'adminUpdateSubscription')
      const res = await fn({ businessId, plan, status, endDate, allowUnlimitedPaidPlan })
      if (res.data?.success) {
        // Actualizar el negocio en la lista local
        const idx = businessList.value.findIndex(b => b.businessId === businessId)
        if (idx !== -1) {
          const localEndDate = endDate || null
          businessList.value[idx].subscription = {
            ...businessList.value[idx].subscription,
            ...(res.data.subscription || {}),
            plan,
            status: status || 'active',
            endDate: res.data.subscription?.endDate ?? localEndDate,
          }

          if (res.data.features) {
            businessList.value[idx].features = res.data.features
          }
        }
      }
      return res.data
    } catch (err) {
      error.value = handleError(err, 'Error actualizando suscripción')
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Inscribe un negocio en un programa (acción de admin, sin código)
   */
  const enrollBusinessInProgram = async (businessId, programId) => {
    loading.value = true
    error.value = null
    try {
      const fn = httpsCallable(functionsUsCentral1, 'adminEnrollBusinessInProgram')
      const res = await fn({ businessId, programId })
      if (res.data?.success) {
        // Actualizar lista local
        const idx = businessList.value.findIndex(b => b.businessId === businessId)
        if (idx !== -1 && !businessList.value[idx].programs.includes(programId)) {
          businessList.value[idx].programs.push(programId)
        }

        if (idx !== -1 && res.data.subscription) {
          businessList.value[idx].subscription = {
            ...businessList.value[idx].subscription,
            ...res.data.subscription,
          }
        }

        if (idx !== -1 && res.data.features) {
          businessList.value[idx].features = res.data.features
        }
      }
      return res.data
    } catch (err) {
      error.value = handleError(err, 'Error inscribiendo negocio')
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    businessList,
    programList,
    loadAllBusinesses,
    loadAllPrograms,
    updateSubscription,
    enrollBusinessInProgram,
  }
}
