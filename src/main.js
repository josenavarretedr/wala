import { createApp } from 'vue'
import './style.css'
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
    // Intentar restaurar sesión (ahora incluye validación con Firebase)
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
