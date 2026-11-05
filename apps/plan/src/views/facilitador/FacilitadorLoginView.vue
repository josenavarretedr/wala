<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import {
  signInFacilitatorWithGoogle,
  signInAsDevFacilitator,
  getCurrentFacilitator,
  waitForFacilitatorAuthReady
} from '@/services/auth/facilitatorAuth';
import { isEmulatorActive } from '@/services/firebase';

const router = useRouter();
const route = useRoute();

const isCheckingAuth = ref(true);
const isLoading = ref(false);
const errorMessage = ref('');

const isDevMode = ref(import.meta.env.DEV || isEmulatorActive);

onMounted(async () => {
  try {
    const current = await waitForFacilitatorAuthReady(1200);
    if (current && current.isAuthorized) {
      const redirect = route.query.redirect || '/facilitador';
      router.replace(redirect);
      return;
    }
  } catch (err) {
    console.warn('[FacilitadorLogin] Error verificando sesión inicial:', err);
  } finally {
    isCheckingAuth.value = false;
  }
});

async function handleGoogleLogin() {
  isLoading.value = true;
  errorMessage.value = '';

  try {
    const { user, isAuthorized } = await signInFacilitatorWithGoogle();
    if (isAuthorized) {
      const redirect = route.query.redirect || '/facilitador';
      router.push(redirect);
    }
  } catch (err) {
    console.error('Error al iniciar sesión con Google:', err);
    errorMessage.value =
      err.message || 'No fue posible iniciar sesión con Google. Inténtalo nuevamente.';
  } finally {
    isLoading.value = false;
  }
}

async function handleDevLogin() {
  isLoading.value = true;
  errorMessage.value = '';

  try {
    await signInAsDevFacilitator('josenavarretedr@gmail.com');
    const redirect = route.query.redirect || '/facilitador';
    router.push(redirect);
  } catch (err) {
    errorMessage.value = err.message || 'Error en acceso simulado de desarrollo.';
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <div class="min-h-screen flex flex-col justify-between bg-slate-900 px-4 py-8 max-w-lg mx-auto w-full text-slate-100">
    <!-- Cabecera Institucional -->
    <header class="flex items-center justify-between pt-safe">
      <div class="flex items-center gap-2">
        <div class="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md font-bold text-lg">
          🌱
        </div>
        <span class="font-extrabold text-white tracking-tight text-lg">PlanSeed Facilitador</span>
      </div>

      <router-link
        to="/login"
        class="text-xs text-slate-400 hover:text-white transition-colors flex items-center gap-1"
      >
        <span>←</span>
        <span>Ingreso Emprendedor</span>
      </router-link>
    </header>

    <!-- Contenido Principal -->
    <main class="my-auto py-8">
      <div class="text-center mb-8">
        <span class="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-500/20 text-blue-400 border border-blue-500/30 mb-3">
          Módulo de Aula y Consultoría
        </span>
        <h1 class="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Consola del Facilitador
        </h1>
        <p class="text-slate-400 text-sm mt-2 max-w-sm mx-auto">
          Supervisión en tiempo real, gestión de cohortes y validación técnica de planes de negocio.
        </p>
      </div>

      <!-- Estado de Verificación Inicial de Sesión -->
      <div
        v-if="isCheckingAuth"
        class="bg-slate-800/90 border border-slate-700/80 rounded-3xl p-10 shadow-2xl text-center space-y-4"
      >
        <div class="inline-block w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p class="text-sm font-medium text-slate-300">Verificando credenciales de facilitador...</p>
      </div>

      <!-- Tarjeta de Login -->
      <div
        v-else
        class="bg-slate-800/90 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6"
      >
        <!-- Error Banner -->
        <div
          v-if="errorMessage"
          class="p-3.5 bg-rose-500/20 border border-rose-500/40 text-rose-300 rounded-2xl text-xs leading-relaxed"
        >
          ⚠️ {{ errorMessage }}
        </div>

        <!-- Botón Principal: Google Sign In -->
        <button
          type="button"
          :disabled="isLoading"
          @click="handleGoogleLogin"
          class="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-white text-slate-900 font-bold text-sm sm:text-base hover:bg-slate-100 active:scale-[0.99] transition-all shadow-lg min-h-[52px] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <!-- Google SVG Logo -->
          <svg class="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
          <span>{{ isLoading ? 'Conectando con Google...' : 'Ingresar como Facilitador con Google' }}</span>
        </button>

        <!-- Botón de Modo Emulador / Desarrollo -->
        <div v-if="isDevMode" class="pt-4 border-t border-slate-700/60">
          <p class="text-[11px] text-slate-400 text-center mb-2.5 font-medium">
            Entorno de pruebas local detectado (DEV / Emulador):
          </p>
          <button
            type="button"
            :disabled="isLoading"
            @click="handleDevLogin"
            class="w-full py-3 px-4 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/40 text-blue-300 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span>🚀</span>
            <span>Acceso Rápido como Facilitador (josenavarretedr@gmail.com)</span>
          </button>
        </div>

        <!-- Información de Seguridad -->
        <div class="text-[11px] text-slate-400 space-y-1.5 bg-slate-900/50 p-3.5 rounded-2xl border border-slate-700/40">
          <p class="font-bold text-slate-300 flex items-center gap-1.5">
            <span>🔒</span>
            <span>Acceso Restringido</span>
          </p>
          <p>
            Solo los correos registrados en la lista blanca institucional (ONG / Cooperación) están autorizados para acceder a los tableros de cohorte.
          </p>
        </div>
      </div>
    </main>

    <!-- Pie de Página -->
    <footer class="text-center text-xs text-slate-500 pb-safe">
      <p>EmprendeApp &bull; Plataforma de Formulación de Planes de Negocio</p>
    </footer>
  </div>
</template>
