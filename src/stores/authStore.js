import { defineStore } from 'pinia'
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { auth } from '@/firebaseInit'

// Claves de localStorage
const STORAGE_KEYS = {
  AUTH: 'walla_auth',
  PROFILE: 'walla_profile',
  TEMP_BUSINESS: 'walla_temp_business',
  LAST_ROUTE: 'walla_last_route',
  SESSION_TIMESTAMP: 'walla_session_timestamp'
}

// Traducción de errores Firebase
const translateFirebaseError = (errorCode) => {
  const errors = {
    // Errores de login
    'auth/user-not-found': 'Usuario no encontrado',
    'auth/wrong-password': 'Contraseña incorrecta',
    'auth/too-many-requests': 'Demasiados intentos fallidos. Intenta más tarde',
    'auth/network-request-failed': 'Error de conexión. Verifica tu internet',
    'auth/invalid-email': 'Formato de email inválido',
    'auth/user-disabled': 'Esta cuenta ha sido deshabilitada',
    'auth/invalid-credential': 'Credenciales inválidas',

    // Errores de registro
    'auth/email-already-in-use': 'Este correo electrónico ya está registrado',
    'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres',
    'auth/operation-not-allowed': 'El registro no está permitido',
    'auth/invalid-display-name': 'El nombre no es válido'
  }
  return errors[errorCode] || 'Error de autenticación'
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    isAuthenticated: false,
    isLoading: false
  }),

  getters: {
    getUserUid: (state) => state.user?.uid || null,
    getUserEmail: (state) => state.user?.email || null,
    isLoggedIn: (state) => state.isAuthenticated && state.user !== null
  },

  actions: {
    async login(email, password) {
      this.isLoading = true

      try {
        // Autenticación Firebase
        const userCredential = await signInWithEmailAndPassword(auth, email, password)
        const user = userCredential.user

        // Actualizar estado
        this.user = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          emailVerified: user.emailVerified
        }
        this.isAuthenticated = true

        // Guardar en localStorage
        localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify({
          uid: user.uid,
          email: user.email,
          isAuthenticated: true,
          timestamp: Date.now()
        }))

        localStorage.setItem(STORAGE_KEYS.SESSION_TIMESTAMP, Date.now().toString())

        console.log('✅ Usuario autenticado exitosamente:', user.email)
        return user

      } catch (error) {
        console.error('❌ Error en login:', error)
        const translatedError = translateFirebaseError(error.code)
        throw new Error(translatedError)
      } finally {
        this.isLoading = false
      }
    },

    async register(email, password, displayName) {
      this.isLoading = true

      try {
        console.log('🔄 Iniciando registro de usuario...', email)

        // Validaciones básicas
        if (!email || !password || !displayName) {
          throw new Error('Todos los campos son obligatorios')
        }

        if (password.length < 6) {
          throw new Error('La contraseña debe tener al menos 6 caracteres')
        }

        if (displayName.trim().length < 2) {
          throw new Error('El nombre debe tener al menos 2 caracteres')
        }

        // Crear usuario en Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)
        const user = userCredential.user

        // Actualizar perfil con el nombre
        await updateProfile(user, {
          displayName: displayName.trim()
        })

        // Actualizar estado local
        this.user = {
          uid: user.uid,
          email: user.email,
          displayName: displayName.trim(),
          emailVerified: user.emailVerified
        }
        this.isAuthenticated = true

        // Guardar en localStorage
        localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify({
          uid: user.uid,
          email: user.email,
          isAuthenticated: true,
          timestamp: Date.now()
        }))

        localStorage.setItem(STORAGE_KEYS.SESSION_TIMESTAMP, Date.now().toString())

        console.log('✅ Usuario registrado exitosamente:', user.email)
        console.log('👤 Nombre establecido:', displayName.trim())

        return user

      } catch (error) {
        console.error('❌ Error en registro:', error)
        const translatedError = translateFirebaseError(error.code) || error.message
        throw new Error(translatedError)
      } finally {
        this.isLoading = false
      }
    },

    async logout() {
      this.isLoading = true

      try {
        // Cerrar sesión en Firebase
        await signOut(auth)

        // Limpiar estado
        this.user = null
        this.isAuthenticated = false

        // Limpiar localStorage
        localStorage.removeItem(STORAGE_KEYS.AUTH)
        localStorage.removeItem(STORAGE_KEYS.PROFILE)
        localStorage.removeItem(STORAGE_KEYS.TEMP_BUSINESS)
        localStorage.removeItem(STORAGE_KEYS.LAST_ROUTE)
        localStorage.removeItem(STORAGE_KEYS.SESSION_TIMESTAMP)

        console.log('✅ Sesión cerrada exitosamente')

      } catch (error) {
        console.error('❌ Error al cerrar sesión:', error)
        throw new Error('Error al cerrar sesión')
      } finally {
        this.isLoading = false
      }
    },

    async checkUser() {
      try {
        console.log('🔍 Verificando usuario autenticado...');

        // Esperar a que Firebase Auth se inicialice
        await new Promise((resolve) => {
          const unsubscribe = onAuthStateChanged(auth, (user) => {
            unsubscribe();
            resolve(user);
          });
        });

        const currentUser = auth.currentUser;

        if (currentUser) {
          // Usuario realmente autenticado en Firebase
          this.user = {
            uid: currentUser.uid,
            email: currentUser.email
          };
          this.isAuthenticated = true;

          // Actualizar localStorage con sesión válida
          const authData = {
            uid: this.user.uid,
            email: this.user.email,
            isAuthenticated: true,
            timestamp: Date.now()
          };
          localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(authData));

          console.log('✅ Usuario autenticado:', this.user.email);
          return this.user;
        } else {
          // No hay usuario autenticado en Firebase
          console.log('ℹ️ No hay usuario autenticado en Firebase');

          // Limpiar estado local inconsistente
          this.user = null;
          this.isAuthenticated = false;
          this.clearStorage();

          return null;
        }
      } catch (error) {
        console.error('❌ Error al verificar usuario:', error);

        // Limpiar estado en caso de error
        this.user = null;
        this.isAuthenticated = false;
        this.clearStorage();

        throw error;
      }
    },

    async restoreSession() {
      try {
        console.log('🔄 Intentando restaurar sesión...');

        const authData = localStorage.getItem(STORAGE_KEYS.AUTH);
        if (!authData) {
          console.log('ℹ️ No hay datos de sesión en localStorage');
          return false;
        }

        const parsedAuth = JSON.parse(authData);

        // Verificar si los datos no están muy viejos (24 horas)
        const maxAge = 24 * 60 * 60 * 1000; // 24 horas
        if (Date.now() - parsedAuth.timestamp > maxAge) {
          console.log('⏰ Datos de sesión muy antiguos, limpiando...');
          localStorage.removeItem(STORAGE_KEYS.AUTH);
          return false;
        }

        // ✅ CRÍTICO: Verificar con Firebase Auth antes de marcar como autenticado
        const currentUser = await this.checkUser();

        if (currentUser) {
          console.log('✅ Sesión restaurada exitosamente desde localStorage');
          return true;
        } else {
          console.log('❌ La sesión de localStorage no coincide con Firebase Auth');
          return false;
        }
      } catch (error) {
        console.error('❌ Error al restaurar sesión:', error);
        this.clearStorage();
        return false;
      }
    },

    // ✅ NUEVO: Método auxiliar para limpiar storage
    clearStorage() {
      localStorage.removeItem(STORAGE_KEYS.AUTH);
      localStorage.removeItem(STORAGE_KEYS.PROFILE);
      localStorage.removeItem('walla_businesses');
      localStorage.removeItem('walla_current_business');
      localStorage.removeItem(STORAGE_KEYS.TEMP_BUSINESS);
    },

    async initializeAuth() {
      // Intentar restaurar sesión al inicializar
      const sessionRestored = await this.restoreSession();

      return sessionRestored;
    }
  }
})
