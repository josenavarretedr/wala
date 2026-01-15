import { ref, computed } from 'vue';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import '@/assets/css/onboarding.css'; // ✅ Importar estilos personalizados
import { useRoute } from 'vue-router';
import { doc, setDoc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '@/firebaseInit';
import { useAuthStore } from '@/stores/authStore';
import { useBusinessStore } from '@/stores/businessStore';

// Importar todas las configuraciones de onboarding
import { onboardingConfigs } from '@/config/onboarding';

// ✅ Importar iconos de Iconoir dinámicamente
import * as IconoirIcons from '@iconoir/vue';

/**
 * Helper: Obtiene el path SVG de un ícono de Iconoir
 * @param {string} iconName - Nombre del ícono
 * @returns {string} - Código SVG del ícono
 */
const getIconoirPath = (iconName) => {
  const iconPaths = {
    'Rocket': '<path d="M16.061 10.404 14 14.5l-4.5-4.5 4.096-2.061a.5.5 0 0 1 .542.045c.712.54 1.44 1.31 1.878 1.878a.5.5 0 0 1 .045.542ZM10 17l2-1M14 7l-1 2" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/><path d="M7 12a2 2 0 1 1 0 4 2 2 0 0 1 0-4Zm5 5a2 2 0 1 1 0 4 2 2 0 0 1 0-4Zm6.5-9.5c1-3.5-2-7-5.5-6s-4.842 4.5-4.842 4.5m0 0L2 12m16 6 5.158-5.158" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>',
    'AppWindow': '<path d="M2 19V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2Z" stroke="currentColor" stroke-width="1.5"/><path d="M2 7h20M9 21V7" stroke="currentColor" stroke-width="1.5"/>',
    'BarChart': '<path d="M3 20V12m6.5 8V6M16 20v-4m5.5 4v-9" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>',
    'List': '<path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01m-.01 6h.01m-.01 6h.01" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>',
    'Target': '<path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>',
    'BookStack': '<path d="M5 19.5V5a2 2 0 0 1 2-2h11.4a.6.6 0 0 1 .6.6v13.114M5 19.5v-3m0 3h13M5 16.5h13m0 0v3m0-3a2 2 0 0 1 2-2v0m-15 0a2 2 0 0 0-2-2v0m2-7h10.4a.6.6 0 0 1 .6.6v1.9" stroke="currentColor" stroke-linecap="round"/>',
    'Plus': '<path d="M6 12h6m6 0h-6m0 0V6m0 6v6" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>',
    'DatabaseScriptPlus': '<path d="M22 14V8.5M6 13V6C6 4.34315 7.34315 3 9 3H14" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/><path d="M16.9922 4H19.9922M22.9922 4L19.9922 4M19.9922 4V1M19.9922 4V7" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 21H6C3.79086 21 2 19.2091 2 17C2 14.7909 3.79086 13 6 13H17H18C15.7909 13 14 14.7909 14 17C14 19.2091 15.7909 21 18 21C20.2091 21 22 19.2091 22 17V14" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>',
    'FireFlame': '<path d="M8 18C8 20.4148 9.79086 21 12 21C15.7587 21 17 18.5 14.5 13.5C11 18 10.5 11 11 9C9.5 12 8 14.8177 8 18Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 21C17.0495 21 20 18.0956 20 13.125C20 8.15444 12 3 12 3C12 3 4 8.15444 4 13.125C4 18.0956 6.95054 21 12 21Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>',
    'SafeOpen': '<path d="M3 19V5C3 3.89543 3.89543 3 5 3H13C14.1046 3 15 3.89543 15 5V19C15 20.1046 14.1046 21 13 21H5C3.89543 21 3 20.1046 3 19Z" stroke="currentColor"/><path d="M13 3H19C20.1046 3 21 3.89543 21 5V19C21 20.1046 20.1046 21 19 21H13" stroke="currentColor"/><path d="M7.5 15C6.67157 15 6 13.6569 6 12C6 10.3431 6.67157 9 7.5 9C8.32843 9 9 10.3431 9 12C9 13.6569 8.32843 15 7.5 15Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/><path d="M13 14L13 10" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/><path d="M8.5 9.5L9.5 8.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/><path d="M6.5 9.5L5.5 8.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/><path d="M5.5 15.5L6.5 14.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/><path d="M9.5 15.5L8.5 14.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/><path d="M2 8L3 8" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/><path d="M2 6L3 6" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/><path d="M3 16H2" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/><path d="M3 18H2" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>'
  };

  return iconPaths[iconName] || iconPaths['Rocket']; // Default a Rocket
};

/**
 * Composable para gestionar el sistema de onboarding con Driver.js
 * 
 * Proporciona funcionalidades para:
 * - Iniciar tours guiados por vista
 * - Persistir progreso en Firestore por negocio
 * - Auto-iniciar en primera visita
 * - Tracking de analytics
 * 
 * @returns {Object} Métodos y estado del onboarding
 */
export function useOnboarding() {
  const route = useRoute();
  const authStore = useAuthStore();
  const businessStore = useBusinessStore();

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
   * Verifica si el usuario ya completó un tour específico en el negocio actual
   * @param {string} tourId - ID del tour
   * @returns {Promise<boolean>}
   */
  const hasCompletedTour = async (tourId) => {
    const businessId = businessStore.getBusinessId;

    if (!authStore.user?.uid || !businessId) {
      console.warn('⚠️ No hay usuario o negocio activo');
      return false;
    }

    try {
      const onboardingRef = doc(db, 'businesses', businessId, 'settings', 'onboarding');
      const docSnap = await getDoc(onboardingRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        // Verificar si este usuario completó este tour en este negocio
        const userCompletions = data.completedTours?.[authStore.user.uid] || [];
        return userCompletions.includes(tourId);
      }

      return false;
    } catch (error) {
      console.error('❌ Error verificando tour completado:', error);
      return false;
    }
  };

  /**
   * Marca un tour como completado en Firestore para el negocio actual
   * @param {string} tourId - ID del tour
   */
  const markTourCompleted = async (tourId) => {
    const businessId = businessStore.getBusinessId;

    if (!authStore.user?.uid || !businessId) {
      console.warn('⚠️ No hay usuario o negocio activo para marcar tour completado');
      return;
    }

    try {
      const onboardingRef = doc(db, 'businesses', businessId, 'settings', 'onboarding');
      const docSnap = await getDoc(onboardingRef);

      const tourData = {
        tourId,
        completedAt: new Date().toISOString(),
        userId: authStore.user.uid,
        businessId,
      };

      if (docSnap.exists()) {
        // Actualizar documento existente
        const currentData = docSnap.data();
        const userCompletions = currentData.completedTours?.[authStore.user.uid] || [];

        // Evitar duplicados
        if (!userCompletions.includes(tourId)) {
          await updateDoc(onboardingRef, {
            [`completedTours.${authStore.user.uid}`]: arrayUnion(tourId),
            'lastTourCompleted': tourData,
            'updatedAt': new Date().toISOString(),
          });
        }
      } else {
        // Crear nuevo documento con onboarding
        await setDoc(onboardingRef, {
          completedTours: {
            [authStore.user.uid]: [tourId]
          },
          lastTourCompleted: tourData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }, { merge: true }); // merge: true para no sobrescribir otros campos
      }

      console.log(`✅ Tour "${tourId}" marcado como completado en negocio "${businessId}"`);
    } catch (error) {
      console.error('❌ Error marcando tour como completado:', error);
    }
  };

  /**
   * Registra el inicio de un tour (analytics) en el negocio actual
   * @param {string} tourId - ID del tour
   */
  const trackTourStart = async (tourId) => {
    const businessId = businessStore.getBusinessId;

    if (!authStore.user?.uid || !businessId) {
      console.warn('⚠️ No hay usuario o negocio activo para registrar inicio de tour');
      return;
    }

    try {
      const onboardingRef = doc(db, 'businesses', businessId, 'settings', 'onboarding');
      const docSnap = await getDoc(onboardingRef);

      const tourStartData = {
        tourId,
        startedAt: new Date().toISOString(),
        userId: authStore.user.uid,
        businessId,
      };

      if (docSnap.exists()) {
        // Documento existe, actualizar
        await updateDoc(onboardingRef, {
          'tourStarts': arrayUnion(tourStartData),
          'lastUpdated': new Date().toISOString(),
        });
      } else {
        // Documento no existe, crear con merge
        await setDoc(onboardingRef, {
          tourStarts: [tourStartData],
          lastUpdated: new Date().toISOString(),
        }, { merge: true });
      }

      console.log(`📊 Tour "${tourId}" - inicio registrado en negocio "${businessId}"`);
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
      nextBtnText: '<span class="btn-text">Siguiente</span><span class="btn-icon">→</span>',
      prevBtnText: '<span class="btn-icon">←</span><span class="btn-text">Anterior</span>',
      doneBtnText: '<span class="btn-text">Finalizar</span><span class="btn-icon">✓</span>',
      showButtons: ['next', 'previous', 'close'],
      allowClose: true,
      overlayClickNext: false,
      overlayOpacity: 0.1, // ✅ Overlay más ligero
      popoverClass: 'wala-theme', // ✅ Aplicar tema WALA

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

        // ✅ RENDERIZAR ÍCONO DINÁMICO DE ICONOIR O IMAGEN
        const currentStepData = config.steps?.[state?.activeIndex];

        if (currentStepData?.iconName && popover?.title) {
          const titleElement = popover.title;
          const iconName = currentStepData.iconName;
          const iconColor = currentStepData.iconColor || 'blue';
          const iconType = currentStepData.iconType || 'svg';

          // Si es una imagen, crear elemento img
          if (iconType === 'image' && currentStepData.iconPath) {
            const iconWrapper = document.createElement('div');
            iconWrapper.className = 'icon-wrapper';

            const iconImg = document.createElement('img');
            // Convertir rutas @/ a rutas relativas desde src
            let imagePath = currentStepData.iconPath;
            if (imagePath.startsWith('@/')) {
              imagePath = imagePath.replace('@/', '/src/');
            }

            // Usar import dinámico para Vite
            try {
              const modules = import.meta.glob('@/assets/**/*.{png,jpg,jpeg,svg,webp}', { eager: true });
              const moduleKey = currentStepData.iconPath.replace('@', '.');
              if (modules[moduleKey]) {
                iconImg.src = modules[moduleKey].default || modules[moduleKey];
              } else {
                // Fallback: intentar ruta directa
                iconImg.src = imagePath;
              }
            } catch (e) {
              iconImg.src = imagePath;
            }

            iconImg.alt = iconName || 'Icon';
            iconImg.style.width = '32px';
            iconImg.style.height = '32px';
            iconImg.style.objectFit = 'contain';

            iconWrapper.appendChild(iconImg);

            // Insertar ícono antes del texto del título
            if (titleElement.firstChild) {
              titleElement.insertBefore(iconWrapper, titleElement.firstChild);
            }
            return;
          }

          // Obtener el componente de ícono de Iconoir
          const IconComponent = IconoirIcons[iconName];

          if (IconComponent && titleElement) {
            // Crear wrapper para el ícono
            const iconWrapper = document.createElement('div');
            iconWrapper.className = 'icon-wrapper';

            // Crear elemento SVG desde el componente Vue
            const iconSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            iconSvg.setAttribute('width', '20');
            iconSvg.setAttribute('height', '20');
            iconSvg.setAttribute('stroke-width', '1.5');
            iconSvg.setAttribute('fill', 'none');
            iconSvg.setAttribute('stroke', 'currentColor');
            iconSvg.setAttribute('viewBox', '0 0 24 24');

            // Obtener paths del componente (simplificado - usar SVG básico)
            // Por ahora usamos un ícono genérico, idealmente renderizaríamos el componente Vue
            iconSvg.innerHTML = getIconoirPath(iconName);

            iconWrapper.appendChild(iconSvg);

            // Aplicar variante de color
            if (iconColor === 'success') {
              popover.wrapper.classList.add('wala-success');
            } else if (iconColor === 'purple') {
              popover.wrapper.classList.add('wala-purple');
            } else if (iconColor === 'warning') {
              popover.wrapper.classList.add('wala-warning');
            } else if (iconColor.startsWith('#')) {
              // Si es un color hexadecimal, aplicarlo directamente
              iconSvg.style.color = iconColor;
              iconWrapper.style.backgroundColor = `${iconColor}15`; // 15 = ~8% opacity
            }

            // Insertar ícono antes del texto del título
            if (titleElement.firstChild) {
              titleElement.insertBefore(iconWrapper, titleElement.firstChild);
            }
          }
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
   * Obtiene estadísticas de tours del negocio actual
   * @returns {Promise<Object>}
   */
  const getUserTourStats = async () => {
    const businessId = businessStore.getBusinessId;

    if (!authStore.user?.uid || !businessId) {
      console.warn('⚠️ No hay usuario o negocio activo para obtener estadísticas');
      return null;
    }

    try {
      const onboardingRef = doc(db, 'businesses', businessId, 'settings', 'onboarding');
      const docSnap = await getDoc(onboardingRef);

      if (docSnap.exists()) {
        const data = docSnap.data();

        // Filtrar datos para el usuario actual
        return {
          completedTours: data.completedTours?.[authStore.user.uid] || [],
          allTourStarts: data.tourStarts || [],
          userTourStarts: data.tourStarts?.filter(ts => ts.userId === authStore.user.uid) || [],
          lastTourCompleted: data.lastTourCompleted,
          businessId: businessId,
        };
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
