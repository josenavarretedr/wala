import { defineStore } from 'pinia'
import { collection, doc, getDoc, setDoc, query, where, getDocs, updateDoc, addDoc, deleteDoc } from 'firebase/firestore'
import { db } from '@/firebaseInit'
import { v4 as uuidv4 } from 'uuid'
import { useTraceability } from '@/composables/useTraceability'
import { createBusiness as createBusinessComposable } from '@/composables/useBusiness'

export const useBusinessStore = defineStore('business', {
  state: () => ({
    business: null,           // Negocio actualmente cargado
    employees: [],           // Empleados del negocio actual
    businessList: [],        // Lista de negocios (para búsquedas)
    currentUserRole: null,   // Rol del usuario actual en este negocio
    currentUserPermissions: {}, // Permisos del usuario actual en este negocio
    isLoading: false,
    error: null
  }),

  getters: {
    getBusinessId: (state) => state.business?.id || null,
    getBusinessName: (state) => state.business?.nombre || null,
    getBusinessType: (state) => state.business?.tipo || null,
    isBusinessOwner: (state) => (userId) => state.business?.gerenteId === userId,
    getEmployeeCount: (state) => state.employees.length,
    hasEmployees: (state) => state.employees.length > 0,

    // ✅ NUEVO: Getters para el contexto del usuario actual
    getCurrentUserRole: (state) => state.currentUserRole,
    getCurrentUserPermissions: (state) => state.currentUserPermissions,
    isCurrentUserManager: (state) => state.currentUserRole === 'gerente',
    isCurrentUserEmployee: (state) => state.currentUserRole === 'empleado',

    // ✅ Verificar permisos específicos
    hasPermission: (state) => (permission) => {
      return state.currentUserPermissions[permission] === true
    },

    // ==========================================
    // 🔐 GETTERS DE SUSCRIPCIÓN Y FEATURES
    // ==========================================

    /**
     * Obtiene el objeto de suscripción del negocio
     */
    subscription: (state) => state.business?.subscription || {},

    /**
     * Verifica si el negocio tiene plan Premium activo
     */
    isPremium: (state) => {
      const sub = state.business?.subscription
      return sub?.plan === 'premium' && sub?.status === 'active'
    },

    /**
     * Verifica si el negocio tiene plan Free
     */
    isFree: (state) => {
      const sub = state.business?.subscription
      return !sub || sub?.plan === 'free'
    },

    /**
     * Verifica si está en período de prueba activo
     */
    isTrialActive: (state) => {
      const sub = state.business?.subscription
      if (sub?.status !== 'trial') return false
      if (!sub.endDate) return false
      return new Date() < sub.endDate.toDate()
    },

    /**
     * Calcula días restantes de suscripción
     */
    subscriptionDaysRemaining: (state) => {
      const sub = state.business?.subscription
      if (!sub?.endDate) return null
      const now = new Date()
      const end = sub.endDate.toDate()
      const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24))
      return diff > 0 ? diff : 0
    },

    /**
     * Verifica si tiene acceso a una feature específica
     */
    hasFeature: (state) => (featureName) => {
      return state.business?.features?.[featureName] === true
    },

    /**
     * Verifica si puede agregar un empleado
     */
    canAddEmployee: (state) => {
      const usage = state.business?.usage || {}
      const features = state.business?.features || {}
      const maxEmployees = features.maxEmployees || 3

      return usage.employeeCount < maxEmployees
    },

    /**
     * Verifica si puede agregar un producto
     */
    canAddProduct: (state) => {
      const usage = state.business?.usage || {}
      const features = state.business?.features || {}
      const maxProducts = features.maxProducts || 100

      return usage.productCount < maxProducts
    },

    /**
     * Obtiene límites actuales de uso
     */
    limits: (state) => {
      const features = state.business?.features || {}
      const usage = state.business?.usage || {}

      return {
        employees: {
          current: usage.employeeCount || 0,
          max: features.maxEmployees || 3,
          available: (features.maxEmployees || 3) - (usage.employeeCount || 0)
        },
        products: {
          current: usage.productCount || 0,
          max: features.maxProducts || 100,
          available: (features.maxProducts || 100) - (usage.productCount || 0)
        }
      }
    }
  },

  actions: {
    // ✅ NUEVO: Cargar negocio específico con contexto del usuario
    async loadBusiness(businessId, userBusiness = null) {
      this.isLoading = true
      this.error = null

      try {
        console.log('🔄 Cargando negocio:', businessId)

        // === TRAZABILIDAD: Inicializar sistema ===
        const { logBusinessOperation } = useTraceability()

        // === TRAZABILIDAD: Log de acceso a negocio ===
        const traceId = await logBusinessOperation(
          'read',
          businessId,
          { action: 'load_business', userRole: userBusiness?.rol },
          {
            reason: 'business_data_access',
            severity: 'medium',
            tags: ['business_load', 'data_access'],
            component: 'BusinessStore.loadBusiness'
          }
        )

        // Cargar datos completos del negocio desde Firestore
        const businessDocRef = doc(db, 'businesses', businessId)
        const businessDoc = await getDoc(businessDocRef)

        if (!businessDoc.exists()) {
          throw new Error(`Negocio con ID ${businessId} no encontrado`)
        }

        const businessData = {
          id: businessDoc.id,
          ...businessDoc.data()
        }

        this.business = businessData

        // Establecer contexto del usuario actual (si se proporciona)
        if (userBusiness) {
          this.currentUserRole = userBusiness.rol
          this.currentUserPermissions = userBusiness.permissions || {}
        }

        // Cargar empleados del negocio
        await this.loadEmployees(businessId)

        // === TRAZABILIDAD: Log de carga exitosa ===
        await logBusinessOperation(
          'read',
          businessId,
          businessData,
          {
            reason: 'business_load_completed',
            severity: 'low',
            tags: ['business_load', 'success'],
            component: 'BusinessStore.loadBusiness',
            metadata: {
              businessName: businessData.nombre,
              userRole: this.currentUserRole,
              employeeCount: this.employees.length
            }
          }
        )

        console.log('✅ Negocio cargado:', businessData.nombre)
        console.log('👤 Rol del usuario:', this.currentUserRole)
        console.log('🔑 Permisos:', Object.keys(this.currentUserPermissions).length)
        console.log('📊 TraceId:', traceId)

        return businessData

      } catch (error) {
        console.error('❌ Error al cargar negocio:', error)
        this.error = `Error al cargar negocio: ${error.message}`

        // === TRAZABILIDAD: Log de error ===
        const { logBusinessOperation } = useTraceability()
        await logBusinessOperation(
          'error',
          businessId,
          { error: error.message },
          {
            reason: 'business_load_failed',
            severity: 'high',
            tags: ['business_load', 'error', 'fetch_failure'],
            component: 'BusinessStore.loadBusiness'
          }
        )

        throw error
      } finally {
        this.isLoading = false
      }
    },

    // ✅ NUEVO: Limpiar datos del negocio actual
    clearCurrentBusiness() {
      // === TRAZABILIDAD: Log de limpieza ===
      const { logBusinessOperation } = useTraceability()

      if (this.business) {
        logBusinessOperation(
          'update',
          this.business.id,
          { action: 'clear_business_data' },
          {
            reason: 'business_data_cleanup',
            severity: 'low',
            tags: ['business_cleanup', 'session_end'],
            component: 'BusinessStore.clearCurrentBusiness'
          }
        )
      }

      this.business = null
      this.employees = []
      this.currentUserRole = null
      this.currentUserPermissions = {}
      this.error = null
      console.log('🧹 Datos del negocio actual limpiados con trazabilidad')
    },

    async createBusiness(businessData) {
      this.isLoading = true
      this.error = null

      try {
        // === TRAZABILIDAD: Inicializar sistema ===
        const { logBusinessOperation } = useTraceability()

        // === TRAZABILIDAD: Log de creación de negocio ===
        const traceId = await logBusinessOperation(
          'create',
          businessData.id,
          businessData,
          {
            reason: 'new_business_creation',
            severity: 'high',
            tags: ['business_creation', 'new_business'],
            component: 'BusinessStore.createBusiness',
            metadata: {
              businessName: businessData.businessName,
              businessType: businessData.industry,
              ownerId: businessData.gerenteId
            }
          }
        )

        // Usar el composable actualizado para crear el negocio
        const businessUuid = await createBusinessComposable(businessData.gerenteId, businessData)

        console.log('✅ Negocio creado exitosamente con UUID:', businessUuid)
        console.log('👤 Gerente asignado:', businessData.gerenteId)

        // Cargar el negocio recién creado para actualizar el estado local
        const businessDocRef = doc(db, 'businesses', businessUuid)
        const businessSnapshot = await getDoc(businessDocRef)

        if (businessSnapshot.exists()) {
          const business = {
            id: businessSnapshot.id,
            ...businessSnapshot.data()
          }

          this.business = business
          this.businessList = [business]

          return business
        } else {
          throw new Error('No se pudo cargar el negocio recién creado')
        }

      } catch (error) {
        console.error('❌ Error al crear negocio:', error)
        this.error = 'Error al crear el negocio'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async searchBusinessByName(nombre) {
      this.isLoading = true
      this.error = null

      try {
        // Buscar en Firestore por nombre exacto
        const businessesRef = collection(db, 'businesses')
        const q = query(businessesRef, where('nombre', '==', nombre), where('activo', '==', true))
        const querySnapshot = await getDocs(q)

        const businesses = []
        querySnapshot.forEach((doc) => {
          businesses.push({
            id: doc.id,
            ...doc.data()
          })
        })

        this.businessList = businesses

        console.log(`🔍 Búsqueda completada. Encontrados ${businesses.length} negocios con nombre "${nombre}"`)
        return businesses

      } catch (error) {
        console.error('❌ Error al buscar negocio:', error)
        this.error = 'Error al buscar el negocio'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async loadEmployees(businessId) {
      try {
        // Buscar empleados asignados a este negocio
        const usersRef = collection(db, 'users')
        const q = query(
          usersRef,
          where('businessId', '==', businessId),
          where('activo', '==', true)
        )
        const querySnapshot = await getDocs(q)

        const employees = []
        querySnapshot.forEach((doc) => {
          const userData = doc.data()
          employees.push({
            uid: doc.id,
            ...userData
          })
        })

        this.employees = employees

        console.log(`👥 ${employees.length} empleados cargados para el negocio ${businessId}`)
        return employees

      } catch (error) {
        console.error('❌ Error al cargar empleados:', error)
        this.error = 'Error al cargar empleados'
        throw error
      }
    },

    /**
     * Carga un negocio con toda su configuración de settings/
     * @param {string} businessId - ID del negocio
     * @returns {Promise<Object>} Negocio con settings incluidos
     */
    async loadBusinessWithSettings(businessId) {
      this.isLoading = true
      this.error = null

      try {
        console.log('🔄 Cargando negocio con configuraciones:', businessId)

        // Cargar documento principal
        const businessRef = doc(db, 'businesses', businessId)
        const businessSnap = await getDoc(businessRef)

        if (!businessSnap.exists()) {
          throw new Error(`Negocio ${businessId} no encontrado`)
        }

        const businessData = businessSnap.data()

        // Cargar settings en paralelo
        const [config, onboarding, integrations, customization] = await Promise.all([
          getDoc(doc(db, 'businesses', businessId, 'settings', 'config')),
          getDoc(doc(db, 'businesses', businessId, 'settings', 'onboarding')),
          getDoc(doc(db, 'businesses', businessId, 'settings', 'integrations')),
          getDoc(doc(db, 'businesses', businessId, 'settings', 'customization')),
        ])

        const businessWithSettings = {
          ...businessData,
          id: businessId,
          settings: {
            config: config.exists() ? config.data() : null,
            onboarding: onboarding.exists() ? onboarding.data() : null,
            integrations: integrations.exists() ? integrations.data() : null,
            customization: customization.exists() ? customization.data() : null,
          }
        }

        // Actualizar estado local
        this.business = businessWithSettings

        console.log('✅ Negocio cargado con configuraciones completas')
        return businessWithSettings

      } catch (error) {
        console.error('❌ Error al cargar negocio con settings:', error)
        this.error = 'Error al cargar el negocio'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async updateBusiness(businessId, data) {
      this.isLoading = true
      this.error = null

      try {
        // Campos permitidos en documento principal
        const allowedFields = [
          'nombre', 'tipo', 'descripcion', 'logo', 'direccion', 'telefono', 'email',
          'contactInfo', 'subscription', 'features', 'configuracion',
          'metadata', 'usage', 'isActive', 'activo', 'gerenteId',
          'fechaCreacion', 'permissions'
        ]

        // Filtrar solo campos permitidos
        const filteredData = Object.keys(data)
          .filter(key => allowedFields.includes(key))
          .reduce((obj, key) => {
            obj[key] = data[key]
            return obj
          }, {})

        // Agregar timestamp
        filteredData.updatedAt = new Date()

        const businessDocRef = doc(db, 'businesses', businessId)
        await updateDoc(businessDocRef, filteredData)

        // Actualizar estado local
        if (this.business && this.business.id === businessId) {
          this.business = { ...this.business, ...filteredData }
        }

        console.log('✅ Negocio actualizado exitosamente')
        console.log('📝 Campos actualizados:', Object.keys(filteredData))
        return filteredData

      } catch (error) {
        console.error('❌ Error al actualizar negocio:', error)
        this.error = 'Error al actualizar el negocio'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async addEmployee(employeeData) {
      try {
        // El empleado se agrega mediante la actualización de su perfil de usuario
        // Esto se maneja en el userStore.assignToBusiness()

        // Recargar empleados para reflejar los cambios
        if (this.business?.id) {
          await this.loadEmployees(this.business.id)
        }

        console.log('✅ Empleado agregado exitosamente')
        return true

      } catch (error) {
        console.error('❌ Error al agregar empleado:', error)
        this.error = 'Error al agregar empleado'
        throw error
      }
    },

    async removeEmployee(employeeUid) {
      try {
        // Actualizar el perfil del empleado para desasignarlo
        const userDocRef = doc(db, 'users', employeeUid)
        await updateDoc(userDocRef, {
          businessId: null,
          businessName: ''
        })

        // Remover de la lista local
        this.employees = this.employees.filter(emp => emp.uid !== employeeUid)

        console.log('✅ Empleado removido exitosamente')
        return true

      } catch (error) {
        console.error('❌ Error al remover empleado:', error)
        this.error = 'Error al remover empleado'
        throw error
      }
    },

    async searchBusinesses(searchTerm) {
      this.isLoading = true
      this.error = null

      try {
        // Buscar negocios que contengan el término de búsqueda
        const businessesRef = collection(db, 'businesses')
        const querySnapshot = await getDocs(businessesRef)

        const businesses = []
        querySnapshot.forEach((doc) => {
          const businessData = doc.data()
          if (businessData.nombre.toLowerCase().includes(searchTerm.toLowerCase()) && businessData.activo) {
            businesses.push({
              id: doc.id,
              ...businessData
            })
          }
        })

        this.businessList = businesses

        console.log(`🔍 Encontrados ${businesses.length} negocios con "${searchTerm}"`)
        return businesses

      } catch (error) {
        console.error('❌ Error al buscar negocios:', error)
        this.error = 'Error al buscar negocios'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    clearBusinessData() {
      this.business = null
      this.employees = []
      this.businessList = []
      this.error = null
      console.log('🧹 Datos de negocio limpiados')
    },

    setCurrentBusiness(business) {
      this.business = business
      console.log('📍 Negocio actual establecido:', business.nombre)
    },

    // ==========================================
    // 🔐 ACTIONS DE SUSCRIPCIÓN Y FEATURES
    // ==========================================

    /**
     * Obtiene las features disponibles según el plan
     */
    getFeaturesForPlan(plan) {
      if (plan === 'premium') {
        return {
          maxEmployees: 999999, // "unlimited"
          maxProducts: 999999,
          advancedReports: true,
          multiLocation: true,
          apiAccess: true,
          prioritySupport: true,
          customBranding: true,
          aiClassification: true,
          exportData: true
        }
      }

      // Plan free (por defecto)
      return {
        maxEmployees: 3,
        maxProducts: 100,
        advancedReports: false,
        multiLocation: false,
        apiAccess: false,
        prioritySupport: false,
        customBranding: false,
        aiClassification: false,
        exportData: false
      }
    },

    /**
     * Actualiza las features del negocio basado en su plan
     */
    async refreshBusinessFeatures(businessId) {
      try {
        console.log('🔄 Actualizando features para negocio:', businessId)

        const businessRef = doc(db, 'businesses', businessId)
        const businessDoc = await getDoc(businessRef)

        if (!businessDoc.exists()) {
          throw new Error('Negocio no encontrado')
        }

        const businessData = businessDoc.data()
        const subscription = businessData.subscription || { plan: 'free' }

        // Definir features según el plan
        const features = this.getFeaturesForPlan(subscription.plan)

        // Actualizar en Firestore
        await updateDoc(businessRef, {
          features,
          'subscription.updatedAt': new Date()
        })

        // Actualizar estado local
        if (this.business?.id === businessId) {
          this.business.features = features
        }

        console.log('✅ Features actualizadas para plan:', subscription.plan)
        return features
      } catch (error) {
        console.error('❌ Error actualizando features:', error)
        throw error
      }
    },

    /**
     * Actualiza las estadísticas de uso del negocio
     */
    async updateUsageStats(businessId, stats) {
      try {
        const businessRef = doc(db, 'businesses', businessId)

        await updateDoc(businessRef, {
          'usage': {
            ...stats,
            lastUpdated: new Date()
          }
        })

        // Actualizar estado local
        if (this.business?.id === businessId) {
          this.business.usage = {
            ...stats,
            lastUpdated: new Date()
          }
        }

        console.log('✅ Stats de uso actualizadas:', stats)
      } catch (error) {
        console.error('❌ Error actualizando stats:', error)
      }
    },

    /**
     * Inicializa la suscripción para un negocio nuevo (plan free)
     */
    getDefaultSubscription(userId = null) {
      return {
        plan: 'free',
        status: 'active',
        startDate: new Date(),
        endDate: null,
        trialUsed: false,
        paymentMethod: null,
        lastPaymentDate: null,
        autoRenew: false,
        updatedAt: new Date(),
        updatedBy: userId
      }
    },

    /**
     * Inicializa stats de uso para un negocio nuevo
     */
    getDefaultUsageStats() {
      return {
        employeeCount: 1, // El gerente cuenta como 1
        productCount: 0,
        lastUpdated: new Date()
      }
    },

    /**
     * Actualiza el plan de suscripción del negocio
     */
    async updateSubscriptionPlan(businessId, newPlan, userId) {
      try {
        console.log('⬆️ Actualizando plan a:', newPlan)

        const businessRef = doc(db, 'businesses', businessId)

        // Calcular fecha de fin (ejemplo: 30 días para premium)
        const endDate = newPlan === 'premium' ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null

        const subscriptionUpdate = {
          'subscription.plan': newPlan,
          'subscription.status': 'active',
          'subscription.updatedAt': new Date(),
          'subscription.updatedBy': userId
        }

        if (endDate) {
          subscriptionUpdate['subscription.endDate'] = endDate
        }

        await updateDoc(businessRef, subscriptionUpdate)

        // Actualizar features según el nuevo plan
        await this.refreshBusinessFeatures(businessId)

        console.log('✅ Plan actualizado exitosamente a:', newPlan)
        return true
      } catch (error) {
        console.error('❌ Error actualizando plan:', error)
        throw error
      }
    },

    /**
     * Elimina un negocio (soft delete)
     * @param {string} businessId - ID del negocio
     */
    async deleteBusiness(businessId) {
      this.isLoading = true
      this.error = null

      try {
        console.log('🗑️ Marcando negocio como eliminado:', businessId)

        const businessRef = doc(db, 'businesses', businessId)

        await updateDoc(businessRef, {
          deleted: true,
          deletedAt: new Date().toISOString(),
          isActive: false,
          activo: false,
          updatedAt: new Date().toISOString()
        })

        // Limpiar estado local si es el negocio actual
        if (this.business?.id === businessId) {
          this.clearBusinessData()
        }

        console.log(`✅ Negocio ${businessId} marcado como eliminado (soft delete)`)
        return true

      } catch (error) {
        console.error('❌ Error al eliminar negocio:', error)
        this.error = 'Error al eliminar el negocio'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Elimina permanentemente un negocio y toda su configuración (solo admin)
     * @param {string} businessId - ID del negocio
     */
    async hardDeleteBusiness(businessId) {
      this.isLoading = true
      this.error = null

      try {
        console.log('🗑️💥 Eliminando permanentemente negocio:', businessId)

        // 1. Eliminar subcolección settings
        const settingsDocs = ['config', 'onboarding', 'integrations', 'customization']
        await Promise.all(
          settingsDocs.map(async (docId) => {
            try {
              const settingsDocRef = doc(db, 'businesses', businessId, 'settings', docId)
              await deleteDoc(settingsDocRef)
              console.log(`  ✅ Eliminado settings/${docId}`)
            } catch (error) {
              console.warn(`  ⚠️ No se pudo eliminar settings/${docId}:`, error.message)
            }
          })
        )

        // 2. Eliminar documento principal
        const businessRef = doc(db, 'businesses', businessId)
        await deleteDoc(businessRef)

        // Limpiar estado local
        if (this.business?.id === businessId) {
          this.clearBusinessData()
        }

        console.log(`🗑️ Negocio ${businessId} eliminado permanentemente`)
        return true

      } catch (error) {
        console.error('❌ Error al eliminar permanentemente el negocio:', error)
        this.error = 'Error al eliminar permanentemente el negocio'
        throw error
      } finally {
        this.isLoading = false
      }
    }
  }
})
