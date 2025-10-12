import { createApp } from 'vue'
import './style.css'
import './assets/css/dashboard.css'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'

// Stores
import { useAuthStore } from '@/stores/authStore'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

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
  } finally {
    // Montar la app siempre
    app.mount('#app');
    console.log('🎉 Walla iniciado correctamente');
  }
};

initApp();

