import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import { seedInitialData } from './services/db/indexedDB';
import { registerSW } from 'virtual:pwa-register';

// Estilos globales con Tailwind CSS
import './assets/main.css';

// Registrar Service Worker PWA para soporte Offline-First
const updateSW = registerSW({
  onNeedRefresh() {
    console.info('[PWA] Nueva versión disponible. Lista para actualizar.');
  },
  onOfflineReady() {
    console.info('[PWA] Aplicación lista para funcionar 100% offline.');
  },
  onRegisteredSW(swScriptUrl, registration) {
    console.info('[PWA] Service Worker registrado activamente desde:', swScriptUrl);
  },
  onRegisterError(error) {
    console.error('[PWA] Error al registrar el Service Worker:', error);
  },
  immediate: true
});

async function bootstrap() {
  const app = createApp(App);
  const pinia = createPinia();

  app.use(pinia);
  app.use(router);

  // Inicializar almacenamiento local y datos semilla offline
  try {
    await seedInitialData();
  } catch (err) {
    console.warn('[IndexedDB] No se pudieron inicializar los datos semilla:', err);
  }

  app.mount('#app');
}

bootstrap();
