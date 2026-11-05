<script setup>
import { ref, computed } from 'vue';
import { httpsCallable } from 'firebase/functions';
import { functions, auth } from '@/services/firebase';
import { useAuthStore } from '@/stores/auth';

const props = defineProps({
  dni: {
    type: String,
    required: true
  },
  commercialName: {
    type: String,
    default: ''
  }
});

const authStore = useAuthStore();

const isSubmitting = ref(false);
const errorMsg = ref('');
const showRegisterModal = ref(false);

const email = ref('');
const password = ref('');

const isAlreadyConverted = computed(() => {
  return authStore.currentParticipant?.programStatus?.status === 'convertido_wala' ||
         Boolean(authStore.currentParticipant?.businessId);
});

const existingBusinessId = computed(() => {
  return authStore.currentParticipant?.businessId;
});

async function handleStartActivation() {
  errorMsg.value = '';

  // Si ya tiene negocio enlazado, redirigir directamente
  if (existingBusinessId.value) {
    const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const baseUrl = isDev ? 'http://localhost:5173' : 'https://wala.lat';
    window.open(`${baseUrl}/business/${existingBusinessId.value}/dashboard`, '_blank');
    return;
  }

  // Si el usuario ya está autenticado con Firebase (ej. vino con sesión de Google o Email)
  if (auth.currentUser && !auth.currentUser.isAnonymous) {
    await submitActivation({ userId: auth.currentUser.uid });
  } else {
    // Si está en modo anónimo / DNI, solicitar email y contraseña para crear su cuenta de Wala
    showRegisterModal.value = true;
  }
}

async function handleModalSubmit() {
  if (!email.value || !password.value) {
    errorMsg.value = 'Por favor ingresa tu correo y contraseña para crear tu acceso a Wala.';
    return;
  }
  if (password.value.length < 6) {
    errorMsg.value = 'La contraseña debe tener al menos 6 caracteres.';
    return;
  }

  await submitActivation({
    email: email.value,
    password: password.value,
    displayName: authStore.participantName
  });
}

async function submitActivation(payload = {}) {
  isSubmitting.value = true;
  errorMsg.value = '';

  try {
    const activateFn = httpsCallable(functions, 'activateBusinessFromPlan');
    const result = await activateFn({
      dni: props.dni,
      ...payload
    });

    const data = result.data;
    if (data?.success && data?.businessId) {
      // Actualizar estado local del participante
      if (authStore.currentParticipant) {
        authStore.currentParticipant.businessId = data.businessId;
        if (authStore.currentParticipant.programStatus) {
          authStore.currentParticipant.programStatus.status = 'convertido_wala';
        }
      }
      showRegisterModal.value = false;

      // Redirigir al ERP de Wala
      const targetUrl = data.redirectUrl || `https://wala.lat/business/${data.businessId}/dashboard`;
      window.location.href = targetUrl;
    } else {
      errorMsg.value = 'No se pudo activar el negocio. Inténtalo nuevamente.';
    }
  } catch (err) {
    console.error('[WalaActivationBridge] Error activando negocio:', err);
    errorMsg.value = err.message || 'Ocurrió un error al conectar con Wala.';
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 via-orange-600 to-red-600 p-5 text-white shadow-lg">
    <div class="relative z-10 space-y-3">
      <div class="flex items-center justify-between">
        <span class="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-white/20 text-white backdrop-blur-xs border border-white/30 uppercase tracking-wider">
          <span>🚀</span> Escalera de Crecimiento
        </span>
        <span v-if="isAlreadyConverted" class="text-xs font-bold bg-emerald-500/80 px-2.5 py-0.5 rounded-full text-white">
          Negocio Activo en Wala ✓
        </span>
      </div>

      <div>
        <h3 class="text-lg font-extrabold tracking-tight">
          {{ isAlreadyConverted ? 'Tu negocio ya está en marcha en Wala' : '¡Pasa del Papel a la Acción!' }}
        </h3>
        <p class="text-xs text-white/90 mt-1 leading-relaxed">
          {{ isAlreadyConverted 
            ? 'Tu plan está sincronizado con tu negocio en Wala. Ingresa para registrar tus ventas y caja diaria.' 
            : 'Un plan de negocio cobra vida cuando vendes y cobras. Activa tu negocio en Wala gratis y lleva el control diario de tu caja, ventas e inventario desde tu celular.' 
          }}
        </p>
      </div>

      <div class="pt-1">
        <button
          @click="handleStartActivation"
          :disabled="isSubmitting"
          class="w-full py-3 px-4 rounded-xl font-bold text-sm bg-white text-orange-600 shadow-md hover:bg-orange-50 active:scale-[0.99] transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
        >
          <span v-if="isSubmitting" class="animate-spin text-base">⏳</span>
          <span v-else>🚀</span>
          <span>
            {{ isAlreadyConverted 
              ? 'Abrir mi Negocio en Wala' 
              : 'Activar mi Negocio en Wala Gratis' 
            }}
          </span>
        </button>
      </div>

      <div v-if="errorMsg && !showRegisterModal" class="text-xs text-red-100 bg-red-900/40 p-2.5 rounded-lg border border-red-300/30">
        {{ errorMsg }}
      </div>
    </div>

    <!-- Fondo decorativo -->
    <div class="absolute -right-8 -top-8 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>

    <!-- Modal para crear cuenta de Wala si estaba en modo DNI -->
    <div v-if="showRegisterModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs text-slate-800">
      <div class="bg-white rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <div class="flex items-center gap-2">
            <span class="text-xl">🚀</span>
            <h4 class="font-bold text-slate-900 text-sm">Crea tu cuenta de Wala</h4>
          </div>
          <button @click="showRegisterModal = false" class="text-slate-400 hover:text-slate-600 text-lg font-bold">
            &times;
          </button>
        </div>

        <p class="text-xs text-slate-600">
          Tu plan para <strong>{{ commercialName || 'tu negocio' }}</strong> se creará automáticamente en Wala. Solo ingresa tu correo y contraseña:
        </p>

        <form @submit.prevent="handleModalSubmit" class="space-y-3">
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Correo electrónico</label>
            <input
              v-model="email"
              type="email"
              required
              placeholder="ejemplo@correo.com"
              class="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Contraseña (mínimo 6 caracteres)</label>
            <input
              v-model="password"
              type="password"
              required
              minlength="6"
              placeholder="••••••••"
              class="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          <div v-if="errorMsg" class="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200">
            {{ errorMsg }}
          </div>

          <div class="flex gap-2 pt-1">
            <button
              type="button"
              @click="showRegisterModal = false"
              class="flex-1 py-2.5 px-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="isSubmitting"
              class="flex-1 py-2.5 px-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-xs font-bold text-white shadow transition disabled:opacity-60 flex items-center justify-center gap-1.5"
            >
              <span v-if="isSubmitting" class="animate-spin text-xs">⏳</span>
              <span>Comenzar en Wala</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
