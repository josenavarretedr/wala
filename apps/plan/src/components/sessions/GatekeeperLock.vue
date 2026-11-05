<script setup>
import { useRouter } from 'vue-router';
import AppButton from '@/components/common/AppButton.vue';

const props = defineProps({
  sessionId: {
    type: Number,
    required: true
  },
  sessionTitle: {
    type: String,
    default: 'Módulo'
  }
});

const router = useRouter();

function goToPrevious() {
  if (props.sessionId > 1) {
    router.push(`/sesiones/${props.sessionId - 1}`);
  } else {
    router.push('/');
  }
}
</script>

<template>
  <div class="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm text-center space-y-4 my-6">
    <div class="w-16 h-16 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center mx-auto text-3xl shadow-inner border border-slate-200">
      🔒
    </div>

    <div>
      <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 mb-2">
        Módulo Bloqueado
      </span>
      <h3 class="text-xl font-extrabold text-slate-900 tracking-tight">
        Sesión {{ sessionId }}: {{ sessionTitle }}
      </h3>
      <p class="text-sm text-slate-600 mt-2 max-w-xs mx-auto leading-relaxed">
        Para desbloquear este módulo, primero debes completar el <strong>Quiz de la Sesión {{ sessionId - 1 }} con 100%</strong> de aciertos y guardar su formulario correspondiente.
      </p>
    </div>

    <div class="pt-3 space-y-2 max-w-xs mx-auto">
      <AppButton
        v-if="sessionId > 1"
        variant="primary"
        @click="goToPrevious"
      >
        Ir a Sesión {{ sessionId - 1 }} →
      </AppButton>

      <AppButton
        variant="outline"
        @click="router.push('/')"
      >
        Volver al Panel Principal
      </AppButton>
    </div>
  </div>
</template>
