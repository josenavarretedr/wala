import { defineStore } from 'pinia'
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore'
import { db, auth } from '@/firebaseInit'

// Claves de localStorage
const STORAGE_KEYS = {
  PROFILE: 'walla_profile',
  BUSINESSES: 'walla_businesses',
  CURRENT_BUSINESS: 'walla_current_business'
}

export const useUserStore = defineStore('user', {
  state: () => ({
    userProfile: null,
    userBusinesses: [], // ✅ NUEVO: Array de negocios
    currentBusiness: null, // ✅ NUEVO: Negocio seleccionado
    isLoading: false,
    error: null
  }),

  getters: {
    // Verificar si es gerente de al menos un negocio
    isManager: (state) => {
      return state.userBusinesses.some(b => b.rol === 'gerente');
    },

    // Verificar si es empleado en al menos un negocio
    isEmployee: (state) => {
      return state.userBusinesses.some(b => b.rol === 'empleado');
    },

    // Obtener permisos del negocio actual
    currentPermissions: (state) => {
      return state.currentBusiness?.permissions || {};
    },

    hasPermission: (state) => (permission) => {
      return state.currentBusiness?.permissions[permission] === true
    },

    // Obtener negocio principal (por defecto)
    primaryBusiness: (state) => {
      return state.userBusinesses.find(b => b.esPrincipal) || state.userBusinesses[0];
    },

    // Verificar si es gerente del negocio actual
    isCurrentBusinessManager: (state) => {
      return state.currentBusiness?.rol === 'gerente';
    },

    // Obtener rol en el negocio actual
    getCurrentBusinessRole: (state) => {
      return state.currentBusiness?.rol || null;
    },

    // Verificar si tiene al menos un negocio
    hasBusinesses: (state) => {
      return state.userBusinesses.length > 0;
    },

    // Obtener organizationName del programa más reciente del negocio actual
    currentBusinessProgramName: (state) => {
      // Si no hay negocio actual, retornar fallback
      if (!state.currentBusiness?.programs || state.currentBusiness.programs.length === 0) {
        return 'Asesoría';
      }

      // Obtener el programa más reciente (último del array)
      const programs = state.currentBusiness.programs;
      const latestProgram = programs[programs.length - 1];

      return latestProgram?.organizationName.toUpperCase() || 'Asesoria Wala';
    },

    // Obtener módulos permitidos en el negocio actual
    currentModulosAcceso: (state) => {
      if (state.currentBusiness?.rol === 'gerente' || state.currentBusiness?.permissions?.admin === true) {
        return ['dashboard', 'sales', 'expenses', 'inventory', 'clients', 'accountsReceivable', 'accountsBalance', 'records', 'incomeStatement', 'consulting', 'quotes'];
      }
      return state.currentBusiness?.modulosAcceso || [];
    },

    // Obtener el nombre visible del rol del negocio actual
    currentRolNombre: (state) => {
      if (state.currentBusiness?.rol === 'gerente') {
        return 'Gerente / Dueño';
      }
      return state.currentBusiness?.rolNombre || 'Trabajador';
    },

    // Función getter para verificar acceso a un módulo específico
    hasModuleAccess: (state) => (moduleKey) => {
      if (state.currentBusiness?.rol === 'gerente' || state.currentBusiness?.permissions?.admin === true) {
        return true;
      }
      return (state.currentBusiness?.modulosAcceso || []).includes(moduleKey);
    }
  },

  actions: {
    async loadUserProfile(uid) {
      this.isLoading = true
      this.error = null

      try {
        // Cargar perfil básico (SIN businessId, businessName, rol)
        const userDocRef = doc(db, 'users', uid)
        const userDoc = await getDoc(userDocRef)

        if (userDoc.exists()) {
          const userData = userDoc.data()

          this.userProfile = {
            ...userData,
            uid: userData.uid || uid,
            email: userData.email,
            nombre: userData.nombre,
            apellidos: userData.apellidos,
            rol: userData.rol || 'business_owner', // ← AGREGADO: Incluir rol
            fechaRegistro: userData.fechaRegistro || new Date(),
            activo: userData.activo !== false,
            configuracion: userData.configuracion || {
              theme: 'light',
              notifications: true
            }
          }

          // Guardar perfil en localStorage
          localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(this.userProfile))

        } else {
          // Usuario no existe en Firestore - crear perfil básico
          console.log('⚠️ Usuario no encontrado en Firestore, creando perfil básico')

          const currentUser = auth?.currentUser;

          const basicProfile = {
            uid: uid,
            email: currentUser?.email || null,
            nombre: currentUser?.displayName?.split(' ')[0] || '',
            apellidos: currentUser?.displayName?.split(' ').slice(1).join(' ') || '',
            rol: 'business_owner', // ← AGREGADO: Rol por defecto
            fechaRegistro: new Date(),
            activo: true,
            configuracion: {
              theme: 'light',
              notifications: true
            },
            profile: {
              name: currentUser?.displayName || '',
              nombre: currentUser?.displayName?.split(' ')[0] || '',
              apellidos: currentUser?.displayName?.split(' ').slice(1).join(' ') || '',
              email: currentUser?.email || null
            }
          }

          // Guardar perfil en Firestore
          await setDoc(userDocRef, basicProfile)

          this.userProfile = basicProfile
          localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(this.userProfile))
        }

        // ✅ NUEVO: Cargar negocios del usuario (solo si NO es facilitador)
        if (this.userProfile.rol !== 'facilitator') {
          await this.loadUserBusinesses(uid)
        } else {
          console.log('👨‍💼 Usuario facilitador, omitiendo carga de negocios')
          this.userBusinesses = []
        }

        // Establecer negocio por defecto
        if (this.userBusinesses.length > 0) {
          // Intentar restaurar negocio actual desde localStorage
          const cachedCurrentBusiness = localStorage.getItem(STORAGE_KEYS.CURRENT_BUSINESS)
          if (cachedCurrentBusiness) {
            const parsed = JSON.parse(cachedCurrentBusiness)
            const businessExists = this.userBusinesses.find(b => b.businessId === parsed.businessId)
            if (businessExists) {
              this.currentBusiness = businessExists
            } else {
              this.currentBusiness = this.primaryBusiness
            }
          } else {
            this.currentBusiness = this.primaryBusiness
          }
        }

        console.log('✅ Perfil de usuario cargado:', this.userProfile.email)
        console.log(`📊 ${this.userBusinesses.length} negocios encontrados`)
        return this.userProfile

      } catch (error) {
        console.error('❌ Error al cargar perfil de usuario:', error)
        this.error = 'Error al cargar el perfil de usuario'

        // Intentar restaurar desde localStorage como fallback
        const cachedProfile = localStorage.getItem(STORAGE_KEYS.PROFILE)
        const cachedBusinesses = localStorage.getItem(STORAGE_KEYS.BUSINESSES)

        if (cachedProfile && cachedBusinesses) {
          this.userProfile = JSON.parse(cachedProfile)
          this.userBusinesses = JSON.parse(cachedBusinesses)
          console.log('⚡ Perfil y negocios restaurados desde caché')
          return this.userProfile
        }

        throw error
      } finally {
        this.isLoading = false
      }
    },

    // ✅ NUEVO: Cargar negocios del usuario
    async loadUserBusinesses(uid) {
      try {
        const businessesRef = collection(db, 'users', uid, 'businesses')
        const q = query(businessesRef)
        const querySnapshot = await getDocs(q)

        const allUserBusinesses = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))

        console.log(`🔍 ${allUserBusinesses.length} relaciones usuario-negocio encontradas`)

        // 🔍 DEBUG: Mostrar detalles de cada relación encontrada
        allUserBusinesses.forEach((userBusiness, index) => {
          console.log(`📋 Relación ${index + 1}:`, {
            documentId: userBusiness.id,
            businessId: userBusiness.businessId,
            businessName: userBusiness.businessName,
            rol: userBusiness.rol
          })
        })

        // ✅ VALIDACIÓN: Verificar que los negocios existan en la collection principal
        const validBusinesses = []
        const invalidBusinesses = []

        for (const userBusiness of allUserBusinesses) {
          try {
            console.log(`🔍 Verificando negocio: ${userBusiness.businessName}`)
            console.log(`📋 BusinessID a buscar: "${userBusiness.businessId}"`)

            const businessDocRef = doc(db, 'businesses', userBusiness.businessId)
            const businessDoc = await getDoc(businessDocRef)

            console.log(`📊 businessDoc.exists(): ${businessDoc.exists()}`)

            if (businessDoc.exists()) {
              const businessData = businessDoc.data()
              const programIds = businessData.programs || []

              // ✅ NUEVO: Cargar datos completos de los programas
              const programsData = []
              for (const programId of programIds) {
                try {
                  const programRef = doc(db, 'programs', programId)
                  const programSnap = await getDoc(programRef)

                  if (programSnap.exists()) {
                    const programData = programSnap.data()
                    programsData.push({
                      id: programSnap.id,
                      organizationName: programData.organizationName,
                      name: programData.name,
                      isActive: programData.isActive
                    })
                  }
                } catch (programError) {
                  console.error(`❌ Error cargando programa ${programId}:`, programError)
                }
              }

              // Agregar negocio con programas completos
              validBusinesses.push({
                ...userBusiness,
                programs: programsData // Array de objetos con datos del programa
              })

              console.log(`✅ Negocio válido encontrado:`, businessDoc.data())
              console.log(`✅ Negocio válido: ${userBusiness.businessName} (Document ID: ${userBusiness.id}, Business ID: ${userBusiness.businessId})`)
              console.log(`📚 Programas encontrados: ${programsData.length}`)
            } else {
              invalidBusinesses.push(userBusiness)
              console.log(`❌ Negocio NO encontrado en colección 'businesses': ${userBusiness.businessId}`)
              console.warn(`⚠️  Negocio inválido: ${userBusiness.businessName} (Document ID: ${userBusiness.id}, Business ID: ${userBusiness.businessId})`)
            }
          } catch (validateError) {
            console.error(`❌ Error validando negocio ${userBusiness.businessId}:`, validateError)
            invalidBusinesses.push(userBusiness)
          }
        }        // Usar solo negocios válidos
        this.userBusinesses = validBusinesses

        // 🔍 DEBUG: Mostrar resultados finales
        console.log(`📊 RESULTADOS DE VALIDACIÓN:`)
        console.log(`✅ Negocios válidos: ${validBusinesses.length}`)
        console.log(`❌ Negocios inválidos: ${invalidBusinesses.length}`)
        console.log(`📋 Array final userBusinesses.length: ${this.userBusinesses.length}`)

        // Advertir sobre negocios inválidos
        if (invalidBusinesses.length > 0) {
          console.warn(`⚠️  ${invalidBusinesses.length} relaciones de negocio inválidas ignoradas`)
          console.log('💡 Usa businessDiagnostics.js para limpiar datos inconsistentes')
        }

        // Guardar en localStorage solo negocios válidos
        localStorage.setItem(STORAGE_KEYS.BUSINESSES, JSON.stringify(this.userBusinesses))

        console.log(`✅ ${this.userBusinesses.length} negocios válidos cargados para usuario ${uid}`)
        return this.userBusinesses
      } catch (error) {
        console.error('❌ Error al cargar negocios del usuario:', error)
        throw new Error('Error al cargar negocios del usuario: ' + error.message)
      }
    },

    // ✅ NUEVO: Cambiar negocio activo
    // TODO tengo que hacer que tambien borre las trasnacciones en el store para que no se mezclen al cambiar de negocio
    switchBusiness(businessId) {
      const business = this.userBusinesses.find(b => b.businessId === businessId)
      if (business) {
        this.currentBusiness = business
        localStorage.setItem(STORAGE_KEYS.CURRENT_BUSINESS, JSON.stringify(business))
        console.log(`🔄 Negocio cambiado a: ${business.businessName}`)
        return true
      }
      console.error(`❌ No se encontró el negocio con ID: ${businessId}`)
      return false
    },

    // ✅ Alias para consistencia con router (método async para compatibilidad)
    async setCurrentBusiness(businessId) {
      return this.switchBusiness(businessId)
    },

    // ✅ NUEVO: Crear relación usuario-negocio
    async addBusinessToUser(uid, businessData) {
      try {
        const newUserBusiness = {
          businessId: businessData.businessId,
          businessName: businessData.businessName,
          rol: businessData.rol,
          permissions: businessData.permissions || {},
          departamento: businessData.departamento || null,
          fechaIngreso: new Date(),
          activo: true,
          esPrincipal: this.userBusinesses.length === 0, // Primer negocio es principal
          estadoInvitacion: 'aceptada'
        }

        // ✅ CORRECCIÓN CRÍTICA: Usar businessId como ID del documento
        // Esto asegura que users/{uid}/businesses/{businessId} coincida con businesses/{businessId}
        const businessRef = doc(db, 'users', uid, 'businesses', businessData.businessId)
        await setDoc(businessRef, newUserBusiness)

        console.log(`✅ Negocio ${businessData.businessName} agregado al usuario con ID: ${businessData.businessId}`)

        // ✅ OPTIMIZACIÓN: Agregar localmente sin revalidar inmediatamente
        // Esto evita problemas de latencia al validar un negocio recién creado
        newUserBusiness.id = businessData.businessId // Usar el businessId como document ID
        this.userBusinesses.push(newUserBusiness)

        // Actualizar localStorage
        localStorage.setItem(STORAGE_KEYS.BUSINESSES, JSON.stringify(this.userBusinesses))

        // Si es el primer negocio, establecerlo como actual
        if (this.userBusinesses.length === 1) {
          this.currentBusiness = this.userBusinesses[0]
          localStorage.setItem(STORAGE_KEYS.CURRENT_BUSINESS, JSON.stringify(this.currentBusiness))
        }

        console.log(`📊 Total de negocios: ${this.userBusinesses.length}`)
        console.log(`🔗 Relación creada: users/${uid}/businesses/${businessData.businessId} ↔ businesses/${businessData.businessId}`)

      } catch (error) {
        console.error('❌ Error al agregar negocio al usuario:', error)
        throw new Error('Error al agregar negocio al usuario: ' + error.message)
      }
    },

    async createUserProfile(userData) {
      this.isLoading = true
      this.error = null

      try {
        const userDocRef = doc(db, 'users', userData.uid)

        const userProfile = {
          uid: userData.uid,
          email: userData.email,
          nombre: userData.nombre || '',
          apellidos: userData.apellidos || '',
          rol: userData.rol || 'business_owner', // ← AGREGADO: Guardar rol (default: business_owner)
          fechaRegistro: userData.fechaRegistro || new Date(),
          activo: true,
          configuracion: userData.configuracion || {
            theme: 'light',
            notifications: true
          }
        }

        await setDoc(userDocRef, userProfile)

        this.userProfile = userProfile
        localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(this.userProfile))

        console.log('✅ Perfil de usuario creado:', userProfile.email, 'Rol:', userProfile.rol)
        return userProfile

      } catch (error) {
        console.error('❌ Error al crear perfil de usuario:', error)
        this.error = 'Error al crear el perfil de usuario'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async updateUserProfile(updates) {
      if (!this.userProfile?.uid) {
        throw new Error('No hay usuario para actualizar')
      }

      this.isLoading = true
      this.error = null

      try {
        const userDocRef = doc(db, 'users', this.userProfile.uid)

        // Actualizar en Firestore
        await updateDoc(userDocRef, updates)

        // Actualizar estado local
        this.userProfile = { ...this.userProfile, ...updates }

        // Actualizar localStorage
        localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(this.userProfile))

        console.log('✅ Perfil de usuario actualizado')
        return this.userProfile

      } catch (error) {
        console.error('❌ Error al actualizar perfil de usuario:', error)
        this.error = 'Error al actualizar el perfil de usuario'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    restoreFromCache() {
      try {
        const cachedProfile = localStorage.getItem(STORAGE_KEYS.PROFILE)
        const cachedBusinesses = localStorage.getItem(STORAGE_KEYS.BUSINESSES)
        const cachedCurrentBusiness = localStorage.getItem(STORAGE_KEYS.CURRENT_BUSINESS)

        if (cachedProfile) {
          this.userProfile = JSON.parse(cachedProfile)
        }

        if (cachedBusinesses) {
          this.userBusinesses = JSON.parse(cachedBusinesses)
        }

        if (cachedCurrentBusiness && this.userBusinesses.length > 0) {
          const parsed = JSON.parse(cachedCurrentBusiness)
          const businessExists = this.userBusinesses.find(b => b.businessId === parsed.businessId)
          if (businessExists) {
            this.currentBusiness = businessExists
          }
        }

        if (cachedProfile || cachedBusinesses) {
          console.log('⚡ Datos de usuario restaurados desde caché')
          return true
        }
        return false
      } catch (error) {
        console.error('❌ Error al restaurar desde caché:', error)
        return false
      }
    },

    clearUserData() {
      this.userProfile = null
      this.userBusinesses = []
      this.currentBusiness = null
      this.error = null

      localStorage.removeItem(STORAGE_KEYS.PROFILE)
      localStorage.removeItem(STORAGE_KEYS.BUSINESSES)
      localStorage.removeItem(STORAGE_KEYS.CURRENT_BUSINESS)

      console.log('🧹 Datos de usuario limpiados')
    },

    updateCurrentBusinessPermissions(newPermissions) {
      if (this.currentBusiness) {
        this.currentBusiness.permissions = { ...this.currentBusiness.permissions, ...newPermissions }
        localStorage.setItem(STORAGE_KEYS.CURRENT_BUSINESS, JSON.stringify(this.currentBusiness))
      }
    }
  }
})