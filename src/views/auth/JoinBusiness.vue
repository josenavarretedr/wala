<template>
  <div class="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
    <!-- Capa de fondo fija de alta resolución para coherencia visual -->
    <div class="dashboard-bg" :style="{ backgroundImage: `url(${bgWall})` }"></div>

    <div class="w-full max-w-md bg-white border border-gray-150 rounded-3xl p-6 sm:p-8 shadow-xl relative z-10 text-gray-900">
            <!-- Wala Logo -->
      <div class="flex justify-center mb-6">
        <div class="bg-[#E35336] px-4 py-2 rounded-2xl shadow-md">
          <span class="text-2xl font-black tracking-wider text-white">WALA</span>
        </div>
      </div>

      <!-- Cargando -->
      <div v-if="isLoading" class="flex flex-col items-center py-10 space-y-4">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E35336]"></div>
        <p class="text-gray-500 text-sm">Verificando tu invitación...</p>
      </div>

      <!-- Error / Invitación Inválida -->
      <div v-else-if="hasError || !invitation" class="text-center py-6 space-y-4">
        <div class="inline-flex p-4 bg-red-50 text-red-500 rounded-full mb-2">
          <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
        </div>
        <h2 class="text-xl font-bold text-gray-850">Invitación no válida</h2>
        <p class="text-gray-500 text-sm leading-relaxed max-w-sm mx-auto">
          Este enlace de invitación ha expirado, ya fue utilizado o no es correcto. Por favor, solicita una nueva invitación a tu gerente.
        </p>
        <div class="pt-4">
          <router-link to="/auth/login" class="inline-flex justify-center items-center px-6 py-3 bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 transition-colors w-full">
            Ir al Inicio
          </router-link>
        </div>
      </div>

      <!-- Invitación Válida -->
      <div v-else class="space-y-6">
        <div class="text-center space-y-2">
          <span class="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full border border-green-200">
            <span class="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping"></span>
            Enlace Activo
          </span>
          <h2 class="text-2xl font-bold tracking-tight text-gray-900">¡Te invitaron a unirte!</h2>
          <p class="text-sm text-gray-500">
            Forma parte del equipo y empieza a colaborar
          </p>
        </div>

        <!-- Tarjeta de Detalles de Invitación -->
        <div class="bg-gray-50 border border-gray-200 rounded-2xl p-5 space-y-4">
          <!-- Negocio -->
          <div class="flex items-center">
            <div class="p-2.5 bg-[#E35336]/10 text-[#E35336] rounded-xl mr-3.5 flex items-center justify-center shadow-sm">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
              </svg>
            </div>
            <div>
              <span class="text-[10px] text-gray-400 block uppercase tracking-wider font-bold">Negocio</span>
              <span class="text-lg font-extrabold text-gray-950 leading-snug">{{ invitation.businessName }}</span>
            </div>
          </div>

          <!-- Divider -->
          <div class="h-px bg-gray-200"></div>

          <!-- Rol / Puesto -->
          <div class="flex items-center">
            <div class="p-2.5 bg-purple-100 text-purple-600 rounded-xl mr-3.5 flex items-center justify-center shadow-sm">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
            </div>
            <div>
              <span class="text-[10px] text-gray-400 block uppercase tracking-wider font-bold">Tu puesto sugerido</span>
              <span class="text-lg font-extrabold text-gray-950 leading-snug">{{ invitation.rolNombre }}</span>
            </div>
          </div>
        </div>

        <!-- Acciones -->
        <div class="space-y-3 pt-2">
          <button @click="navigateToRegister" class="w-full py-3.5 px-4 bg-[#E35336] hover:bg-[#c2412b] text-white font-bold rounded-xl shadow-md active:scale-[0.98] transition-all text-sm flex items-center justify-center gap-2">
            <span>Crear cuenta nueva</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
            </svg>
          </button>
          
          <button @click="navigateToLogin" class="w-full py-3.5 px-4 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-bold rounded-xl shadow-sm active:scale-[0.98] transition-all text-sm">
            Ya tengo una cuenta, iniciar sesión
          </button>
        </div>

        <p class="text-center text-xs text-gray-400 leading-relaxed pt-2 font-medium">
          Al unirte, podrás acceder a los módulos de {{ invitation.businessName }} autorizados por tu gerente.
        </p>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useInvitationStore } from '@/stores/invitationStore';
import bgWall from "@/assets/bg_wall.png";

const route = useRoute();
const router = useRouter();
const invitationStore = useInvitationStore();

const isLoading = ref(true);
const hasError = ref(false);
const invitation = ref(null);

onMounted(async () => {
  try {
    const token = route.params.token;
    if (!token) {
      hasError.value = true;
      isLoading.value = false;
      return;
    }
    const data = await invitationStore.getInvitationByToken(token);
    if (!data) {
      hasError.value = true;
    } else {
      invitation.value = data;
    }
  } catch (err) {
    console.error('Error verifying invitation token:', err);
    hasError.value = true;
  } finally {
    isLoading.value = false;
  }
});

function navigateToRegister() {
  router.push({
    path: '/auth/register',
    query: { invite: route.params.token }
  });
}

function navigateToLogin() {
  router.push({
    path: '/auth/login',
    query: { invite: route.params.token }
  });
}
</script>

<style scoped>
.dashboard-bg {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  z-index: -10;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  pointer-events: none;
  /* GPU-accelerated layer for smooth scrolling performance */
  transform: translate3d(0, 0, 0);
  will-change: transform;
}
</style>
