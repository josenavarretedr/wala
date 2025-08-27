// authStore.js - Solo estado reactivo y persistencia localStorage
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth';

export const useAuthStore = defineStore('auth', () => {
  // 🗄️ Estado reactivo
  const user = ref(null);
  const isLoading = ref(false);
  const error = ref(null);
  const lastSession = ref(null);

  // 🔧 Composables
  const router = useRouter();
  const authComposable = useAuth();

  // 📊 Estado computado
  const isAuthenticated = computed(() => !!user.value);
  const hasValidSession = computed(() => {
    if (!user.value || !lastSession.value) return false;

    // Verificar que la sesión no sea muy antigua (24 horas)
    const sessionAge = Date.now() - lastSession.value.timestamp;
    const maxAge = 24 * 60 * 60 * 1000; // 24 horas

    return sessionAge < maxAge;
  });

  // 🏪 LocalStorage keys
  const STORAGE_KEYS = {
    USER: 'wala_user',
    SESSION: 'wala_session',
    BUSINESS: 'wala_current_business'
  };

  // 💾 FUNCIONES DE PERSISTENCIA

  // Guardar en localStorage
  function saveToStorage(userData) {
    try {
      if (userData) {
        const sessionData = {
          timestamp: Date.now(),
          userUid: userData.uid
        };

        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
        localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(sessionData));

        console.log('💾 Datos guardados en localStorage');
      }
    } catch (error) {
      console.error('❌ Error guardando en localStorage:', error);
    }
  }

  // Cargar desde localStorage
  function loadFromStorage() {
    try {
      const userData = localStorage.getItem(STORAGE_KEYS.USER);
      const sessionData = localStorage.getItem(STORAGE_KEYS.SESSION);

      if (userData && sessionData) {
        const parsedUser = JSON.parse(userData);
        const parsedSession = JSON.parse(sessionData);

        // Verificar que la sesión no sea muy antigua
        const sessionAge = Date.now() - parsedSession.timestamp;
        const maxAge = 24 * 60 * 60 * 1000; // 24 horas

        if (sessionAge < maxAge) {
          console.log('💾 Sesión válida encontrada en localStorage');
          return { user: parsedUser, session: parsedSession };
        } else {
          console.log('⏰ Sesión expirada en localStorage');
          clearStorage();
          return null;
        }
      }
      return null;
    } catch (error) {
      console.error('❌ Error cargando desde localStorage:', error);
      clearStorage();
      return null;
    }
  }

  // Limpiar localStorage
  function clearStorage() {
    try {
      localStorage.removeItem(STORAGE_KEYS.USER);
      localStorage.removeItem(STORAGE_KEYS.SESSION);
      localStorage.removeItem(STORAGE_KEYS.BUSINESS);
      console.log('🧹 LocalStorage limpiado');
    } catch (error) {
      console.error('❌ Error limpiando localStorage:', error);
    }
  }

  // 🔐 ACCIONES DE AUTENTICACIÓN (usan composables)

  // Login con email y password
  async function login(email, password) {
    try {
      setLoading(true);
      clearError();

      console.log('🔄 Iniciando login desde store...');

      const userData = await authComposable.loginWithEmail(email, password);
      setUser(userData);
      saveToStorage(userData);

      console.log('✅ Login completado en store');
      return userData;

    } catch (error) {
      console.error('❌ Error en login (store):', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  // Registro con email, password y nombre
  async function register(email, password, displayName) {
    try {
      setLoading(true);
      clearError();

      console.log('🔄 Iniciando registro desde store...');

      const userData = await authComposable.registerWithEmail(email, password, displayName);
      setUser(userData);
      saveToStorage(userData);

      console.log('✅ Registro completado en store');
      return userData;

    } catch (error) {
      console.error('❌ Error en registro (store):', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  // Login con Google
  async function loginWithGoogle() {
    try {
      setLoading(true);
      clearError();

      console.log('🔄 Iniciando login con Google desde store...');

      const userData = await authComposable.loginWithGoogle();
      setUser(userData);
      saveToStorage(userData);

      console.log('✅ Login con Google completado en store');
      return userData;

    } catch (error) {
      console.error('❌ Error en login con Google (store):', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  // Logout
  async function logout() {
    try {
      setLoading(true);

      console.log('🔄 Cerrando sesión desde store...');

      await authComposable.logoutUser();
      clearUser();
      clearStorage();

      // Redirigir al login
      await router.push('/auth/login');

      console.log('✅ Logout completado en store');

    } catch (error) {
      console.error('❌ Error en logout (store):', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  // 🔍 VERIFICACIÓN Y RESTAURACIÓN DE SESIÓN

  // Verificar usuario actual con Firebase
  async function checkUser() {
    try {
      console.log('🔍 Verificando usuario actual...');

      const userData = await authComposable.checkAuthState();

      if (userData) {
        setUser(userData);
        saveToStorage(userData);
        console.log('✅ Usuario verificado y sincronizado');
        return userData;
      } else {
        clearUser();
        clearStorage();
        console.log('ℹ️ No hay usuario autenticado');
        return null;
      }

    } catch (error) {
      console.error('❌ Error verificando usuario:', error);
      clearUser();
      clearStorage();
      throw error;
    }
  }

  // Restaurar sesión desde localStorage + verificación Firebase
  async function restoreSession() {
    try {
      setLoading(true);
      console.log('🔄 Restaurando sesión...');

      // 1. Verificar localStorage
      const storageData = loadFromStorage();

      if (storageData) {
        console.log('💾 Datos encontrados en localStorage');

        // 2. Verificar con Firebase
        const firebaseUser = await authComposable.checkAuthState();

        if (firebaseUser && firebaseUser.uid === storageData.user.uid) {
          // Sincronizar datos (Firebase es la fuente de verdad)
          setUser(firebaseUser);
          setSession(storageData.session);
          saveToStorage(firebaseUser);

          console.log('✅ Sesión restaurada y sincronizada');
          return firebaseUser;
        } else {
          console.log('⚠️ Inconsistencia entre localStorage y Firebase');
          clearUser();
          clearStorage();
          return null;
        }
      } else {
        // 3. Si no hay localStorage, verificar solo Firebase
        const firebaseUser = await authComposable.checkAuthState();

        if (firebaseUser) {
          setUser(firebaseUser);
          saveToStorage(firebaseUser);
          console.log('✅ Sesión restaurada desde Firebase');
          return firebaseUser;
        } else {
          console.log('ℹ️ No hay sesión para restaurar');
          return null;
        }
      }

    } catch (error) {
      console.error('❌ Error restaurando sesión:', error);
      clearUser();
      clearStorage();
      return null;
    } finally {
      setLoading(false);
    }
  }

  // 🔧 FUNCIONES AUXILIARES DE ESTADO

  // Establecer usuario
  function setUser(userData) {
    user.value = userData;
    const sessionData = {
      timestamp: Date.now(),
      userUid: userData?.uid
    };
    lastSession.value = sessionData;
  }

  // Establecer sesión
  function setSession(sessionData) {
    lastSession.value = sessionData;
  }

  // Limpiar usuario
  function clearUser() {
    user.value = null;
    lastSession.value = null;
  }

  // Establecer loading
  function setLoading(loading) {
    isLoading.value = loading;
  }

  // Establecer error
  function setError(errorMessage) {
    error.value = errorMessage;
  }

  // Limpiar error
  function clearError() {
    error.value = null;
  }

  // 🎯 Return del store
  return {
    // Estado
    user,
    isLoading,
    error,
    lastSession,

    // Computed
    isAuthenticated,
    hasValidSession,

    // Acciones principales
    login,
    register,
    loginWithGoogle,
    logout,

    // Verificación y restauración
    checkUser,
    restoreSession,

    // Utilidades
    setUser,
    clearUser,
    setLoading,
    setError,
    clearError,
    clearStorage
  };
});
