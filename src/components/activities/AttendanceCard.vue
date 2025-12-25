<template>
  <div
    class="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-all duration-200"
  >
    <!-- Header: Checkbox + Nombre -->
    <div class="flex items-center gap-3">
      <input
        type="checkbox"
        :checked="attendance.attended"
        @change="handleAttendanceToggle"
        class="w-6 h-6 rounded border-gray-300 text-green-600 focus:ring-2 focus:ring-green-500 cursor-pointer flex-shrink-0"
      />
      <div class="flex-1 min-w-0">
        <p class="font-medium text-gray-900 truncate">
          {{ participant.userName }}
        </p>
        <p class="text-xs text-gray-500 truncate">
          {{ participant.userEmail }}
        </p>
      </div>

      <!-- Botón Agregar Nota -->
      <button
        @click="showNotes = !showNotes"
        :class="[
          'flex-shrink-0 p-2 rounded-lg transition-all duration-200',
          showNotes || attendance.notes
            ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
            : 'bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600',
        ]"
      >
        <svg
          :class="[
            'w-5 h-5 transition-transform duration-200',
            showNotes ? 'rotate-180' : 'rotate-0',
          ]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
    </div>

    <!-- Campo de Notas (Expandible) -->
    <transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0 max-h-0"
      enter-to-class="opacity-100 max-h-32"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 max-h-32"
      leave-to-class="opacity-0 max-h-0"
    >
      <div v-if="showNotes" class="mt-3 pt-3 border-t border-gray-100">
        <textarea
          v-model="localNotes"
          @input="handleNotesChange"
          @blur="handleNotesUpdate"
          placeholder="Agregar notas opcionales..."
          rows="2"
          class="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
        ></textarea>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";

const props = defineProps({
  participant: {
    type: Object,
    required: true,
  },
  attendance: {
    type: Object,
    default: () => ({ attended: false, notes: "" }),
  },
});

const emit = defineEmits(["update"]);

const showNotes = ref(false);
const localNotes = ref(props.attendance.notes || "");

// Mostrar notas automáticamente si ya hay contenido
if (props.attendance.notes) {
  showNotes.value = true;
}

watch(
  () => props.attendance.notes,
  (newNotes) => {
    localNotes.value = newNotes || "";
  }
);

function handleAttendanceToggle(event) {
  emit("update", {
    userId: props.participant.userId,
    attended: event.target.checked,
    notes: localNotes.value,
  });
}

function handleNotesChange() {
  // Emitir cambio en tiempo real mientras se escribe
  emit("update", {
    userId: props.participant.userId,
    attended: props.attendance.attended,
    notes: localNotes.value,
  });
}

function handleNotesUpdate() {
  // Mantener blur handler para consistencia
  emit("update", {
    userId: props.participant.userId,
    attended: props.attendance.attended,
    notes: localNotes.value,
  });
}
</script>
