<script setup>
import { computed, ref } from 'vue';
import { useOfflineSync } from '@/composables/useOfflineSync';

const props = defineProps({
  pendingCount: {
    type: Number,
    default: null
  }
});

const {
  isOnline,
  isSyncing,
  pendingCount: queuePendingCount,
  isEmulator,
  triggerManualSync
} = useOfflineSync();

// Utilizar prop si se pasa explícitamente, de lo contrario usar el valor reactivo de la cola
const effectivePendingCount = computed(() => {
  if (props.pendingCount !== null && props.pendingCount !== undefined) {
    return props.pendingCount;
  }
  return queuePendingCount.value;
});

const showFeedback = ref(false);
const feedbackMessage = ref('');

async function handleBadgeClick() {
  if (isSyncing.value) return;

  if (!isOnline.value) {
    feedbackMessage.value = 'Sin conexión. Los cambios están seguros en tu teléfono.';
    showFeedback.value = true;
    setTimeout(() => {
      showFeedback.value = false;
    }, 2800);
    return;
  }

  feedbackMessage.value = 'Comprobando sincronización...';
  showFeedback.value = true;
  await triggerManualSync();
  setTimeout(() => {
    showFeedback.value = false;
  }, 2000);
}
</script>

<template>
  <div class="relative inline-flex items-center">
    <button
      type="button"
      @click="handleBadgeClick"
      class="inline-flex items-center gap-2 px-3 py-1.5 min-h-[36px] rounded-full text-xs font-semibold transition-all duration-200 border select-none focus:outline-none focus:ring-2 focus:ring-offset-1 active:scale-95"
      :class="[
        // Estado 1: Sincronizando (Azul)
        isSyncing
          ? 'bg-blue-50 text-blue-800 border-blue-200 focus:ring-blue-400'
          : !isOnline
          // Estado 2: Desconectado / Offline (Ámbar)
          ? 'bg-amber-50 text-amber-800 border-amber-300 shadow-sm focus:ring-amber-400 hover:bg-amber-100'
          // Estado 3: En línea + Sincronizado (Verde)
          : 'bg-emerald-50 text-emerald-800 border-emerald-200 focus:ring-emerald-400 hover:bg-emerald-100'
      ]"
      :title="!isOnline ? 'Toca para reintentar sincronizar' : 'Toca para verificar sincronización'"
    >
      <!-- SPINNER CUANDO ESTÁ SINCRONIZANDO -->
      <template v-if="isSyncing">
        <svg
          class="animate-spin h-3.5 w-3.5 text-blue-600"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          ></circle>
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          ></path>
        </svg>
        <span>Guardando cambios...</span>
      </template>

      <!-- INDICADOR CUANDO ESTÁ OFFLINE -->
      <template v-else-if="!isOnline">
        <span class="relative flex h-2.5 w-2.5">
          <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
        </span>
        <span>
          Sin conexión
          <template v-if="effectivePendingCount > 0">
            · {{ effectivePendingCount }} cambio{{ effectivePendingCount > 1 ? 's' : '' }} en teléfono
          </template>
        </span>
      </template>

      <!-- INDICADOR CUANDO ESTÁ ONLINE (EMULADOR O CLOUD) -->
      <template v-else>
        <span class="relative flex h-2.5 w-2.5">
          <span
            class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"
          ></span>
          <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
        </span>

        <span>
          {{ isEmulator ? 'Emulador Local Conectado' : 'Sincronizado' }}
        </span>

        <span
          v-if="effectivePendingCount > 0"
          class="ml-0.5 px-1.5 py-0.5 rounded-full bg-amber-200 text-amber-900 text-[10px] font-bold"
        >
          {{ effectivePendingCount }} pend.
        </span>
      </template>
    </button>

    <!-- MENSAJE TOAST DISCRETO AL TOCAR EL BADGE -->
    <transition
      enter-active-class="transition ease-out duration-150"
      enter-from-class="opacity-0 translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-100"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-1"
    >
      <div
        v-if="showFeedback"
        class="absolute top-full mt-1.5 left-1/2 -translate-x-1/2 z-50 whitespace-nowrap px-2.5 py-1 text-[11px] font-medium rounded shadow-md border pointer-events-none"
        :class="[
          !isOnline
            ? 'bg-amber-800 text-white border-amber-900'
            : 'bg-gray-800 text-white border-gray-900'
        ]"
      >
        {{ feedbackMessage }}
      </div>
    </transition>
  </div>
</template>
