<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import AppInput from '@/components/common/AppInput.vue';
import AppButton from '@/components/common/AppButton.vue';
import SyncStatusBadge from '@/components/common/SyncStatusBadge.vue';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const dniInput = ref('');
const localError = ref(
  route.query.unauthorized === 'facilitator'
    ? 'El correo ingresado no cuenta con permisos de facilitador o consultor.'
    : ''
);

function fillDemoDni(demoValue) {
  dniInput.value = demoValue;
  localError.value = '';
}

async function handleLogin() {
  localError.value = '';
  const trimmed = dniInput.value.trim();

  if (!trimmed) {
    localError.value = 'Por favor ingresa tu número de DNI o Cédula.';
    return;
  }

  if (trimmed.length < 8 || trimmed.length > 12) {
    localError.value = 'El documento debe tener entre 8 y 12 caracteres.';
    return;
  }

  const result = await authStore.loginWithDni(trimmed);

  if (result.success) {
    const redirectPath = route.query.redirect || '/';
    router.push(redirectPath);
  } else {
    localError.value = result.message || 'No fue posible ingresar.';
  }
}
</script>

<template>
  <div class="min-h-screen flex flex-col justify-between bg-slate-50 px-4 py-8 max-w-md mx-auto w-full">
    <!-- Top Bar con estado de red -->
    <header class="flex items-center justify-between pt-safe">
      <div class="flex items-center gap-2">
        <div class="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm font-bold text-lg">
          🌱
        </div>
        <span class="font-bold text-slate-800 tracking-tight text-lg">PlanSeed</span>
      </div>
      <SyncStatusBadge />
    </header>

    <!-- Main Card Content -->
    <main class="my-auto py-8">
      <div class="text-center mb-8">
        <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          ¡Bienvenido(a)!
        </h1>
        <p class="text-slate-600 text-sm sm:text-base mt-2">
          Ingresa con tu documento de identidad para continuar con tu plan de negocio.
        </p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-5 bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80">
        <AppInput
          id="dni-field"
          v-model="dniInput"
          label="DNI o Cédula de Identidad"
          placeholder="Ej: 45892134"
          inputmode="numeric"
          autocomplete="username"
          maxlength="12"
          :error="localError || authStore.error"
          hint="Ingresa tu documento pre-registrado o continúa offline."
        />

        <AppButton
          type="submit"
          variant="primary"
          :loading="authStore.isLoading"
        >
          Ingresar al Programa
        </AppButton>

        <!-- Demostración / Acceso Rápido -->
        <div class="pt-3 border-t border-slate-100">
          <p class="text-xs font-medium text-slate-500 mb-2 text-center">
            Prueba rápida de demostración:
          </p>
          <div class="flex flex-wrap gap-2 justify-center">
            <button
              type="button"
              @click="fillDemoDni('45892134')"
              class="px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold border border-blue-200 transition-colors"
            >
              Demo: María Flores (45892134)
            </button>
            <button
              type="button"
              @click="fillDemoDni('12345678')"
              class="px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold border border-slate-200 transition-colors"
            >
              Demo: Nuevo Offline (12345678)
            </button>
          </div>
        </div>
      </form>
    </main>

    <!-- Footer informativo de accesibilidad y acceso facilitador -->
    <footer class="text-center text-xs text-slate-500 pb-safe space-y-2">
      <p class="font-medium">EmprendeApp PWA &bull; Modo Offline-First Activo</p>
      <p class="text-slate-400">No necesitas conexión continua para avanzar en tus módulos.</p>
      <div class="pt-2 border-t border-slate-200">
        <router-link
          to="/facilitador/login"
          class="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-bold hover:underline transition-colors py-1 px-2"
        >
          <span>👨‍🏫</span>
          <span>¿Eres consultor o facilitador de aula? Ingresa aquí →</span>
        </router-link>
      </div>
    </footer>
  </div>
</template>
