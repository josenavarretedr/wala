<template>
  <div
    class="fixed bottom-0 left-0 right-0 z-50 p-3 bg-white/95 backdrop-blur-sm rounded-t-2xl shadow-xl border-t border-gray-100"
  >
    <!-- Botón para Sesiones y Eventos: Guardar Asistencias -->
    <button
      v-if="type === 'session' || type === 'event'"
      @click="handleSave"
      :disabled="!hasPendingChanges || saving"
      :class="[
        'w-full py-3 rounded-xl font-semibold transition-all duration-200',
        hasPendingChanges && !saving
          ? 'bg-green-600 text-white hover:bg-green-700 shadow-sm'
          : 'bg-gray-200 text-gray-400 cursor-not-allowed',
      ]"
    >
      <span v-if="saving" class="flex items-center justify-center gap-2">
        <div
          class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"
        ></div>
        <span>Guardando...</span>
      </span>
      <span
        v-else-if="hasPendingChanges"
        class="flex items-center justify-center gap-2"
      >
        <svg
          class="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M5 13l4 4L19 7"
          />
        </svg>
        <span>Guardar Asistencias ({{ pendingCount }})</span>
      </span>
      <span v-else>Sin cambios pendientes</span>
    </button>

    <!-- Botón para Asesoría: Nueva Asesoría -->
    <button
      v-else-if="type === 'consulting'"
      @click="handleNewConsulting"
      class="w-full py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-all duration-200 shadow-sm flex items-center justify-center gap-2"
    >
      <svg
        class="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 4v16m8-8H4"
        />
      </svg>
      <span>Nueva Asesoría</span>
    </button>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  type: {
    type: String,
    required: true,
    validator: (value) => ["session", "event", "consulting"].includes(value),
  },
  pendingChanges: {
    type: Object,
    default: () => ({}),
  },
  saving: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["save", "new-consulting"]);

const hasPendingChanges = computed(() => {
  return Object.keys(props.pendingChanges).length > 0;
});

const pendingCount = computed(() => {
  return Object.keys(props.pendingChanges).length;
});

function handleSave() {
  if (hasPendingChanges.value && !props.saving) {
    emit("save", props.pendingChanges);
  }
}

function handleNewConsulting() {
  emit("new-consulting");
}
</script>
