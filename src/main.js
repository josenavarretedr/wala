import { createApp } from 'vue'
import './style.css'
import './assets/css/dashboard.css'
import './assets/css/onboarding.css'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import * as Sentry from '@sentry/vue'

// Stores
import { useAuthStore } from '@/stores/authStore'

const app = createApp(App)
const pinia = createPinia()

// 🛡️ CONFIGURACIÓN DE SENTRY
Sentry.init({
  app,
  dsn: "https://6cb6cbdaaac2be7c1309c65025cd0ede@o4510701856227328.ingest.us.sentry.io/4510701857669120",

  // Integración con Vue Router (captura errores de navegación)
  integrations: [
    Sentry.browserTracingIntegration({ router }),
    Sentry.replayIntegration({
      maskAllText: false, // Graba texto real (cambia a true en producción si hay datos sensibles)
      blockAllMedia: false,
    }),
    Sentry.feedbackIntegration({
      colorScheme: "light",
      autoInject: true,
      showBranding: false,
    }),
  ],

  // Captura información del usuario (IP, headers)
  sendDefaultPii: true,

  // Seguimiento de rendimiento
  tracesSampleRate: import.meta.env.PROD ? 0.3 : 1.0, // Menos trazas en producción

  // Session Replay (graba la sesión cuando hay un error)
  replaysSessionSampleRate: 0.1, // 10% de sesiones normales
  replaysOnErrorSampleRate: 1.0, // 100% cuando hay error

  // Configuración de ambiente
  environment: import.meta.env.MODE, // "development" o "production"
  release: '1.0.0', // Versión de tu app

  // 🔧 Filtrar y enriquecer eventos antes de enviarlos
  beforeSend(event, hint) {
    // Ignorar errores de extensiones del navegador
    if (event.exception) {
      const error = hint.originalException;
      if (error && error.message) {
        // Filtrar errores de extensiones
        if (error.message.includes('chrome-extension://') ||
          error.message.includes('moz-extension://')) {
          return null; // No enviar a Sentry
        }
      }
    }

    // Agregar tags personalizados
    event.tags = {
      ...event.tags,
      app: 'walla',
      version: '1.0.0',
    };

    return event;
  },

  // 🚫 Ignorar errores específicos conocidos
  ignoreErrors: [
    'Non-Error promise rejection captured',
    'ResizeObserver loop limit exceeded',
    'ResizeObserver loop completed with undelivered notifications',
    'Network request failed',
    'Failed to fetch',
    'NetworkError when attempting to fetch resource',
    'Load failed',
  ],
});

// Plugin de Pinia para capturar el estado en los errores
pinia.use(Sentry.createSentryPiniaPlugin())

app.use(pinia)
app.use(router)

// 🛡️ Manejador global de promesas rechazadas no capturadas
window.addEventListener('unhandledrejection', (event) => {
  console.error('❌ Promise rechazada no capturada:', event.reason);
  Sentry.captureException(event.reason, {
    tags: { type: 'unhandled-rejection' },
  });
});

// ✅ INICIALIZACIÓN CORREGIDA
const authStore = useAuthStore()

// Intentar restaurar sesión y montar la app
const initApp = async () => {
  console.log('🚀 Inicializando Walla...');

  try {
    // Restaurar la sesión silenciosamente (sin loader)
    // El loader se mostrará cuando el router cargue el negocio
    const sessionRestored = await authStore.restoreSession();

    if (sessionRestored) {
      console.log('✅ Sesión válida encontrada');
    } else {
      console.log('ℹ️ No hay sesión válida previa');
    }

  } catch (error) {
    console.error('❌ Error al inicializar:', error);
    // 🛡️ Capturar error de inicialización en Sentry
    Sentry.captureException(error, {
      tags: {
        phase: 'app-init',
        critical: true,
      },
      contexts: {
        initialization: {
          step: 'session-restore',
          timestamp: Date.now(),
        },
      },
    });
  } finally {
    // Montar la app siempre
    app.mount('#app');
    console.log('🎉 Walla iniciado correctamente');
  }
};

initApp();

// 🔠 Transformar automáticamente todos los inputs de tipo texto a mayúsculas
const transformToUppercase = (event) => {
  if (event.isComposing) return;
  const target = event.target;
  if (
    target &&
    target.tagName === 'INPUT' &&
    (target.type === 'text' || !target.getAttribute('type'))
  ) {
    const originalValue = target.value;
    const upperValue = originalValue.toUpperCase();
    
    if (originalValue !== upperValue) {
      try {
        const start = target.selectionStart;
        const end = target.selectionEnd;
        
        target.value = upperValue;
        
        if (start !== null && end !== null) {
          target.setSelectionRange(start, end);
        }
      } catch (e) {
        target.value = upperValue;
      }
    }
  }
};

window.addEventListener('input', transformToUppercase, true);
window.addEventListener('change', transformToUppercase, true);
window.addEventListener('compositionend', transformToUppercase, true);



