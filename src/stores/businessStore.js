import { defineStore } from 'pinia'
import { collection, doc, getDoc, setDoc, query, where, getDocs, updateDoc, addDoc } from 'firebase/firestore'
import { db } from '@/firebaseInit'
import { v4 as uuidv4 } from 'uuid'
import { useTraceability } from '@/composables/useTraceability'

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
              businessName: businessData.nombre,
              businessType: businessData.tipo,
              ownerId: businessData.gerenteId
            }
          }
        )

        const business = {
          id: businessData.id,
          nombre: businessData.nombre,
          tipo: businessData.tipo,
          direccion: businessData.direccion || '',
          telefono: businessData.telefono || '',
          email: businessData.email || '',
          gerenteId: businessData.gerenteId,
          fechaCreacion: new Date(),
          activo: true,
          configuracion: {
            moneda: businessData.moneda || 'PEN',
            timezone: businessData.timezone || 'America/Lima',
            permisos: {
              empleados: {
                verIngresos: true,
                verEgresos: true,
                crearMovimientos: true,
                editarMovimientos: false,
                verReportes: false
              }
            }
          }
        }

        // Crear documento en Firestore
        const businessDocRef = doc(db, 'businesses', businessData.id)
        await setDoc(businessDocRef, business)

        // Actualizar estado local
        this.business = business
        this.businessList = [business]

        console.log('✅ Negocio creado exitosamente:', business.nombre)
        console.log('🔗 ID del negocio:', businessData.id)
        console.log('👤 Gerente asignado:', businessData.gerenteId)
        return business

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

    async updateBusiness(businessId, updates) {
      this.isLoading = true
      this.error = null

      try {
        const businessDocRef = doc(db, 'businesses', businessId)
        await updateDoc(businessDocRef, updates)

        // Actualizar estado local
        if (this.business && this.business.id === businessId) {
          this.business = { ...this.business, ...updates }
        }

        console.log('✅ Negocio actualizado exitosamente')
        return true

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
    }
  }
})
