import { ref, computed } from 'vue';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import { useRoute } from 'vue-router';
import { doc, setDoc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '@/firebaseInit';
import { useAuthStore } from '@/stores/authStore';

// Importar todas las configuraciones de onboarding
import { onboardingConfigs } from '@/config/onboarding';

/**
 * Composable para gestionar el sistema de onboarding con Driver.js
 * 
 * Proporciona funcionalidades para:
 * - Iniciar tours guiados por vista
 * - Persistir progreso en Firestore
 * - Auto-iniciar en primera visita
 * - Tracking de analytics
 * 
 * @returns {Object} Métodos y estado del onboarding
 */
export function useOnboarding() {
  const route = useRoute();
  const authStore = useAuthStore();

  const driverInstance = ref(null);
  const isActive = ref(false);
  const currentTourData = ref(null);

  /**
   * Obtiene la configuración de onboarding para la ruta actual
   * @returns {Object|null} Configuración del tour o null si no existe
   */
  const getCurrentConfig = () => {
    const routePath = route.path;

    // Buscar configuración que coincida con la ruta
    for (const [key, config] of Object.entries(onboardingConfigs)) {
      if (config.routeMatcher(routePath)) {
        return config;
      }
    }

    return null;
  };

  /**
   * Verifica si el usuario ya completó un tour específico
   * @param {string} tourId - ID del tour
   * @returns {Promise<boolean>}
   */
  const hasCompletedTour = async (tourId) => {
    if (!authStore.user?.uid) return false;

    try {
      const userOnboardingRef = doc(db, 'users', authStore.user.uid, 'settings', 'onboarding');
      const docSnap = await getDoc(userOnboardingRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return data.completedTours?.includes(tourId) || false;
      }

      return false;
    } catch (error) {
      console.error('❌ Error verificando tour completado:', error);
      return false;
    }
  };

  /**
   * Marca un tour como completado en Firestore
   * @param {string} tourId - ID del tour
   */
  const markTourCompleted = async (tourId) => {
    if (!authStore.user?.uid) return;

    try {
      const userOnboardingRef = doc(db, 'users', authStore.user.uid, 'settings', 'onboarding');
      const docSnap = await getDoc(userOnboardingRef);

      const tourData = {
        tourId,
        completedAt: new Date().toISOString(),
        userId: authStore.user.uid,
      };

      if (docSnap.exists()) {
        await updateDoc(userOnboardingRef, {
          completedTours: arrayUnion(tourId),
          lastTourCompleted: tourData,
          updatedAt: new Date().toISOString(),
        });
      } else {
        await setDoc(userOnboardingRef, {
          completedTours: [tourId],
          lastTourCompleted: tourData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }

      console.log(`✅ Tour "${tourId}" marcado como completado`);
    } catch (error) {
      console.error('❌ Error marcando tour como completado:', error);
    }
  };

  /**
   * Registra el inicio de un tour (analytics)
   * @param {string} tourId - ID del tour
   */
  const trackTourStart = async (tourId) => {
    if (!authStore.user?.uid) return;

    try {
      const userOnboardingRef = doc(db, 'users', authStore.user.uid, 'settings', 'onboarding');
      const docSnap = await getDoc(userOnboardingRef);

      const tourStartData = {
        tourId,
        startedAt: new Date().toISOString(),
        userId: authStore.user.uid,
      };

      if (docSnap.exists()) {
        await updateDoc(userOnboardingRef, {
          tourStarts: arrayUnion(tourStartData),
          lastUpdated: new Date().toISOString(),
        });
      } else {
        await setDoc(userOnboardingRef, {
          tourStarts: [tourStartData],
          createdAt: new Date().toISOString(),
        });
      }

      console.log(`📊 Tour "${tourId}" - inicio registrado`);
    } catch (error) {
      console.error('❌ Error registrando inicio de tour:', error);
    }
  };

  /**
   * Inicia el tour de la vista actual
   * @param {boolean} forceRestart - Si es true, reinicia el tour aunque esté completado
   */
  const startTour = async (forceRestart = false) => {
    const config = getCurrentConfig();

    if (!config) {
      console.warn('⚠️ No hay configuración de onboarding para esta ruta');
      return;
    }

    // Verificar si ya se completó (solo si no es forzado)
    if (!forceRestart) {
      const completed = await hasCompletedTour(config.id);
      if (completed) {
        console.log('ℹ️ Tour ya completado, iniciando de nuevo...');
      }
    }

    // Track inicio del tour
    await trackTourStart(config.id);

    // Crear instancia de Driver.js
    driverInstance.value = driver({
      showProgress: true,
      progressText: '{{current}} de {{total}}',
      nextBtnText: 'Siguiente →',
      prevBtnText: '← Anterior',
      doneBtnText: '✓ Finalizar',
      showButtons: ['next', 'previous', 'close'],
      allowClose: true,
      overlayClickNext: false,
      overlayOpacity: 0.2,

      // ✅ Callback cuando se hace clic en "Siguiente" o "Finalizar"
      onNextClick: (element, step, { config: driverConfig, state, driver }) => {
        const isLastStep = state?.activeIndex === config.steps.length - 1;

        if (isLastStep) {
          // Es el último paso, marcar como completado y cerrar
          console.log('🎉 ¡Tour completado!');
          markTourCompleted(config.id);
          driver.destroy(); // ✅ Cerrar el tour
        } else {
          // No es el último paso, continuar normalmente
          driver.moveNext();
        }
      },

      // ✅ Callback cuando se hace clic en cerrar (X)
      onCloseClick: (element, step, { config: driverConfig, state, driver }) => {
        console.log('🔴 Tour cerrado manualmente');
        driver.destroy();
      },

      // ✅ Callback cuando se inicia la destrucción
      onDestroyStarted: (element, step, { config: driverConfig, state }) => {
        console.log('🔄 Iniciando destrucción del tour...');
        isActive.value = false;
      },

      // ✅ Callback cuando ya se destruyó completamente
      onDestroyed: (element, step, { config: driverConfig, state }) => {
        console.log('✅ Tour destruido completamente');
        isActive.value = false;
        currentTourData.value = null;
        driverInstance.value = null;
      },

      onPopoverRender: (popover, { config: driverConfig, state }) => {
        const totalSteps = config.steps?.length || 0;
        const currentStep = (state?.activeIndex ?? -1) + 1;
        if (totalSteps > 0 && currentStep > 0) {
          console.log(`📍 Paso ${currentStep} de ${totalSteps}`);
        }
      },

      // Aplicar configuración específica del tour
      ...config.driverConfig,
      steps: config.steps,
    });

    currentTourData.value = config;
    isActive.value = true;

    // Iniciar el tour
    driverInstance.value.drive();
  };

  /**
   * Detiene el tour actual de forma segura
   */
  const stopTour = () => {
    if (driverInstance.value) {
      try {
        driverInstance.value.destroy();
      } catch (error) {
        console.warn('⚠️ Error al destruir tour:', error);
      }

      // Limpiar todo el estado
      driverInstance.value = null;
      isActive.value = false;
      currentTourData.value = null;
    }
  };

  /**
   * Verifica si hay tour disponible para la ruta actual
   */
  const hasTourForCurrentRoute = computed(() => {
    return getCurrentConfig() !== null;
  });

  /**
   * Auto-inicia el tour en la primera visita
   * Debe llamarse en onMounted de cada vista
   */
  const autoStartIfFirstVisit = async () => {
    const config = getCurrentConfig();
    if (!config || !config.autoStart) return;

    const completed = await hasCompletedTour(config.id);
    if (!completed) {
      // Esperar un poco para que se cargue completamente la página
      setTimeout(() => {
        startTour();
      }, 1500);
    }
  };

  /**
   * Obtiene estadísticas del usuario sobre tours
   * @returns {Promise<Object>}
   */
  const getUserTourStats = async () => {
    if (!authStore.user?.uid) return null;

    try {
      const userOnboardingRef = doc(db, 'users', authStore.user.uid, 'settings', 'onboarding');
      const docSnap = await getDoc(userOnboardingRef);

      if (docSnap.exists()) {
        return docSnap.data();
      }

      return null;
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas de tours:', error);
      return null;
    }
  };

  return {
    // Estado
    isActive,
    hasTourForCurrentRoute,
    currentTourData,

    // Métodos principales
    startTour,
    stopTour,
    autoStartIfFirstVisit,

    // Métodos de verificación
    hasCompletedTour,
    getCurrentConfig,
    getUserTourStats,
  };
}
